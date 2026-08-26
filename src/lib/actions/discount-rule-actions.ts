"use server";

import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["COMPANY", "BULK"]),
  percentage: z.number().min(0.1).max(100),
  minQuantity: z.number().int().min(1).optional().nullable(),
});

export async function createDiscountRuleAction(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = createRuleSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    percentage: Number(formData.get("percentage")),
    minQuantity: formData.get("minQuantity") ? Number(formData.get("minQuantity")) : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const rule = await prisma.discountRule.create({ data: parsed.data });
  return { success: true, rule };
}

export async function updateDiscountRuleAction(ruleId: string, formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const data: Record<string, unknown> = {};
  const name = formData.get("name");
  if (name) data.name = String(name);
  if (formData.has("percentage")) data.percentage = Number(formData.get("percentage"));
  if (formData.has("minQuantity")) {
    const mq = formData.get("minQuantity");
    data.minQuantity = mq ? Number(mq) : null;
  }
  if (formData.has("isActive")) data.isActive = formData.get("isActive") === "true";

  const rule = await prisma.discountRule.update({ where: { id: ruleId }, data });
  return { success: true, rule };
}

export async function deleteDiscountRuleAction(ruleId: string) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }
  await prisma.discountRule.delete({ where: { id: ruleId } });
  return { success: true };
}

export async function toggleDiscountRuleActive(ruleId: string) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }
  const rule = await prisma.discountRule.findUnique({ where: { id: ruleId } });
  if (!rule) return { error: "Not found" };
  const updated = await prisma.discountRule.update({
    where: { id: ruleId },
    data: { isActive: !rule.isActive },
  });
  return { success: true, rule: updated };
}
