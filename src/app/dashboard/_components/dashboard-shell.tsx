"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const HIDE_SIDEBAR_PREFIXES = ["/dashboard/onboarding/preview/"];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function DashboardShell({
  sidebar,
  children,
  user,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const hideSidebar = HIDE_SIDEBAR_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-clip" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
      {!hideSidebar && sidebar}
      <div className={hideSidebar ? "min-w-0 flex-1 nc-page-enter" : "min-w-0 flex-1 lg:pl-64 nc-page-enter"}>
        {!hideSidebar && (
          <nav
            className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b px-4 lg:hidden"
            style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)" }}
          >
            <button
              onClick={() => window.dispatchEvent(new Event("open-dashboard-sidebar"))}
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text)" }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="max-w-[100px] truncate text-right text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                {user.name}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--nc-brand-grad)" }}
              >
                {getInitials(user.name)}
              </div>
            </div>
          </nav>
        )}
        {children}
      </div>
    </div>
  );
}
