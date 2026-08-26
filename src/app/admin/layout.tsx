// src/app/admin/layout.tsx
// Admin layout — role-gated, uses themed AdminSidebar

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <ThemeProvider>
      <div className="flex min-h-screen min-w-0 overflow-x-clip" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
        <AdminSidebar
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
        />

        <div className="min-w-0 flex-1 lg:pl-60 nc-page-enter">
          <AdminShell
            user={{
              name: session.user.name,
              email: session.user.email,
              role: session.user.role,
            }}
          >
            {children}
          </AdminShell>
        </div>
      </div>
    </ThemeProvider>
  );
}
