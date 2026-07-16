// src/lib/actions/nfc-action.ts
// Server actions for NFC tag programming workflow

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { APP_URL } from "@/lib/env";

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
  if (tier !== "NFC_CARD" && tier !== "PHYSICAL_CARD") {
    return {
      status: "error",
      message: "Your payment tier does not include NFC. Upgrade to NFC Only or NFC + QR.",
    };
  }

  const now = new Date();

  const updated = await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      nfcProgrammedAt: now,
      nfcWriteCount: { increment: 1 },
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
  return `${APP_URL}/p/${slug}`;
}
