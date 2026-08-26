// src/lib/actions/nfc-action.ts
// Server actions for NFC tag programming workflow

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { APP_URL } from "@/lib/env";
import { isMaintenanceMode, MAINTENANCE_MESSAGE } from "@/lib/security/maintenance";

const MarkNfcInput = z.object({
  profileId: z.string().cuid(),
});

export type MarkNfcState =
  | { status: "idle" }
  | { status: "success"; nfcWriteCount: number; nfcProgrammedAt: string }
  | { status: "error"; message: string };

/**
 * Records that the user has programmed their NFC tag with the profile URL.
 * Requires an NFC-tier payment (NFC_CARD or PHYSICAL_CARD) with APPROVED status.
 */
export async function markNfcProgrammedAction(
  _prev: MarkNfcState,
  formData: FormData
): Promise<MarkNfcState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }
  if (isMaintenanceMode() && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: MAINTENANCE_MESSAGE };
  }

  const parsed = MarkNfcInput.safeParse({ profileId: formData.get("profileId") });
  if (!parsed.success) {
    return { status: "error", message: "Invalid profile ID." };
  }

  const profile = await prisma.userProfile.findFirst({
    where: { id: parsed.data.profileId, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      paymentStatus: true,
      nfcWriteCount: true,
      payment: { select: { tier: true, status: true } },
    },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  if (!profile.isPublished) {
    return {
      status: "error",
      message: "Publish your profile before programming an NFC tag.",
    };
  }

  if (profile.paymentStatus !== "APPROVED") {
    return {
      status: "error",
      message: "Payment must be approved before programming NFC tags.",
    };
  }

  const tier = profile.payment?.tier;
  if (tier !== "NFC_QR") {
    return {
      status: "error",
      message: "Your payment tier does not include NFC. Upgrade to NFC + QR.",
    };
  }

  const now = new Date();

  const updated = await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      nfcProgrammedAt: now,
      nfcWriteCount: { increment: 1 },
      nfcFulfillment: "PROGRAMMED",
    },
    select: { nfcWriteCount: true, nfcProgrammedAt: true },
  });

  revalidatePath("/dashboard/analytics");
  revalidatePath(`/dashboard/nfc/${profile.slug}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    nfcWriteCount: Number(updated.nfcWriteCount),
    nfcProgrammedAt: updated.nfcProgrammedAt!.toISOString(),
  };
}

/** Returns the URL users should write to their NFC tag */
export async function getNfcProfileUrl(slug: string): Promise<string> {
  return `${APP_URL}/n/${slug}`;
}

const FulfillmentInput = z.object({
  profileId: z.string().cuid(),
  status: z.enum(["PENDING_WRITE", "PROGRAMMED", "SHIPPED"]),
});

export type FulfillmentState =
  | { status: "idle" }
  | { status: "success"; fulfillment: string }
  | { status: "error"; message: string };

/** Owner or admin updates NFC fulfillment pipeline status */
export async function updateNfcFulfillmentAction(
  _prev: FulfillmentState,
  formData: FormData
): Promise<FulfillmentState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }
  if (isMaintenanceMode() && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: MAINTENANCE_MESSAGE };
  }

  const parsed = FulfillmentInput.safeParse({
    profileId: formData.get("profileId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid input." };
  }

  if (parsed.data.status === "SHIPPED" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: "Only admins can mark an NFC card as shipped." };
  }

  const profile = await prisma.userProfile.findFirst({
    where:
      session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        ? { id: parsed.data.profileId }
        : { id: parsed.data.profileId, userId: session.user.id },
    select: { id: true, slug: true },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      nfcFulfillment: parsed.data.status,
      ...(parsed.data.status === "PROGRAMMED"
        ? { nfcProgrammedAt: new Date(), nfcWriteCount: { increment: 1 } }
        : {}),
    },
  });

  revalidatePath(`/dashboard/nfc/${profile.slug}`);
  revalidatePath("/dashboard");

  return { status: "success", fulfillment: parsed.data.status };
}
