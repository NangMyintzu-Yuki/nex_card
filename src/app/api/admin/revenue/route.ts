// src/app/api/admin/revenue/route.ts — Revenue data API
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const where: Record<string, unknown> = {};

  // Status filter
  const status = searchParams.get("status");
  if (status && status !== "ALL") {
    where.status = status;
  }

  // Tier filter
  const tier = searchParams.get("tier");
  if (tier && tier !== "ALL") {
    where.tier = tier;
  }

  // Category filter
  const category = searchParams.get("category");
  if (category && category !== "ALL") {
    where.userProfile = { ...where.userProfile as Record<string, unknown>, categoryId: category };
  }

  // Template filter
  const template = searchParams.get("template");
  if (template && template !== "ALL") {
    where.userProfile = { ...where.userProfile as Record<string, unknown>, templateId: template };
  }

  // Date range
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      userProfile: {
        select: {
          slug: true,
          category: { select: { name: true } },
          template: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = payments.map((p) => ({
    id: p.id,
    userName: p.user.name ?? "Unknown",
    userEmail: p.user.email,
    profileSlug: p.userProfile?.slug ?? "—",
    categoryName: p.userProfile?.category?.name ?? "—",
    templateName: p.userProfile?.template?.name ?? "—",
    tier: p.tier,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));

  // Stats — use same date filter but no category/template/tier/status filter
  const statsWhere: Record<string, unknown> = {};
  if (from || to) {
    statsWhere.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
    };
  }
  const allPayments = await prisma.payment.findMany({
    where: statsWhere,
    select: { tier: true, amount: true, status: true },
  });

  const approvedRevenue = allPayments
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = allPayments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRevenue = approvedRevenue + pendingRevenue;

  const byTier: Record<string, { count: number; revenue: number }> = {};
  for (const p of allPayments) {
    if (!byTier[p.tier]) byTier[p.tier] = { count: 0, revenue: 0 };
    byTier[p.tier].count++;
    if (p.status === "APPROVED") byTier[p.tier].revenue += p.amount;
  }

  return NextResponse.json({
    payments: rows,
    stats: {
      totalRevenue,
      approvedRevenue,
      pendingRevenue,
      totalTransactions: allPayments.length,
      byTier,
    },
  });
}
