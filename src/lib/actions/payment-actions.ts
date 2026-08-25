// src/lib/actions/payment-actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
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
      // Coupon
      couponCode: (formData.get("couponCode") as string) || null,
      couponDiscountPct: formData.get("couponDiscountPct") ? Number(formData.get("couponDiscountPct")) : null,
      // Automatic discounts
      companyName: (formData.get("companyName") as string) || null,
      companyDiscountPct: formData.get("companyDiscountPct") ? Number(formData.get("companyDiscountPct")) : 0,
      bulkDiscountPct: formData.get("bulkDiscountPct") ? Number(formData.get("bulkDiscountPct")) : 0,
      totalDiscountPct: formData.get("totalDiscountPct") ? Number(formData.get("totalDiscountPct")) : 0,
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
    const { originalPrice, couponCode, companyName } = raw;
    const clientCompanyDiscountPct = raw.companyDiscountPct;
    const clientBulkDiscountPct = raw.bulkDiscountPct;
    const clientCouponDiscountPct = raw.couponDiscountPct;
    const clientTotalDiscountPct = raw.totalDiscountPct;

    // Mutual exclusivity: company and coupon cannot both be applied
    if (companyName && companyName.trim().length > 0 && couponCode) {
      return { status: "error", message: "You can only use either a Company discount or a Coupon, not both." };
    }

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
    let serverCouponPct = 0;
    let serverCompanyPct = 0;
    let serverBulkPct = 0;
    const discountRuleIds: string[] = [];

    // --- Validate automatic discount rules server-side ---
    const discountRules = await prisma.discountRule.findMany({
      where: { isActive: true },
    });

    for (const rule of discountRules) {
      // Company discount: apply if user provided a company name (admin verifies later)
      if (rule.type === "COMPANY" && companyName && companyName.trim().length > 0) {
        serverCompanyPct += rule.percentage;
        discountRuleIds.push(rule.id);
      }
      if (rule.type === "BULK" && rule.minQuantity) {
        const profileCount = await prisma.userProfile.count({
          where: { userId, categoryId: profile.categoryId },
        });
        if (profileCount >= rule.minQuantity) {
          serverBulkPct += rule.percentage;
          discountRuleIds.push(rule.id);
        }
      }
    }

    // --- Validate coupon server-side ---
    if (couponCode && clientCouponDiscountPct && clientCouponDiscountPct > 0) {
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
      serverCouponPct = validDiscount;
    }

    // --- Compute final expected price ---
    const serverTotalDiscountPct = Math.min(serverCompanyPct + serverBulkPct + serverCouponPct, 50);
    finalExpectedPrice = Math.round(expectedPrice * (1 - serverTotalDiscountPct / 100));

    if (Math.abs(amount - finalExpectedPrice) > 0.01) {
      return { status: "error", message: "Price mismatch. Please refresh and try again." };
    }

    const discountBreakdown = {
      company: serverCompanyPct,
      bulk: serverBulkPct,
      coupon: serverCouponPct,
      totalPct: serverTotalDiscountPct,
    } as Record<string, number>;

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
            originalPrice: serverTotalDiscountPct > 0 ? expectedPrice : null,
            discountPct: serverTotalDiscountPct > 0 ? serverTotalDiscountPct : null,
            couponCode: couponRecord ? couponRecord.code : null,
            couponId: couponRecord?.id ?? null,
            companyName: companyName?.trim() || null,
            discountBreakdown: serverTotalDiscountPct > 0 ? (discountBreakdown as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
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

        // Increment discount rule applied counts
        if (discountRuleIds.length > 0) {
          await tx.discountRule.updateMany({
            where: { id: { in: discountRuleIds } },
            data: { appliedCount: { increment: 1 } },
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
          originalPrice: serverTotalDiscountPct > 0 ? expectedPrice : null,
          discountPct: serverTotalDiscountPct > 0 ? serverTotalDiscountPct : null,
          couponCode: couponRecord ? couponRecord.code : null,
          couponId: couponRecord?.id ?? null,
          companyName: companyName?.trim() || null,
          discountBreakdown: serverTotalDiscountPct > 0 ? (discountBreakdown as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
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

      if (discountRuleIds.length > 0) {
        await prisma.discountRule.updateMany({
          where: { id: { in: discountRuleIds } },
          data: { appliedCount: { increment: 1 } },
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
