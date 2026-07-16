// src/app/admin/layout.tsx
// Admin layout — role-gated, uses themed AdminSidebar

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
      <AdminSidebar
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      />

      {/* Main */}
      <div className="flex-1 lg:pl-60">
        {children}
      </div>
    </div>
  );
}
