// src/lib/actions/account-actions.ts
// Server Actions for user account management — password, deletion, export

"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/storage";

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Change password
// ─────────────────────────────────────────────────────────────────────────────

const ChangePasswordInput = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword:     z.string().min(8, "New password must be at least 8 characters.").max(128),
  confirmPassword: z.string().min(1),
});

export type ChangePasswordState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getServerSession();
  if (!session?.user?.id) return { status: "error", message: "Unauthorized." };

  const parsed = ChangePasswordInput.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword:     formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Validation failed." };
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "New passwords do not match." };
  }

  if (newPassword === currentPassword) {
    return { status: "error", message: "New password must be different from current password." };
  }

  // Fetch stored hash
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  });

  if (!user) return { status: "error", message: "User not found." };

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.hashedPassword);
  if (!isValid) {
    return { status: "error", message: "Current password is incorrect." };
  }

  // Hash and save new password
  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword: newHash },
  });

  // Invalidate all other sessions — force re-login on other devices
  const cookieStore = await cookies();
  const currentToken = cookieStore.get("session_token")?.value;

  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      ...(currentToken ? { sessionToken: { not: currentToken } } : {}),
    },
  });

  return { status: "success" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Update display name and avatar
// ─────────────────────────────────────────────────────────────────────────────

const UpdateProfileInfoInput = z.object({
  name:      z.string().min(2, "Name must be at least 2 characters.").max(80).trim(),
  avatarUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});

export type UpdateProfileInfoState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function updateProfileInfoAction(
  _prev: UpdateProfileInfoState,
  formData: FormData
): Promise<UpdateProfileInfoState> {
  const session = await getServerSession();
  if (!session?.user?.id) return { status: "error", message: "Unauthorized." };

  const parsed = UpdateProfileInfoInput.safeParse({
    name:      formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Validation failed." };
  }

  // Fetch current avatar to delete old one from storage
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  });

  const newAvatarUrl = parsed.data.avatarUrl || null;
  const oldAvatarUrl = currentUser?.avatarUrl;

  // Delete old avatar from R2 if it changed or was cleared
  if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
    deleteFile(oldAvatarUrl).catch(() => {});
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name:      parsed.data.name,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { status: "success" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Delete account (soft-check via "DELETE" confirmation string)
// ─────────────────────────────────────────────────────────────────────────────

const DeleteAccountInput = z.object({
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: 'Type "DELETE" exactly to confirm.' }),
  }),
});

export type DeleteAccountState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await getServerSession();
  if (!session?.user?.id) return { status: "error", message: "Unauthorized." };

  // Prevent admins from deleting their own account through the UI
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    return {
      status: "error",
      message: "Admin accounts cannot be deleted through the settings panel. Contact your system administrator.",
    };
  }

  const parsed = DeleteAccountInput.safeParse({
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return { status: "error", message: 'Type "DELETE" exactly to confirm account deletion.' };
  }

  // Delete user — cascade deletes sessions and profiles via FK constraint
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  // Clear session cookie
  const cookieStore = await cookies();
  cookieStore.delete("session_token");

  redirect("/");
}