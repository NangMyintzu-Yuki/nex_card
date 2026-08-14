// src/lib/actions/template-admin-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

async function requireAdmin(): Promise<{ ok: true; adminId: string } | { ok: false; message: string }> {
  const session = await getServerSession();
  if (!session?.user?.id) return { ok: false, message: "You must be logged in." };
  if (session.user.role !== "ADMIN") return { ok: false, message: "Unauthorized." };
  return { ok: true, adminId: session.user.id };
}

export async function toggleTemplateField(
  templateId: string,
  field: "isActive" | "isPremium",
  value: boolean
): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  if (!templateId) return;

  try {
    await prisma.template.update({
      where: { id: templateId },
      data: { [field]: value },
    });
    revalidatePath("/admin/templates");
    revalidatePath("/dashboard/onboarding");
  } catch (err) {
    console.error("toggleTemplateField:", err);
  }
}

const PricesSchema = z.object({
  templateId: z.string().min(1),
  priceQrOnly: z.number().min(0).max(10_000_000).nullable(),
  priceNfcCard: z.number().min(0).max(10_000_000).nullable(),
  priceNfcQr: z.number().min(0).max(10_000_000).nullable(),
});

function parsePrice(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function saveTemplatePrices(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = PricesSchema.safeParse({
    templateId: formData.get("templateId"),
    priceQrOnly: parsePrice(formData.get("priceQrOnly")),
    priceNfcCard: parsePrice(formData.get("priceNfcCard")),
    priceNfcQr: parsePrice(formData.get("priceNfcQr")),
  });

  if (!parsed.success) return;

  const { templateId, priceQrOnly, priceNfcCard, priceNfcQr } = parsed.data;

  try {
    await prisma.template.update({
      where: { id: templateId },
      data: { priceQrOnly, priceNfcCard, priceNfcQr },
    });
    revalidatePath("/admin/templates");
    revalidatePath("/dashboard/onboarding");
  } catch (err) {
    console.error("saveTemplatePrices:", err);
  }
}
