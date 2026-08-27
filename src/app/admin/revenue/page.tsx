// src/app/admin/revenue/page.tsx — Revenue Reporting Dashboard
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { RevenueClient } from "./_components/revenue-client";

export const metadata: Metadata = { title: "Revenue Reports" };
export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin/security");

  const [categories, templates] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.template.findMany({
      where: { isActive: true },
      select: { id: true, name: true, codeIdentifier: true, categoryId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl nc-page">
      <RevenueClient categories={categories} templates={templates} />
    </div>
  );
}
