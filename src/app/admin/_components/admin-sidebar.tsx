// src/app/admin/_components/admin-sidebar.tsx
"use client";

import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3, Users, Layers, Settings, Menu, X, ChevronRight, CreditCard,
  LogOut, TrendingUp, Shield, Tag, Percent,
} from "lucide-react";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

interface AdminUser { id: string; name: string; email: string; role: string; }

const NAV = [
  { href: "/admin",            icon: BarChart3,  label: "Overview"  },
  { href: "/admin/payments",   icon: CreditCard, label: "Payments"  },
  { href: "/admin/revenue",    icon: TrendingUp, label: "Revenue"   },
  { href: "/admin/users",      icon: Users,      label: "Users"     },
  { href: "/admin/templates",  icon: Layers,     label: "Templates" },
  { href: "/admin/coupons",    icon: Tag,        label: "Coupons"    },
  { href: "/admin/discount-rules", icon: Percent, label: "Discounts" },
  { href: "/admin/settings",   icon: Settings,   label: "Settings"  },
  { href: "/admin/security",   icon: Shield,     label: "Security"  },
] as const;

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? (p[0] ?? "?").slice(0,2).toUpperCase() : ((p[0]?.[0]??"")+(p[p.length-1]?.[0]??"")).toUpperCase();
}

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openSidebar = () => setOpen(true);
    window.addEventListener("open-admin-sidebar", openSidebar);
    return () => window.removeEventListener("open-admin-sidebar", openSidebar);
  }, []);

  const brand2 = isDark ? "#d4af37" : "#1a3a6b";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  function NavContent() {
    return (
      <>
        {/* Logo + ADMIN badge */}
        <div className="flex items-center justify-between px-4 py-5 border-b"
          style={{ borderColor: "var(--nc-sidebar-border)" }}>
          <div className="flex items-center gap-2">
            <NexCardLogoStatic size={28} showText={false} isDark={isDark} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black leading-none" style={{ color: isDark ? "#d4af37" : "#1a3a6b" }}>NEX CARD</span>
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
                  ADMIN
                </span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>Control Panel</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg lg:hidden"
            style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-2)" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

       

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-3 pt-5">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--nc-text-3)" }}>Admin Menu</p>
            
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${active ? "nc-nav-item active" : "nc-nav-item"}`}>
                <Icon className="h-4 w-4 shrink-0"
                  style={{ color: active ? brand2 : "var(--nc-text-2)" }} />
                <span style={{ color: active ? "var(--nc-text)" : "var(--nc-text-2)" }}>{label}</span>
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0" style={{ color: brand2 }} />}
              </Link>
            );
          })}
          
        </nav>

        {/* Bottom */}
        <div className="border-t px-3 py-4 space-y-3"
          style={{ borderColor: "var(--nc-sidebar-border)" }}>

          {/* Theme toggle */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{ background: "var(--nc-sidebar-item)", border: "1px solid var(--nc-border)" }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                {isDark ? "Dark / Gold" : "Light / Navy"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>Theme mode</p>
            </div>
            <ThemeToggle size="sm" />
          </div>
           {/* Admin user card */}
        <div className=" mt-4 rounded-xl p-3"
          style={{ background: `${brand2}12`, border: `1px solid ${brand2}25` }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold" style={{ color: "var(--nc-text)" }}>{user.name}</p>
              <p className="truncate text-[10px]" style={{ color: "var(--nc-text-3)" }}>{user.email}</p>
            </div>
             <form action="/api/auth/logout" method="POST">
                        <button type="submit"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all nc-nav-item">
                          <LogOut className="h-4 w-4 shrink-0" style={{ color: "var(--nc-text-3)" }} />
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
      {/* Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col lg:flex z-40"
        style={{ background: "var(--nc-sidebar-bg)", borderRight: "1px solid var(--nc-sidebar-border)" }}>
        <div className="flex h-full flex-col"><NavContent /></div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[min(16rem,85vw)] flex-col shadow-2xl"
            style={{ background: "var(--nc-sidebar-bg)", borderRight: "1px solid var(--nc-sidebar-border)" }}>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}