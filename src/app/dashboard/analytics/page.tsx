// src/app/dashboard/analytics/page.tsx — NEX CARD themed analytics page
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatNumber, formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Analytics — NEX CARD" };
export const dynamic = "force-dynamic";

const CAT_COLORS: Record<string, string> = {
  "digital-name-card": "#6366f1",
  "portfolio":          "#0ea5e9",
  "business-ad":        "#f59e0b",
  "wedding-invitation": "#ec4899",
};

export default async function AnalyticsPage() {
  let session;
  try {
    session = await getServerSession();
  } catch {
    redirect("/login");
  }
  if (!session?.user?.id) redirect("/login");

  let profiles: Array<{
    id: string;
    slug: string;
    isPublished: boolean;
    viewCount: bigint | number;
    qrScanCount: bigint | number;
    nfcWriteCount: bigint | number;
    category?: { slug: string; name: string };
    template?: { name: string };
  }> = [];
  try {
    profiles = await prisma.userProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { viewCount: "desc" },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        viewCount: true,
        qrScanCount: true,
        nfcWriteCount: true,
        updatedAt: true,
        category: { select: { slug: true, name: true } },
        template: { select: { name: true } },
      },
    });
  } catch {
    profiles = [];
  }

  const totalViews  = profiles.reduce((s, p) => s + Number(p.viewCount ?? 0), 0);
  const totalScans  = profiles.reduce((s, p) => s + Number(p.qrScanCount ?? 0), 0);
  const totalNfc    = profiles.reduce((s, p) => s + Number(p.nfcWriteCount ?? 0), 0);
  const published   = profiles.filter((p) => p.isPublished).length;

  const { getProfileAnalyticsSummary } = await import("@/lib/analytics/track");
  const series = await getProfileAnalyticsSummary(
    profiles.map((p) => p.id),
    30
  );

  const STATS = [
    { label: "Total Views",       value: formatNumber(totalViews),  color: "#6366f1", emoji: "👁️"  },
    { label: "QR Scans",          value: formatNumber(totalScans),  color: "#f59e0b", emoji: "📱" },
    { label: "NFC Writes",        value: formatNumber(totalNfc),    color: "#22c55e", emoji: "📡" },
    { label: "Live Profiles",     value: `${published}/${profiles.length}`, color: "#0ea5e9", emoji: "🌐" },
  ];

  return (
    <div className="mx-auto max-w-5xl nc-page" style={{ color: "var(--nc-text)" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Analytics</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
          Track performance across all your profiles
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ background: `${s.color}18` }}>
              {s.emoji}
            </div>
            <p className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>{s.value}</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--nc-text-3)" }}>{s.label}</p>
            <div className="mt-2 h-0.5 w-10 rounded-full" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Daily series + referrers + devices (Phase C events) */}
      {(series.daily.length > 0 || series.referrers.length > 0 || series.devices.length > 0) && (
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl p-5 lg:col-span-2"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
            <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--nc-text)" }}>
              Last 30 days
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto text-xs font-mono">
              {series.daily.length === 0 ? (
                <p style={{ color: "var(--nc-text-3)" }}>No event data yet — views will appear here.</p>
              ) : (
                series.daily.map((d) => (
                  <div key={d.day} className="flex justify-between gap-3" style={{ color: "var(--nc-text-2)" }}>
                    <span>{d.day}</span>
                    <span>
                      {d.views} views · {d.qr} QR · {d.nfc} NFC
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl p-5"
              style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
              <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--nc-text)" }}>Top referrers</h2>
              {series.referrers.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>None yet</p>
              ) : (
                <ul className="space-y-1 text-xs" style={{ color: "var(--nc-text-2)" }}>
                  {series.referrers.map((r) => (
                    <li key={r.host} className="flex justify-between gap-2">
                      <span className="truncate">{r.host}</span>
                      <span>{r.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl p-5"
              style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
              <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--nc-text)" }}>Devices</h2>
              {series.devices.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>None yet</p>
              ) : (
                <ul className="space-y-1 text-xs" style={{ color: "var(--nc-text-2)" }}>
                  {series.devices.map((d) => (
                    <li key={d.device} className="flex justify-between gap-2">
                      <span>{d.device}</span>
                      <span>{d.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile breakdown */}
      <div className="overflow-hidden rounded-2xl"
        style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
        <div className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--nc-border)" }}>
          <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Profile Performance</h2>
          <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>{profiles.length} profiles</span>
        </div>

        {profiles.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>No profiles yet.</p>
            <Link href="/dashboard/onboarding"
              className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-bold nc-btn-brand">
              Create Profile →
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--nc-border)" }}>
            {profiles.map((p) => {
              const maxViews  = Number(profiles[0]?.viewCount ?? 1);
              const viewCount = Number(p.viewCount ?? 0);
              const pct       = maxViews > 0 ? Math.round((viewCount / maxViews) * 100) : 0;
              const color     = CAT_COLORS[p.category?.slug ?? ""] ?? "#6366f1";

              return (
                <div key={p.id} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link href={`/dashboard/edit/${p.slug}`}
                          className="break-all font-mono text-sm font-semibold hover:underline" style={{ color }}>
                          /{p.slug}
                        </Link>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: `${color}18`, color }}>
                          {p.category?.name ?? "Unknown"}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          p.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {p.isPublished ? "Live" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                        {p.template?.name ?? "Unknown"} · Updated {formatDate((p as Record<string, unknown>).updatedAt as string)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black" style={{ color: "var(--nc-text)" }}>
                        {formatNumber(viewCount)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                        {formatNumber(Number(p.qrScanCount ?? 0))} QR · {Number(p.nfcWriteCount ?? 0)} NFC
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "var(--nc-border)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
