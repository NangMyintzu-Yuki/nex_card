// src/lib/actions/admin-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

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
    if (isRealDB) {
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new Error("Payment not found");
        if (payment.status !== "PENDING") throw new Error("Payment is not pending");

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
      if (payment.status !== "PENDING") return { status: "error", message: "Payment is not pending." };

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

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { status: "success", message: "Payment approved. User can now edit their profile." };
  } catch (err) {
    console.error("approvePaymentAction error:", err);
    return { status: "error", message: "Failed to approve payment." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: REJECT PAYMENT
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
    if (isRealDB) {
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new Error("Payment not found");

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

    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { status: "success", message: "Payment rejected." };
  } catch (err) {
    console.error("rejectPaymentAction error:", err);
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

  const userId = formData.get("userId") as string;
  const newStatus = formData.get("status") as string;

  if (!userId || !newStatus) {
    return { status: "error", message: "Missing required fields." };
  }

  if (newStatus !== "ACTIVE" && newStatus !== "SUSPENDED") {
    return { status: "error", message: "Invalid status." };
  }

  // Prevent admin from suspending themselves
  if (userId === adminId) {
    return { status: "error", message: "You cannot modify your own account." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus as any },
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

  const templateId = formData.get("templateId") as string;
  const field = formData.get("field") as string;
  const value = formData.get("value") as string;

  if (!templateId || !field || value === undefined) {
    return { status: "error", message: "Missing required fields." };
  }

  if (field !== "isActive" && field !== "isPremium") {
    return { status: "error", message: "Invalid field." };
  }

  try {
    await prisma.template.update({
      where: { id: templateId },
      data: { [field]: value === "true" },
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
  priceQrOnly: z.preprocess((v) => v === "" || v === null ? null : Number(v), z.number().nullable()),
  priceNfcCard: z.preprocess((v) => v === "" || v === null ? null : Number(v), z.number().nullable()),
  priceNfcQr: z.preprocess((v) => v === "" || v === null ? null : Number(v), z.number().nullable()),
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
    priceNfcCard: formData.get("priceNfcCard"),
    priceNfcQr: formData.get("priceNfcQr"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid price data." };
  }

  const { templateId, priceQrOnly, priceNfcCard, priceNfcQr } = parsed.data;

  try {
    await prisma.template.update({
      where: { id: templateId },
      data: {
        priceQrOnly,
        priceNfcCard,
        priceNfcQr,
      },
    });

    revalidatePath("/admin/templates");
    revalidatePath("/dashboard/onboarding");

    return { status: "success", message: "Prices updated." };
  } catch (err) {
    console.error("updateTemplatePricesAction error:", err);
    return { status: "error", message: "Failed to update prices." };
  }
}
