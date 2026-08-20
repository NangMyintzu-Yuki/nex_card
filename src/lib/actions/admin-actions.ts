// src/lib/actions/admin-actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit";
import { sendMail } from "@/lib/mail/mailer";
import { paymentStatusHtml } from "@/lib/mail/templates";
import { CACHE_TAGS } from "@/lib/cache/profile-cache";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AdminActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

// ─────────────────────────────────────────────────────────────────────────────
// GUARD: Admin only
// ─────────────────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<string | AdminActionState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be logged in." };
  }
  if (session.user.role !== "ADMIN") {
    return { status: "error", message: "Unauthorized." };
  }
  return session.user.id;
}

async function notifyPaymentUser(
  userId: string,
  status: "APPROVED" | "REJECTED",
  note?: string | null
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;
    await sendMail({
      to: user.email,
      subject: `NEX CARD payment ${status === "APPROVED" ? "approved" : "rejected"}`,
      html: paymentStatusHtml(user.name, status, note),
    });
  } catch (err) {
    console.error("[admin] payment notify failed", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: APPROVE PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

const ApproveInput = z.object({
  paymentId: z.string().min(1),
});

export async function approvePaymentAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const adminId = await requireAdmin();
  if (typeof adminId !== "string") return adminId;

  const parsed = ApproveInput.safeParse({
    paymentId: formData.get("paymentId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid payment ID." };
  }

  const { paymentId } = parsed.data;
  const isRealDB = !!process.env.DATABASE_URL;

  try {
    let userId: string | null = null;

    let profileSlug: string | null = null;

    if (isRealDB) {
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new Error("Payment not found");
        if (payment.status !== "PENDING") throw new Error("Payment is not pending");
        userId = payment.userId;

        const profile = await tx.userProfile.findUnique({ where: { id: payment.userProfileId }, select: { slug: true } });
        profileSlug = profile?.slug ?? null;

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: adminId,
          },
        });

        await tx.userProfile.update({
          where: { id: payment.userProfileId },
          data: { paymentStatus: "APPROVED" },
        });
      });
    } else {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return { status: "error", message: "Payment not found." };
      if (payment.status !== "PENDING") {
        return { status: "error", message: "Payment is not pending." };
      }
      userId = payment.userId;

      const profile = await prisma.userProfile.findUnique({ where: { id: payment.userProfileId }, select: { slug: true } });
      profileSlug = profile?.slug ?? null;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });

      await prisma.userProfile.update({
        where: { id: payment.userProfileId },
        data: { paymentStatus: "APPROVED" },
      });
    }

    await writeAuditLog({
      actorId: adminId,
      action: "payment.approve",
      targetType: "Payment",
      targetId: paymentId,
    });

    if (userId) void notifyPaymentUser(userId, "APPROVED");

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    if (userId) revalidateTag(CACHE_TAGS.userProfiles(userId));
    if (profileSlug) revalidateTag(CACHE_TAGS.profile(profileSlug));

    return { status: "success", message: "Payment approved. User can now edit their profile." };
  } catch (err) {
    console.error("approvePaymentAction error:", err);
    const msg = err instanceof Error ? err.message : "Failed to approve payment.";
    if (msg.includes("not pending") || msg.includes("not found")) {
      return { status: "error", message: msg };
    }
    return { status: "error", message: "Failed to approve payment." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: REJECT PAYMENT (PENDING only)
// ─────────────────────────────────────────────────────────────────────────────

const RejectInput = z.object({
  paymentId: z.string().min(1),
  adminNote: z.string().max(500).optional(),
});

export async function rejectPaymentAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const adminId = await requireAdmin();
  if (typeof adminId !== "string") return adminId;

  const parsed = RejectInput.safeParse({
    paymentId: formData.get("paymentId"),
    adminNote: formData.get("adminNote") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid input." };
  }

  const { paymentId, adminNote } = parsed.data;
  const isRealDB = !!process.env.DATABASE_URL;

  try {
    let userId: string | null = null;

    let profileSlug: string | null = null;

    if (isRealDB) {
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new Error("Payment not found");
        if (payment.status !== "PENDING") {
          throw new Error("Only pending payments can be rejected");
        }
        userId = payment.userId;

        const profile = await tx.userProfile.findUnique({ where: { id: payment.userProfileId }, select: { slug: true } });
        profileSlug = profile?.slug ?? null;

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "REJECTED",
            adminNote: adminNote || null,
            reviewedAt: new Date(),
            reviewedBy: adminId,
          },
        });

        await tx.userProfile.update({
          where: { id: payment.userProfileId },
          data: { paymentStatus: "REJECTED" },
        });
      });
    } else {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return { status: "error", message: "Payment not found." };
      if (payment.status !== "PENDING") {
        return { status: "error", message: "Only pending payments can be rejected." };
      }
      userId = payment.userId;

      const profile = await prisma.userProfile.findUnique({ where: { id: payment.userProfileId }, select: { slug: true } });
      profileSlug = profile?.slug ?? null;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          adminNote: adminNote || null,
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });

      await prisma.userProfile.update({
        where: { id: payment.userProfileId },
        data: { paymentStatus: "REJECTED" },
      });
    }

    await writeAuditLog({
      actorId: adminId,
      action: "payment.reject",
      targetType: "Payment",
      targetId: paymentId,
      meta: adminNote ? { adminNote } : undefined,
    });

    if (userId) void notifyPaymentUser(userId, "REJECTED", adminNote);

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    if (userId) revalidateTag(CACHE_TAGS.userProfiles(userId));
    if (profileSlug) revalidateTag(CACHE_TAGS.profile(profileSlug));

    return { status: "success", message: "Payment rejected." };
  } catch (err) {
    console.error("rejectPaymentAction error:", err);
    const msg = err instanceof Error ? err.message : "Failed to reject payment.";
    if (
      msg.includes("pending") ||
      msg.includes("not found") ||
      msg.includes("Only pending")
    ) {
      return { status: "error", message: msg };
    }
    return { status: "error", message: "Failed to reject payment." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: TOGGLE USER STATUS (ACTIVE/SUSPENDED)
// ─────────────────────────────────────────────────────────────────────────────

export type ToggleUserStatusState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function toggleUserStatusAction(
  _prevState: ToggleUserStatusState,
  formData: FormData
): Promise<ToggleUserStatusState> {
  const adminId = await requireAdmin();
  if (typeof adminId !== "string") return adminId;

  const parsed = z
    .object({
      userId: z.string().min(1).max(40),
      status: z.enum(["ACTIVE", "SUSPENDED"]),
    })
    .safeParse({
      userId: formData.get("userId"),
      status: formData.get("status"),
    });

  if (!parsed.success) {
    return { status: "error", message: "Missing required fields." };
  }

  const { userId, status: newStatus } = parsed.data;

  if (userId === adminId) {
    return { status: "error", message: "You cannot modify your own account." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus as "ACTIVE" | "SUSPENDED" },
    });

    await writeAuditLog({
      actorId: adminId,
      action: "user.status",
      targetType: "User",
      targetId: userId,
      meta: { status: newStatus },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { status: "success", message: `User status updated to ${newStatus}.` };
  } catch (err) {
    console.error("toggleUserStatusAction error:", err);
    return { status: "error", message: "Failed to update user status." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: TOGGLE TEMPLATE ACTIVE/PREMIUM
// ─────────────────────────────────────────────────────────────────────────────

export type ToggleTemplateState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function toggleTemplateAction(
  _prevState: ToggleTemplateState,
  formData: FormData
): Promise<ToggleTemplateState> {
  const adminId = await requireAdmin();
  if (typeof adminId !== "string") return adminId;

  const parsed = z
    .object({
      templateId: z.string().min(1).max(40),
      field: z.enum(["isActive", "isPremium"]),
      value: z.enum(["true", "false"]),
    })
    .safeParse({
      templateId: formData.get("templateId"),
      field: formData.get("field"),
      value: formData.get("value"),
    });

  if (!parsed.success) {
    return { status: "error", message: "Missing required fields." };
  }

  const { templateId, field, value } = parsed.data;

  try {
    await prisma.template.update({
      where: { id: templateId },
      data: { [field]: value === "true" },
    });

    await writeAuditLog({
      actorId: adminId,
      action: "template.toggle",
      targetType: "Template",
      targetId: templateId,
      meta: { field, value: value === "true" },
    });

    revalidatePath("/admin/templates");
    revalidatePath("/dashboard/onboarding");

    return { status: "success", message: `Template ${field} updated.` };
  } catch (err) {
    console.error("toggleTemplateAction error:", err);
    return { status: "error", message: "Failed to update template." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: UPDATE TEMPLATE PRICES
// ─────────────────────────────────────────────────────────────────────────────

const UpdatePricesInput = z.object({
  templateId: z.string().min(1),
  priceQrOnly: z.preprocess(
    (v) => (v === "" || v === null ? null : Number(v)),
    z.number().min(0).max(10_000_000).nullable()
  ),
  priceNfcQr: z.preprocess(
    (v) => (v === "" || v === null ? null : Number(v)),
    z.number().min(0).max(10_000_000).nullable()
  ),
});

export async function updateTemplatePricesAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const adminId = await requireAdmin();
  if (typeof adminId !== "string") return adminId;

  const parsed = UpdatePricesInput.safeParse({
    templateId: formData.get("templateId"),
    priceQrOnly: formData.get("priceQrOnly"),
    priceNfcQr: formData.get("priceNfcQr"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid price data." };
  }

  const { templateId, priceQrOnly, priceNfcQr } = parsed.data;

  try {
    await prisma.template.update({
      where: { id: templateId },
      data: {
        priceQrOnly,
        priceNfcQr,
      },
    });

    await writeAuditLog({
      actorId: adminId,
      action: "template.prices",
      targetType: "Template",
      targetId: templateId,
      meta: { priceQrOnly, priceNfcQr },
    });

    revalidatePath("/admin/templates");
    revalidatePath("/dashboard/onboarding");

    return { status: "success", message: "Prices updated." };
  } catch (err) {
    console.error("updateTemplatePricesAction error:", err);
    return { status: "error", message: "Failed to update prices." };
  }
}
