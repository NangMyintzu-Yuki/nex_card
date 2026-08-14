// src/app/admin/revenue/page.tsx — Revenue Reporting Dashboard
import type { Metadata } from "next";
import prisma from "@/lib/db/prisma";
import { RevenueClient } from "./_components/revenue-client";

export const metadata: Metadata = { title: "Revenue Reports" };
export const dynamic = "force-dynamic";

export default async function RevenuePage() {
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
