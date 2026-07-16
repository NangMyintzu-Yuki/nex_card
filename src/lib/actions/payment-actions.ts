// src/lib/actions/payment-actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitPaymentState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export type PaymentInfo = {
  id: string;
  tier: string;
  amount: number;
  currency: string;
  screenshotUrl: string;
  status: string;
  adminNote: string | null;
  createdAt: Date;
} | null;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const SubmitPaymentInput = z.object({
  profileId: z.string().min(1),
  tier: z.enum(["QR_ONLY", "NFC_CARD", "PHYSICAL_CARD"]),
    amount: z.number().positive(),
    // The upload route returns a local relative path (e.g. /uploads/payments/..),
    // which is not a valid absolute URL. Accept any non-empty path/URL.
    screenshotUrl: z.string().min(1, "Screenshot is required"),
  });

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT PAYMENT ACTION
// ─────────────────────────────────────────────────────────────────────────────

export async function submitPaymentAction(
  _prevState: SubmitPaymentState,
  formData: FormData
): Promise<SubmitPaymentState> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { status: "error", message: "You must be logged in." };
    }
    const userId = session.user.id;

    const raw = {
      profileId: formData.get("profileId") as string,
      tier: formData.get("tier") as string,
      amount: Number(formData.get("amount")),
      screenshotUrl: formData.get("screenshotUrl") as string,
    };

    const parsed = SubmitPaymentInput.safeParse(raw);
    if (!parsed.success) {
      return {
        status: "error",
        message: "Invalid payment data. Please try again.",
      };
    }

    const { profileId, tier, amount, screenshotUrl } = parsed.data;

    // Verify profile belongs to user and template is premium
    const profile = await prisma.userProfile.findFirst({
      where: { id: profileId, userId },
      include: { template: true, payment: true },
    });

    if (!profile) {
      return { status: "error", message: "Profile not found." };
    }

    if (profile.templateLocked && profile.paymentStatus === "APPROVED") {
      return { status: "error", message: "Payment already approved for this profile." };
    }

    if (profile.payment && profile.payment.status === "PENDING") {
      return { status: "error", message: "You already have a pending payment for this profile." };
    }

    // Verify the tier price matches the template
    const template = profile.template;
    let expectedPrice: number | null = null;
    if (tier === "QR_ONLY") expectedPrice = template.priceQrOnly;
    else if (tier === "NFC_CARD") expectedPrice = template.priceNfcCard;
    else if (tier === "PHYSICAL_CARD") expectedPrice = template.priceNfcQr;

    if (expectedPrice === null) {
      return { status: "error", message: "This tier is not available for the selected template." };
    }

    if (Math.abs(amount - expectedPrice) > 0.01) {
      return { status: "error", message: "Price mismatch. Please refresh and try again." };
    }

    // Create payment record and update profile in a transaction
    // For mock DB, we do sequential writes (mock doesn't support $transaction)
    const isRealDB = !!process.env.DATABASE_URL;

    if (isRealDB) {
      await prisma.$transaction(async (tx) => {
        // Delete any existing rejected payment for this profile
        await tx.payment.deleteMany({
          where: { userProfileId: profileId, status: "REJECTED" },
        });

        // Create new payment
        await tx.payment.create({
          data: {
            userId,
            userProfileId: profileId,
            tier: tier as any,
            amount,
            screenshotUrl,
            status: "PENDING",
          },
        });

        // Update profile payment status
        await tx.userProfile.update({
          where: { id: profileId },
          data: { paymentStatus: "PENDING" },
        });
      });
    } else {
      // Mock DB — sequential writes
      // Delete any existing rejected payment
      await prisma.payment.deleteMany({
        where: { userProfileId: profileId, status: "REJECTED" },
      });

      await prisma.payment.create({
        data: {
          userId,
          userProfileId: profileId,
          tier,
          amount,
          screenshotUrl,
          status: "PENDING",
        },
      });

      await prisma.userProfile.update({
        where: { id: profileId },
        data: { paymentStatus: "PENDING" },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/onboarding");

    return {
      status: "success",
      message: "Payment submitted! Your submission is pending admin approval.",
    };
  } catch (err) {
    console.error("submitPaymentAction error:", err);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET PAYMENT FOR PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPaymentForProfile(
  profileId: string
): Promise<PaymentInfo> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return null;

    const payment = await prisma.payment.findFirst({
      where: { userProfileId: profileId, userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) return null;

    return {
      id: payment.id,
      tier: payment.tier,
      amount: payment.amount,
      currency: payment.currency,
      screenshotUrl: payment.screenshotUrl,
      status: payment.status,
      adminNote: payment.adminNote,
      createdAt: payment.createdAt,
    };
  } catch {
    return null;
  }
}
