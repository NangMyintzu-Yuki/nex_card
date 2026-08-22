import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, categoryId, tier } = body as {
      code: string;
      categoryId: string;
      tier: string;
    };

    if (!code || !categoryId || !tier) {
      return NextResponse.json({ valid: false, error: "Missing required fields" }, { status: 400 });
    }

    if (tier !== "QR_ONLY" && tier !== "NFC_QR") {
      return NextResponse.json({ valid: false, error: "Invalid tier" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
      select: {
        id: true,
        code: true,
        categoryId: true,
        discountQrOnly: true,
        discountNfcQr: true,
        expiresAt: true,
        isActive: true,
        maxUses: true,
        usageCount: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is inactive" });
    }

    if (coupon.categoryId !== categoryId) {
      return NextResponse.json({ valid: false, error: "This coupon is not valid for this category" });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" });
    }

    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
    }

    const discountPct = tier === "QR_ONLY" ? coupon.discountQrOnly : coupon.discountNfcQr;

    if (discountPct <= 0) {
      return NextResponse.json({
        valid: false,
        error: `No discount available for ${tier === "QR_ONLY" ? "QR Only" : "NFC + QR"} tier`,
      });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPct,
    });
  } catch (error) {
    console.error("[coupon-validate]", error);
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
