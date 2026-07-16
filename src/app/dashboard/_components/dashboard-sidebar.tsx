// src/app/dashboard/_components/dashboard-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, BarChart3, Settings, LogOut,
  QrCode, Menu, X, ChevronRight, Smartphone,
} from "lucide-react";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

interface SidebarUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const NAV_ITEMS = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "My Profiles"   },
  { href: "/dashboard/analytics", icon: BarChart3,        label: "Analytics"     },
  { href: "/dashboard/settings",  icon: Settings,         label: "Settings"      },
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Branded colours from CSS vars
  const brand2 = isDark ? "#d4af37" : "#2d6eb5";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  function NavContent() {
    return (
      <>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--nc-sidebar-border)" }}>
          <NexCardLogoStatic size={32} isDark={isDark} />
          <button onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg lg:hidden"
            style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-2)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

    

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 pt-5">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--nc-text-3)" }}>
            Menu
          </p>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isActive ? "nc-nav-item active" : "nc-nav-item"}`}>
                <Icon className="h-4 w-4 shrink-0"
                  style={{ color: isActive ? brand2 : "var(--nc-text-2)" }} />
                <span style={{ color: isActive ? "var(--nc-text)" : "var(--nc-text-2)" }}>{label}</span>
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0" style={{ color: brand2 }} />}
              </Link>
            );
          })}

          {/* QR & NFC shortcut */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--nc-border)" }}>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--nc-text-3)" }}>
              Quick Access
            </p>
            <Link href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all nc-nav-item"
              onClick={() => setMobileOpen(false)}>
              <QrCode className="h-4 w-4 shrink-0" style={{ color: "var(--nc-text-2)" }} />
              <span style={{ color: "var(--nc-text-2)" }}>QR Codes</span>
            </Link>
            <Link href="/dashboard/nfc"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all nc-nav-item"
              onClick={() => setMobileOpen(false)}>
              <Smartphone className="h-4 w-4 shrink-0" style={{ color: "var(--nc-text-2)" }} />
              <span style={{ color: "var(--nc-text-2)" }}>NFC Setup</span>
            </Link>
          </div>

          {/* Admin link */}
          {user.role === "ADMIN" && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--nc-border)" }}>
              <Link href="/admin"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                style={{ background: `${brand2}15`, border: `1px solid ${brand2}30`, color: brand2 }}
                onClick={() => setMobileOpen(false)}>
                <Smartphone className="h-4 w-4 shrink-0" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom: Theme toggle + Logout */}
        <div className="border-t px-3 py-4 space-y-3"
          style={{ borderColor: "var(--nc-sidebar-border)" }}>

          {/* Theme toggle row */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: "var(--nc-sidebar-item)", border: "1px solid var(--nc-border)" }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                {isDark ? "Dark (Gold)" : "Light (Blue)"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>
                {isDark ? "Gold on black" : "Navy on white"}
              </p>
            </div>
            <ThemeToggle size="sm" />
          </div>

            {/* User card */}
        <div className=" mt-4 rounded-xl p-3"
          style={{ background: "var(--nc-sidebar-item)", border: "1px solid var(--nc-border)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-black"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold" style={{ color: "var(--nc-text)" }}>{user.name}</p>
              <p className="truncate text-xs" style={{ color: "var(--nc-text-3)" }}>{user.email}</p>
            </div>
            {user.role === "ADMIN" && (
              <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black text-black"
                style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
                ADMIN
              </span>
            )}

          <form action="/api/auth/logout" method="GET">
            <button type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all nc-nav-item">
              <LogOut className="h-4 w-4 shrink-0" style={{ color: "var(--nc-text-3)" }} />
              {/* <span style={{ color: "var(--nc-text-3)" }}>Sign Out</span> */}
            </button>
          </form>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col lg:flex z-40"
        style={{ background: "var(--nc-sidebar-bg)", borderRight: "1px solid var(--nc-sidebar-border)" }}>
        <div className="flex h-full flex-col">
          <NavContent />
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-xl lg:hidden"
        style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
        <Menu className="h-5 w-5 text-black" />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 flex-col flex shadow-2xl"
            style={{ background: "var(--nc-sidebar-bg)", borderRight: "1px solid var(--nc-sidebar-border)" }}>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}