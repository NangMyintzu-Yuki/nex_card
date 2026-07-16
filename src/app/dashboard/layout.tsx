// src/app/dashboard/layout.tsx
// Shared layout for all /dashboard/* pages — uses themed DashboardSidebar

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { DashboardSidebar } from "./_components/dashboard-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
      <DashboardSidebar
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      />

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="flex-1 lg:pl-64">
        {children}
      </div>
    </div>
  );
}
