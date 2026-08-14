// src/app/admin/layout.tsx
// Admin layout — role-gated, uses themed AdminSidebar

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth/session";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { AdminSidebar } from "./_components/admin-sidebar";

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
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const pathname = (await headers()).get("x-pathname") ?? "";
  if (!session.user.totpEnabled && !pathname.startsWith("/admin/security")) {
    redirect("/admin/security");
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
        <AdminSidebar
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
        />

        <div className="flex-1 lg:pl-60">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
