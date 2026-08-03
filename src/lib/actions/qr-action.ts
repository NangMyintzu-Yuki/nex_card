// src/lib/actions/qr-action.ts
// Server Action — Generate QR code and lock the profile permanently

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { purgeProfileCache } from "@/lib/cache/profile-cache";

export type GenerateQRState =
  | { status: "idle" }
  | { status: "success"; slug: string; qrGeneratedAt: string; alreadyLocked: boolean }
  | { status: "error"; message: string };

const GenerateQRInput = z.object({
  profileId: z.string().cuid(),
});

/**
 * Business rules:
 * 1. Profile must belong to the requesting user.
 * 2. Profile must be PUBLISHED.
 * 3. Premium templates require APPROVED payment.
 * 4. First generation locks QR permanently (idempotent thereafter).
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

  const profile = await prisma.userProfile.findFirst({
    where: { id: parsed.data.profileId, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      qrLocked: true,
      qrGeneratedAt: true,
      templateLocked: true,
      paymentStatus: true,
      template: { select: { isPremium: true } },
    },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  if (profile.template.isPremium && profile.paymentStatus !== "APPROVED") {
    return {
      status: "error",
      message:
        "Payment must be approved before generating a QR code for a premium template.",
    };
  }

  if (!profile.isPublished) {
    return {
      status: "error",
      message:
        "Your profile must be published before you can generate a QR code. Enable publishing in the editor first.",
    };
  }

  if (profile.qrLocked && profile.qrGeneratedAt) {
    return {
      status: "success",
      slug: profile.slug,
      qrGeneratedAt: profile.qrGeneratedAt?.toISOString(),
      alreadyLocked: true,
    };
  }

  const now = new Date();

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      qrLocked: true,
      qrGeneratedAt: now,
      templateLocked: true,
    },
  });

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
