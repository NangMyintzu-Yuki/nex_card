import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/discounts?categoryId=...&userId=...
 *
 * Returns active discount rules and which ones apply.
 * COMPANY rules always apply if they exist (admin verifies later).
 * BULK rules apply if user has enough profiles.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const rules = await prisma.discountRule.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
  });

  const applied: Array<{
    id: string;
    name: string;
    type: string;
    percentage: number;
    minQuantity: number | null;
  }> = [];

  for (const rule of rules) {
    // COMPANY: always available (applied if user enters a company name)
    if (rule.type === "COMPANY") {
      applied.push(rule);
    }

    // BULK: apply if user has enough existing profiles
    if (rule.type === "BULK" && userId && categoryId && rule.minQuantity) {
      const profileCount = await prisma.userProfile.count({
        where: { userId, categoryId },
      });
      if (profileCount >= rule.minQuantity) {
        applied.push(rule);
      }
    }
  }

  return NextResponse.json({ rules, applied });
}
