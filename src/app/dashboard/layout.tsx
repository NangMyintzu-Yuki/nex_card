// src/app/dashboard/layout.tsx
// Shared layout for all /dashboard/* pages — sidebar + topbar

import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Globe, BarChart3, Settings, LogOut, Plus } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { icon: Globe,     label: "Profiles",  href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings,  label: "Settings",  href: "/dashboard/settings" },
] as const;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const initials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r border-white/5 bg-neutral-900/80 backdrop-blur lg:flex z-40">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold tracking-tight">PresenceCard</span>
          </Link>
        </div>

        {/* New profile CTA */}
        <div className="border-b border-white/5 p-3">
          <Link
            href="/dashboard/onboarding"
            className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:border-indigo-500/30"
          >
            <Plus className="h-4 w-4" />
            New Profile
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-white/5 p-3 space-y-1">
          {session.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Admin Panel
            </Link>
          )}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-neutral-600">
                {session.user.email}
              </p>
            </div>
          </div>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-600 transition-all hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* ── Mobile Topbar ────────────────────────────────────────────── */}
      <div className="fixed top-0 z-40 w-full border-b border-white/5 bg-neutral-900/80 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">PresenceCard</span>
          </Link>
          <div className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/5 hover:text-white transition-colors"
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
              {initials}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="flex-1 lg:pl-60">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
