// src/app/admin/admins/_components/admin-manager.tsx
"use client";

import { useActionState } from "react";
import { UserPlus, Trash2, Shield, Crown } from "lucide-react";
import { addAdminAction, removeAdminAction, type AdminManageState } from "@/lib/actions/admin-manage-actions";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export function AdminManager({ admins, currentUserEmail }: { admins: AdminUser[]; currentUserEmail: string }) {
  const [addState, addAction, addPending] = useActionState<AdminManageState, FormData>(addAdminAction, { status: "idle" });
  const [removeState, removeAction, removePending] = useActionState<AdminManageState, FormData>(removeAdminAction, { status: "idle" });

  const brand2 = "var(--nc-text)";
  const brandGold = "#d4af37";
  const brandRed = "#dc2626";

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {addState.status === "success" && (
        <div className="rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
          {addState.message}
        </div>
      )}
      {addState.status === "error" && (
        <div className="rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          {addState.message}
        </div>
      )}
      {removeState.status === "success" && (
        <div className="rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
          {removeState.message}
        </div>
      )}
      {removeState.status === "error" && (
        <div className="rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          {removeState.message}
        </div>
      )}

      {/* Add Admin Form */}
      <div className="rounded-2xl p-5" style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5" style={{ color: brandGold }} />
          <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>Add New Admin</h2>
        </div>
        <form action={addAction} className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Full name" required
            className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "var(--nc-bg)", border: "1px solid var(--nc-border)", color: "var(--nc-text)" }} />
          <input name="email" type="email" placeholder="Email address" required
            className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "var(--nc-bg)", border: "1px solid var(--nc-border)", color: "var(--nc-text)" }} />
          <input name="password" type="password" placeholder="Password (min 8 chars)" required minLength={8}
            className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "var(--nc-bg)", border: "1px solid var(--nc-border)", color: "var(--nc-text)" }} />
          <button type="submit" disabled={addPending}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1a3a6b, #4a9fd4)" }}>
            {addPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <UserPlus className="h-4 w-4" />}
            {addPending ? "Adding..." : "Add Admin"}
          </button>
        </form>
      </div>

      {/* Admins List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--nc-border)" }}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: brandGold }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>Current Admins ({admins.length})</h2>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--nc-border)" }}>
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between px-5 py-3 gap-4" style={{ borderColor: "var(--nc-border)" }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--nc-text)" }}>{admin.name}</p>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black text-white"
                    style={{ background: admin.role === "SUPER_ADMIN" ? `linear-gradient(135deg, ${brandRed}, #f97316)` : "linear-gradient(135deg, #1a3a6b, #4a9fd4)" }}>
                    {admin.role === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: "var(--nc-text-3)" }}>{admin.email}</p>
                {admin.lastLoginAt && (
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--nc-text-3)" }}>
                    Last login: {new Date(admin.lastLoginAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {admin.role === "ADMIN" && admin.email !== currentUserEmail && (
                <form action={removeAction}>
                  <input type="hidden" name="userId" value={admin.id} />
                  <button type="submit" disabled={removePending}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-50 disabled:opacity-50"
                    style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                </form>
              )}
              {admin.role === "SUPER_ADMIN" && (
                <span className="text-[10px] font-semibold px-2" style={{ color: "var(--nc-text-3)" }}>You</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
