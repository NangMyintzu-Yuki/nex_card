// src/lib/actions/qr-actions.ts
// Server Action — Generate QR code and lock the profile permanently

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { purgeProfileCache } from "@/lib/cache/profile-cache";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type GenerateQRState =
  | { status: "idle" }
  | { status: "success"; slug: string; qrGeneratedAt: string; alreadyLocked: boolean }
  | { status: "error"; message: string };

const GenerateQRInput = z.object({
  profileId: z.string().cuid(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Generate QR — locks profile permanently on first call
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Business rules enforced here:
 * 1. Profile must belong to the requesting user.
 * 2. Profile must be PUBLISHED before a QR can be generated.
 * 3. On first generation: sets qrLocked=true, qrGeneratedAt=now.
 *    After this point: templateId and categoryId are immutable (enforced in
 *    updateProfileAction and selectTemplateAction).
 * 4. Subsequent calls return the existing lock timestamp (idempotent).
 */
export async function generateQRAction(
  _prev: GenerateQRState,
  formData: FormData
): Promise<GenerateQRState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }

  const parsed = GenerateQRInput.safeParse({ profileId: formData.get("profileId") });
  if (!parsed.success) {
    return { status: "error", message: "Invalid profile ID." };
  }

  // Fetch the profile — must belong to this user
  const profile = await prisma.userProfile.findFirst({
    where: { id: parsed.data.profileId, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      qrLocked: true,
      qrGeneratedAt: true,
      templateLocked: true,
    },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  if (!profile.isPublished) {
    return {
      status: "error",
      message: "Your profile must be published before you can generate a QR code. Enable publishing in the editor first.",
    };
  }

  // If already locked — idempotent: return existing data
  if (profile.qrLocked && profile.qrGeneratedAt) {
    return {
      status: "success",
      slug: profile.slug,
      qrGeneratedAt: profile.qrGeneratedAt?.toISOString(),
      alreadyLocked: true,
    };
  }

  // First generation — lock the profile permanently
  const now = new Date();

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      qrLocked: true,
      qrGeneratedAt: now,
      // Ensure template is also locked (redundant safety)
      templateLocked: true,
    },
  });

  // Purge ISR cache so the public page reflects the locked state
  await purgeProfileCache(profile.slug, session.user.id);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/qr/${profile.slug}`);

  return {
    status: "success",
    slug: profile.slug,
    qrGeneratedAt: now.toISOString(),
    alreadyLocked: false,
  };
}
