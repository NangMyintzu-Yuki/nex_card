// src/lib/actions/payment-actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { isOwnedPaymentScreenshotUrl } from "@/lib/security/payment-url";
import { isMaintenanceMode, MAINTENANCE_MESSAGE } from "@/lib/security/maintenance";

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
  tier: z.enum(["QR_ONLY", "NFC_QR"]),
  amount: z.number().positive(),
  screenshotUrl: z.string().min(1, "Screenshot is required"),
  method: z.enum(["KBZPay", "WavePay", "AYAPay", "CBPay", "OTHER"]).default("KBZPay"),
  transactionRef: z.string().max(120).optional().or(z.literal("")),
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
    if (isMaintenanceMode()) {
      return { status: "error", message: MAINTENANCE_MESSAGE };
    }
    const userId = session.user.id;

    const raw = {
      profileId: formData.get("profileId") as string,
      tier: formData.get("tier") as string,
      amount: Number(formData.get("amount")),
      screenshotUrl: formData.get("screenshotUrl") as string,
      method: (formData.get("method") as string) || "KBZPay",
      transactionRef: (formData.get("transactionRef") as string) || "",
      originalPrice: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null,
      couponCode: (formData.get("couponCode") as string) || null,
      discountPct: formData.get("discountPct") ? Number(formData.get("discountPct")) : null,
    };

    const parsed = SubmitPaymentInput.safeParse(raw);
    if (!parsed.success) {
      return {
        status: "error",
        message: "Invalid payment data. Please try again.",
      };
    }

    const { profileId, tier, amount, screenshotUrl, method, transactionRef } =
      parsed.data;
    const { originalPrice, couponCode, discountPct } = raw;

    if (!isOwnedPaymentScreenshotUrl(screenshotUrl, userId)) {
      return {
        status: "error",
        message:
          "Invalid payment screenshot. Upload a new screenshot and try again.",
      };
    }

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
    else if (tier === "NFC_QR") expectedPrice = template.priceNfcQr;

    if (expectedPrice === null) {
      return { status: "error", message: "This tier is not available for the selected template." };
    }

    // Validate coupon and compute expected discounted price
    let finalExpectedPrice = expectedPrice;
    let couponRecord = null;

    if (couponCode && discountPct && discountPct > 0) {
      couponRecord = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (!couponRecord) {
        return { status: "error", message: "Invalid coupon code." };
      }
      if (!couponRecord.isActive) {
        return { status: "error", message: "This coupon is inactive." };
      }
      if (couponRecord.categoryId !== profile.categoryId) {
        return { status: "error", message: "Coupon is not valid for this category." };
      }
      if (couponRecord.expiresAt && couponRecord.expiresAt < new Date()) {
        return { status: "error", message: "This coupon has expired." };
      }
      if (couponRecord.maxUses && couponRecord.usageCount >= couponRecord.maxUses) {
        return { status: "error", message: "This coupon has reached its usage limit." };
      }

      const validDiscount = tier === "QR_ONLY" ? couponRecord.discountQrOnly : couponRecord.discountNfcQr;
      if (validDiscount <= 0) {
        return { status: "error", message: "No discount available for this tier." };
      }

      finalExpectedPrice = Math.round(expectedPrice * (1 - validDiscount / 100));
    }

    if (Math.abs(amount - finalExpectedPrice) > 0.01) {
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
            tier: tier as "QR_ONLY" | "NFC_QR",
            amount,
            originalPrice: couponRecord ? expectedPrice : null,
            discountPct: couponRecord ? discountPct : null,
            couponCode: couponRecord ? couponRecord.code : null,
            couponId: couponRecord?.id ?? null,
            method,
            transactionRef: transactionRef || null,
            screenshotUrl,
            status: "PENDING",
          },
        });

        // Increment coupon usage count
        if (couponRecord) {
          await tx.coupon.update({
            where: { id: couponRecord.id },
            data: { usageCount: { increment: 1 } },
          });
        }

        // Update profile payment status
        await tx.userProfile.update({
          where: { id: profileId },
          data: {
            paymentStatus: "PENDING",
            ...(tier === "NFC_QR"
              ? { nfcFulfillment: "PENDING_WRITE" as const }
              : {}),
          },
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
          originalPrice: couponRecord ? expectedPrice : null,
          discountPct: couponRecord ? discountPct : null,
          couponCode: couponRecord ? couponRecord.code : null,
          couponId: couponRecord?.id ?? null,
          method,
          transactionRef: transactionRef || null,
          screenshotUrl,
          status: "PENDING",
        },
      });

      if (couponRecord) {
        await prisma.coupon.update({
          where: { id: couponRecord.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      await prisma.userProfile.update({
        where: { id: profileId },
        data: {
          paymentStatus: "PENDING",
          ...(tier === "NFC_QR"
            ? { nfcFulfillment: "PENDING_WRITE" as const }
            : {}),
        },
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
