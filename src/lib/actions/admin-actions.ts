// src/lib/actions/admin-actions.ts
// Server Actions for admin operations — user management, template toggling

"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache/profile-cache";

// ─────────────────────────────────────────────────────────────────────────────
// GUARD: ensure caller is ADMIN
// ─────────────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Unauthenticated.");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden: Admins only.");
  return session;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Toggle user status (ACTIVE ↔ SUSPENDED)
// ─────────────────────────────────────────────────────────────────────────────

const ToggleUserStatusInput = z.object({
  userId: z.string().cuid(),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type ToggleUserStatusState =
  | { status: "idle" }
  | { status: "success"; newStatus: string }
  | { status: "error"; message: string };

export async function toggleUserStatusAction(
  _prev: ToggleUserStatusState,
  formData: FormData
): Promise<ToggleUserStatusState> {
  try {
    await requireAdmin();

    const parsed = ToggleUserStatusInput.safeParse({
      userId: formData.get("userId"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { status: "error", message: "Invalid input." };
    }

    const { userId, status } = parsed.data;

    // Cannot suspend another admin
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (target?.role === "ADMIN") {
      return { status: "error", message: "Cannot suspend another admin account." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    revalidateTag(CACHE_TAGS.adminStats);

    return { status: "success", newStatus: status };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Toggle template active/premium status
// ─────────────────────────────────────────────────────────────────────────────

const ToggleTemplateInput = z.object({
  templateId: z.string().cuid(),
  field: z.enum(["isActive", "isPremium"]),
  value: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export type ToggleTemplateState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function toggleTemplateAction(
  _prev: ToggleTemplateState,
  formData: FormData
): Promise<ToggleTemplateState> {
  try {
    await requireAdmin();

    const parsed = ToggleTemplateInput.safeParse({
      templateId: formData.get("templateId"),
      field: formData.get("field"),
      value: formData.get("value"),
    });

    if (!parsed.success) {
      return { status: "error", message: "Invalid input." };
    }

    const { templateId, field, value } = parsed.data;

    await prisma.template.update({
      where: { id: templateId },
      data: { [field]: value },
    });

    revalidateTag(CACHE_TAGS.templates);

    return { status: "success" };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Delete a user profile (admin only)
// ─────────────────────────────────────────────────────────────────────────────

const DeleteProfileInput = z.object({
  profileId: z.string().cuid(),
});

export type DeleteProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function adminDeleteProfileAction(
  _prev: DeleteProfileState,
  formData: FormData
): Promise<DeleteProfileState> {
  try {
    await requireAdmin();

    const parsed = DeleteProfileInput.safeParse({
      profileId: formData.get("profileId"),
    });

    if (!parsed.success) {
      return { status: "error", message: "Invalid profile ID." };
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: parsed.data.profileId },
      select: { slug: true, userId: true },
    });

    if (!profile) {
      return { status: "error", message: "Profile not found." };
    }

    await prisma.userProfile.delete({
      where: { id: parsed.data.profileId },
    });

    revalidateTag(CACHE_TAGS.profile(profile.slug));
    revalidateTag(CACHE_TAGS.userProfiles(profile.userId));
    revalidateTag(CACHE_TAGS.adminStats);

    return { status: "success" };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Update account name (user settings)
// ─────────────────────────────────────────────────────────────────────────────

const UpdateAccountInput = z.object({
  name:      z.string().min(2).max(80).trim(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateAccountState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function updateAccountAction(
  _prev: UpdateAccountState,
  formData: FormData
): Promise<UpdateAccountState> {
  const session = await getServerSession();
  if (!session?.user?.id) return { status: "error", message: "Unauthorized." };

  const parsed = UpdateAccountInput.safeParse({
    name:      formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Validation failed.",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name:      parsed.data.name,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidateTag(CACHE_TAGS.userProfiles(session.user.id));

  return { status: "success" };
}
