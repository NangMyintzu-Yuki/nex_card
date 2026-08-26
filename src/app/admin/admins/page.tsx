// src/app/admin/admins/page.tsx
// Super Admin only — manage admin users (add/remove)

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import { AdminManager } from "./_components/admin-manager";
import { getAdmins } from "@/lib/actions/admin-manage-actions";

export const metadata: Metadata = { title: "Admins — Super Admin · NEX CARD" };
export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const admins = await getAdmins();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black" style={{ color: "var(--nc-text)" }}>Admin Management</h1>
        <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>
          Add or remove admin users. Only Super Admins can manage this.
        </p>
      </div>
      <AdminManager
        admins={admins.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
          lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
        }))}
        currentUserEmail={session.user.email}
      />
    </div>
  );
}
