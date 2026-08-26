import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { CouponManager } from "./_components/coupon-manager";

export const metadata: Metadata = { title: "Coupons — Admin · NEX CARD" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const [coupons, categories] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { payments: true } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl nc-page px-3 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black" style={{ color: "var(--nc-text)" }}>
          Coupons
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
          {coupons.length} total coupons
        </p>
      </div>

      <CouponManager coupons={coupons} categories={categories} />
    </div>
  );
}
