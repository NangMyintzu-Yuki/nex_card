// src/app/admin/page.tsx — NEX CARD Admin Analytics Overview
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, totalProfiles, publishedProfiles, totalScans] = await Promise.all([
    prisma.user.count(),
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { isPublished: true } }),
    prisma.userProfile.aggregate({ _sum: { qrScanCount: true } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, email: true, createdAt: true, status: true, role: true },
  });

  const topProfiles = await prisma.userProfile.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 8,
    select: {
      id: true, slug: true, viewCount: true, qrScanCount: true,
      category: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const stats = [
    { label: "Total Users",      value: formatNumber(totalUsers),                   color: "#d4af37", icon: "👥" },
    { label: "Total Profiles",   value: formatNumber(totalProfiles),                color: "#4a9fd4", icon: "🪪" },
    { label: "Live Profiles",    value: formatNumber(publishedProfiles),            color: "#22c55e", icon: "🌐" },
    { label: "Total QR Scans",   value: formatNumber(Number(totalScans._sum.qrScanCount ?? 0)), color: "#f59e0b", icon: "📱" },
  ];

  return (
    <div className="mx-auto max-w-6xl nc-page" style={{ color: "var(--nc-text)" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Admin Overview</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
          NEX CARD platform analytics and management
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ background: `${s.color}18` }}>
              {s.icon}
            </div>
            <p className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>{s.value}</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--nc-text-3)" }}>{s.label}</p>
            <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--nc-border)" }}>
            <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Recent Users</h2>
            <Link href="/admin/users" className="text-xs font-semibold hover:underline"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--nc-border)" }}>
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>{u.name}</p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.role === "ADMIN" && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-black"
                      style={{
                        background: "var(--nc-brand-grad)",
                        color: "var(--nc-brand-text)",
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    u.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}>{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top profiles */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--nc-border)" }}>
            <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Top Profiles</h2>
            <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>By view count</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--nc-border)" }}>
            {topProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-semibold" style={{ color: "var(--nc-text)" }}>
                      /{p.slug}
                    </p>
                    <span className="text-[10px] rounded-full px-1.5 py-0.5"
                      style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" }}>
                      {p.category.name}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{p.user.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>
                    {formatNumber(p.viewCount)} views
                  </p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {formatNumber(Number(p.qrScanCount))} scans
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}