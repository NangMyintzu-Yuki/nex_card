// src/app/dashboard/layout.tsx
// Shared layout for all /dashboard/* pages — uses themed DashboardSidebar

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { DashboardShell } from "./_components/dashboard-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  return (
    <ThemeProvider>
      <DashboardShell
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
        sidebar={
          <DashboardSidebar
            user={{
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: session.user.role,
            }}
          />
        }
      >
        {children}
      </DashboardShell>
    </ThemeProvider>
  );
}
