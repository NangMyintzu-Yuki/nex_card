// src/app/dashboard/analytics/page.tsx
// Per-user profile analytics — view counts, trend, traffic breakdown

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Eye, TrendingUp, BarChart3, Globe } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics — PresenceCard" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const profiles = await prisma.userProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { viewCount: "desc" },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
      template: { select: { name: true, accentColor: true } },
    },
  });

  const totalViews = profiles.reduce(
    (sum, p) => sum + Number(p.viewCount),
    0
  );
  const publishedCount = profiles.filter((p) => p.isPublished).length;
  const topProfile = profiles[0];

  const CATEGORY_COLORS: Record<string, string> = {
    "digital-name-card": "#6366f1",
    portfolio:            "#0ea5e9",
    "business-ad":        "#f59e0b",
    "wedding-invitation": "#ec4899",
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track how your profiles are performing
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Eye,
            label: "Total Views",
            value: formatNumber(totalViews),
            color: "#6366f1",
          },
          {
            icon: Globe,
            label: "Published Profiles",
            value: `${publishedCount} / ${profiles.length}`,
            color: "#22c55e",
          },
          {
            icon: TrendingUp,
            label: "Top Profile",
            value: topProfile ? `/${topProfile.slug}` : "—",
            color: "#f59e0b",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5"
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${stat.color}15` }}
              >
                <Icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
              <p className="text-xl font-black text-white">{stat.value}</p>
              <p className="mt-0.5 text-xs text-neutral-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Profile breakdown table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-neutral-600" />
          <h2 className="font-bold text-white text-sm">Profile Performance</h2>
        </div>

        {profiles.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-neutral-600 text-sm">
              No profiles yet. Create one to start tracking views.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {profiles.map((profile) => {
              const maxViews = Number(profiles[0]?.viewCount ?? 1);
              const pct = maxViews > 0
                ? Math.round((Number(profile.viewCount) / maxViews) * 100)
                : 0;
              const color =
                CATEGORY_COLORS[profile.category.slug] ?? "#6366f1";

              return (
                <div key={profile.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-white">
                          /{profile.slug}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: `${color}15`,
                            color,
                          }}
                        >
                          {profile.category.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            profile.isPublished
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          {profile.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600">
                        {profile.template.name} · Created{" "}
                        {formatDate(profile.createdAt)} · Updated{" "}
                        {formatDate(profile.updatedAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-white">
                        {formatNumber(profile.viewCount)}
                      </p>
                      <p className="text-xs text-neutral-600">views</p>
                    </div>
                  </div>

                  {/* View bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-5">
        <h3 className="mb-3 text-sm font-bold text-white">
          Tips to increase views
        </h3>
        <ul className="space-y-2 text-sm text-neutral-500">
          {[
            "Add your PresenceCard link to your LinkedIn bio, Twitter/X, and email signature.",
            "Share your page on LinkedIn when you start a new role or project.",
            "Use a custom meta title and description for better click-through on social media.",
            "Add a custom OG image for eye-catching social previews.",
            "Enable the Wedding Invitation page and share it via WhatsApp broadcast.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-indigo-400">→</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
