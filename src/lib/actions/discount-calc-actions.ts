"use server";

import prisma from "@/lib/db/prisma";

type DiscountRule = {
  id: string;
  name: string;
  type: string;
  percentage: number;
  minQuantity: number | null;
};

type DiscountBreakdown = {
  company: number;
  bulk: number;
  coupon: number;
  totalPct: number;
};

/**
 * Calculate automatic discount rules for a user.
 * COMPANY: if companyName is provided → percentage discount
 * BULK: if user has >= minQuantity existing profiles in category → percentage discount
 */
export async function calculateAutomaticDiscounts(params: {
  companyName?: string;
  categoryId?: string;
  userId?: string;
}): Promise<{ companyPct: number; bulkPct: number; appliedRules: DiscountRule[] }> {
  const rules = await prisma.discountRule.findMany({
    where: { isActive: true },
  });

  let companyPct = 0;
  let bulkPct = 0;
  const appliedRules: DiscountRule[] = [];

  for (const rule of rules) {
    if (rule.type === "COMPANY" && params.companyName && params.companyName.trim().length > 0) {
      companyPct += rule.percentage;
      appliedRules.push(rule);
    }

    if (rule.type === "BULK" && params.userId && params.categoryId && rule.minQuantity) {
      const profileCount = await prisma.userProfile.count({
        where: {
          userId: params.userId,
          categoryId: params.categoryId,
        },
      });
      if (profileCount >= rule.minQuantity) {
        bulkPct += rule.percentage;
        appliedRules.push(rule);
      }
    }
  }

  return { companyPct, bulkPct, appliedRules };
}

/**
 * Combine automatic + coupon discounts. Total capped at 50%.
 */
export async function combineDiscounts(params: {
  companyPct: number;
  bulkPct: number;
  couponPct: number;
}): Promise<DiscountBreakdown> {
  const totalPct = Math.min(
    params.companyPct + params.bulkPct + params.couponPct,
    50
  );

  return {
    company: params.companyPct,
    bulk: params.bulkPct,
    coupon: params.couponPct,
    totalPct,
  };
}

/**
 * Increment appliedCount for each rule that was used.
 */
export async function incrementAppliedCounts(ruleIds: string[]) {
  if (ruleIds.length === 0) return;
  await prisma.discountRule.updateMany({
    where: { id: { in: ruleIds } },
    data: { appliedCount: { increment: 1 } },
  });
}

/**
 * Save company info to user's most recent profile.
 * Called when user enters a company name during payment.
 */
export async function saveCompanyInfo(params: {
  userId: string;
  companyName: string;
}) {
  const profile = await prisma.userProfile.findFirst({
    where: { userId: params.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!profile) return;

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      companyName: params.companyName,
      companyVerified: "PENDING",
    },
  });
}

/**
 * Admin: verify or reject a user's company.
 */
export async function verifyCompanyAction(params: {
  userId: string;
  status: "VERIFIED" | "REJECTED";
}) {
  const session = await import("@/lib/auth/session").then(m => m.getServerSession());
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.userProfile.updateMany({
    where: { userId: params.userId, companyName: { not: null } },
    data: {
      companyVerified: params.status,
      companyVerifiedAt: params.status === "VERIFIED" ? new Date() : null,
    },
  });

  return { success: true };
}
