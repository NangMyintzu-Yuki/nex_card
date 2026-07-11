// src/app/admin/page.tsx
// Master Admin Analytics Dashboard — role-gated, real-time stats

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  Users, Globe, BarChart3, TrendingUp,
  Eye, Layers, Lock, Sparkles,
} from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard — PresenceCard",
  robots: { index: false, follow: false },
};

// Force dynamic — admin must always see fresh data
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// DATA FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

async function getAdminStats() {
  const [
    totalUsers,
    totalProfiles,
    publishedProfiles,
    lockedProfiles,
    totalViews,
    topProfiles,
    categoryBreakdown,
    templateBreakdown,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { isPublished: true } }),
    prisma.userProfile.count({ where: { templateLocked: true } }),
    prisma.userProfile.aggregate({ _sum: { viewCount: true } }),
    prisma.userProfile.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: {
        slug: true,
        viewCount: true,
        updatedAt: true,
        user: { select: { name: true } },
        template: { select: { name: true, codeIdentifier: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { profiles: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.template.findMany({
      include: {
        _count: { select: { profiles: true } },
      },
      orderBy: { profiles: { _count: "desc" } },
      take: 10,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        _count: { select: { profiles: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalProfiles,
    publishedProfiles,
    lockedProfiles,
    totalViews: Number(totalViews._sum.viewCount ?? 0),
    topProfiles,
    categoryBreakdown,
    templateBreakdown,
    recentUsers,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const stats = await getAdminStats();

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      color: "#6366f1",
    },
    {
      icon: Layers,
      label: "Total Profiles",
      value: stats.totalProfiles.toLocaleString(),
      color: "#0ea5e9",
    },
    {
      icon: Globe,
      label: "Published",
      value: stats.publishedProfiles.toLocaleString(),
      color: "#22c55e",
    },
    {
      icon: Lock,
      label: "Locked Templates",
      value: stats.lockedProfiles.toLocaleString(),
      color: "#f59e0b",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: stats.totalViews.toLocaleString(),
      color: "#ec4899",
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: stats.totalProfiles > 0
        ? `${Math.round((stats.publishedProfiles / stats.totalProfiles) * 100)}%`
        : "—",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top nav */}
      <div className="border-b border-white/5 bg-neutral-900 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">PresenceCard</span>
            <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400">
              ADMIN
            </span>
          </div>
          <p className="text-sm text-neutral-500">{session.user.email}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Real-time platform metrics
          </p>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${card.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
                <p className="text-2xl font-black text-white">{card.value}</p>
                <p className="mt-0.5 text-xs text-neutral-600">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* ── Top profiles by views ────────────────────────────────── */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-white">Top Profiles by Views</h2>
              <BarChart3 className="h-4 w-4 text-neutral-600" />
            </div>
            <div className="space-y-3">
              {stats.topProfiles.map((profile, i) => {
                const maxViews = Number(stats.topProfiles[0]?.viewCount ?? 1);
                const pct = Math.round((Number(profile.viewCount) / maxViews) * 100);
                return (
                  <div key={profile.slug}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 shrink-0 text-neutral-700 font-mono">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium text-white">
                          /{profile.slug}
                        </span>
                        <span className="hidden shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-neutral-500 sm:block">
                          {profile.category.name}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-neutral-400">
                        {Number(profile.viewCount).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Category breakdown ───────────────────────────────────── */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <h2 className="mb-5 font-bold text-white">Profiles by Category</h2>
            <div className="space-y-3">
              {stats.categoryBreakdown.map((cat) => {
                const pct =
                  stats.totalProfiles > 0
                    ? Math.round((cat._count.profiles / stats.totalProfiles) * 100)
                    : 0;
                return (
                  <div key={cat.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{cat.name}</span>
                      <span className="font-mono text-neutral-400">
                        {cat._count.profiles} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            cat.slug === "digital-name-card"
                              ? "#6366f1"
                              : cat.slug === "portfolio"
                              ? "#0ea5e9"
                              : cat.slug === "business-ad"
                              ? "#f59e0b"
                              : "#ec4899",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Template popularity ──────────────────────────────── */}
            <h2 className="mb-4 mt-6 font-bold text-white">Top Templates</h2>
            <div className="space-y-2">
              {stats.templateBreakdown.slice(0, 5).map((template, i) => (
                <div key={template.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-neutral-700 font-mono">{i + 1}</span>
                    <span className="truncate text-neutral-300 font-mono text-xs">
                      {template.codeIdentifier}
                    </span>
                  </div>
                  <span className="shrink-0 text-neutral-500">
                    {template._count.profiles} uses
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent users ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 lg:col-span-2">
            <h2 className="mb-5 font-bold text-white">Recent Registrations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-left font-semibold text-neutral-500">User</th>
                    <th className="pb-3 text-left font-semibold text-neutral-500">Email</th>
                    <th className="pb-3 text-left font-semibold text-neutral-500">Status</th>
                    <th className="pb-3 text-left font-semibold text-neutral-500">Profiles</th>
                    <th className="pb-3 text-left font-semibold text-neutral-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 font-medium text-white">{user.name}</td>
                      <td className="py-3 font-mono text-neutral-500">{user.email}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : user.status === "SUSPENDED"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-400">{user._count.profiles}</td>
                      <td className="py-3 text-neutral-600">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
