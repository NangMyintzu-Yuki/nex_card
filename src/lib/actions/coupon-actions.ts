"use server";

import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const createCouponSchema = z.object({
  code: z.string().min(2).max(30).transform((v) => v.toUpperCase().trim()),
  categoryId: z.string().min(1),
  discountQrOnly: z.number().min(0).max(100),
  discountNfcQr: z.number().min(0).max(100),
  expiresAt: z.string().optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
});

export async function createCouponAction(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = createCouponSchema.safeParse({
    code: formData.get("code"),
    categoryId: formData.get("categoryId"),
    discountQrOnly: Number(formData.get("discountQrOnly")),
    discountNfcQr: Number(formData.get("discountNfcQr")),
    expiresAt: formData.get("expiresAt") || null,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return { error: { code: ["Coupon code already exists"] } };
  }

  const coupon = await prisma.coupon.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return { success: true, coupon };
}

export async function updateCouponAction(couponId: string, formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const data: Record<string, unknown> = {};

  const code = formData.get("code");
  if (code) data.code = String(code).toUpperCase().trim();

  const categoryId = formData.get("categoryId");
  if (categoryId) data.categoryId = String(categoryId);

  if (formData.has("discountQrOnly")) data.discountQrOnly = Number(formData.get("discountQrOnly"));
  if (formData.has("discountNfcQr")) data.discountNfcQr = Number(formData.get("discountNfcQr"));
  if (formData.has("isActive")) data.isActive = formData.get("isActive") === "true";

  const expiresAt = formData.get("expiresAt");
  data.expiresAt = expiresAt ? new Date(String(expiresAt)) : null;

  if (formData.has("maxUses")) {
    const mu = formData.get("maxUses");
    data.maxUses = mu ? Number(mu) : null;
  }

  const coupon = await prisma.coupon.update({
    where: { id: couponId },
    data,
  });

  return { success: true, coupon };
}

export async function deleteCouponAction(couponId: string) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.coupon.delete({ where: { id: couponId } });
  return { success: true };
}

export async function toggleCouponActive(couponId: string) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) return { error: "Not found" };

  const updated = await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive: !coupon.isActive },
  });

  return { success: true, coupon: updated };
}

/** Validate a coupon code for a specific category + tier. Used by payment form. */
export async function validateCoupon(code: string, categoryId: string, tier: "QR_ONLY" | "NFC_QR") {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon) return { valid: false, error: "Invalid coupon code" };
  if (!coupon.isActive) return { valid: false, error: "This coupon is inactive" };
  if (coupon.categoryId !== categoryId) return { valid: false, error: "This coupon is not valid for this category" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, error: "This coupon has expired" };
  if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) return { valid: false, error: "This coupon has reached its usage limit" };

  const discountPct = tier === "QR_ONLY" ? coupon.discountQrOnly : coupon.discountNfcQr;
  if (discountPct <= 0) return { valid: false, error: `No discount for ${tier === "QR_ONLY" ? "QR Only" : "NFC + QR"} tier` };

  return {
    valid: true,
    code: coupon.code,
    discountPct,
    discountAmount: 0, // will be calculated client-side with price
  };
}
