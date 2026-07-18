"use client";

import { usePathname } from "next/navigation";

const HIDE_SIDEBAR_PREFIXES = ["/dashboard/onboarding/preview/"];

export function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = HIDE_SIDEBAR_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
      {!hideSidebar && sidebar}
      <div className={hideSidebar ? "flex-1" : "flex-1 lg:pl-64"}>
        {children}
      </div>
    </div>
  );
}
