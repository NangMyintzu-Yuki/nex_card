"use client";

import { Menu } from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
}) {
  return (
    <>
      <nav
        className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b px-4 lg:hidden"
        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)" }}
      >
        <button
          onClick={() => window.dispatchEvent(new Event("open-admin-sidebar"))}
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text)" }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-end">
            <span className="max-w-[100px] truncate text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
              {user.name}
            </span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{ background: "var(--nc-brand-grad)" }}
            >
              ADMIN
            </span>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: "var(--nc-brand-grad)" }}
          >
            {getInitials(user.name)}
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
