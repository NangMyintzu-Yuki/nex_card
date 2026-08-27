// src/app/admin/admins/_components/admin-manager.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Trash2, Shield, Crown, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Users, Eye, EyeOff,
} from "lucide-react";
import {
  addAdminAction, removeAdminAction, type AdminManageState,
} from "@/lib/actions/admin-manage-actions";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function AdminManager({
  admins: initial,
  currentUserEmail,
}: {
  admins: AdminUser[];
  currentUserEmail: string;
}) {
  const [admins, setAdmins] = useState(initial);
  const [addState, addAction, addPending] = useActionState<AdminManageState, FormData>(addAdminAction, { status: "idle" });
  const [removeState, removeAction, removePending] = useActionState<AdminManageState, FormData>(removeAdminAction, { status: "idle" });
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (addState.status === "success" || removeState.status === "success") {
      router.refresh();
    }
  }, [addState.status, removeState.status, router]);

  const brandGold = "#d4af37";
  const brandRed = "#dc2626";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Toasts ── */}
      {(addState.status !== "idle" || removeState.status !== "idle") && (
        <div className="space-y-2">
          {addState.status === "success" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              <CheckCircle className="h-4 w-4 shrink-0" /> {addState.message}
            </div>
          )}
          {addState.status === "error" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              <AlertCircle className="h-4 w-4 shrink-0" /> {addState.message}
            </div>
          )}
          {removeState.status === "success" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              <CheckCircle className="h-4 w-4 shrink-0" /> {removeState.message}
            </div>
          )}
          {removeState.status === "error" && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              <AlertCircle className="h-4 w-4 shrink-0" /> {removeState.message}
            </div>
          )}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Admins", value: admins.length, icon: Users },
          { label: "Super Admins", value: admins.filter((a) => a.role === "SUPER_ADMIN").length, icon: Crown },
          { label: "Regular Admins", value: admins.filter((a) => a.role === "ADMIN").length, icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="nc-card rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg" style={{ background: "var(--nc-bg-hover)" }}>
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: brandGold }} />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black" style={{ color: "var(--nc-text)" }}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Admin Form ── */}
      <div className="nc-card rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex w-full items-center justify-between px-4 sm:px-5 py-3 sm:py-4 transition-colors"
          style={{ borderBottom: showForm ? "1px solid var(--nc-border)" : "none" }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg" style={{ background: "rgba(34,197,94,0.1)" }}>
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>Add New Admin</span>
          </div>
          {showForm ? (
            <ChevronUp className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
          )}
        </button>

        {showForm && (
          <div className="px-4 sm:px-5 py-4">
            <form action={addAction} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>Full Name</label>
                  <input
                    name="name"
                    placeholder="e.g. John Doe"
                    required
                    className="nc-input w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="nc-input w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="relative">
                  <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>Password</label>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    className="nc-input w-full rounded-xl px-3 py-2.5 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] p-0.5 transition-opacity hover:opacity-70"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
                    ) : (
                      <Eye className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
                    )}
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addPending}
                    className="nc-btn-brand flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
                  >
                    {addPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {addPending ? "Adding…" : "Add Admin"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Admins List ── */}
      <div className="nc-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg" style={{ background: `${brandGold}15` }}>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: brandGold }} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>Current Admins</h2>
              <p className="text-[10px] sm:text-xs" style={{ color: "var(--nc-text-3)" }}>{admins.length} accounts</p>
            </div>
          </div>
        </div>

        {/* ── Desktop Table (md+) ── */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <tr>
                {["Admin", "Role", "Status", "Last Login", "Joined", "Actions"].map((col) => (
                  <th key={col} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: "1px solid var(--nc-border)" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: "var(--nc-sidebar-active)", color: "var(--nc-brand-2)" }}>
                        {getInitials(admin.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: "var(--nc-text)" }}>{admin.name}</p>
                        <p className="text-xs font-mono truncate" style={{ color: "var(--nc-text-3)" }}>{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: admin.role === "SUPER_ADMIN" ? `linear-gradient(135deg, ${brandRed}, #f97316)` : "linear-gradient(135deg, #1a3a6b, #4a9fd4)" }}>
                      {admin.role === "SUPER_ADMIN" && <Crown className="h-3 w-3" />}
                      {admin.role === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    {admin.role === "ADMIN" && admin.email !== currentUserEmail ? (
                      <form action={removeAction} onSubmit={(e) => {
                        if (!confirm(`Revoke admin access for ${admin.email}?`)) e.preventDefault();
                      }}>
                        <input type="hidden" name="userId" value={admin.id} />
                        <button type="submit" disabled={removePending}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-500/10 disabled:opacity-50"
                          style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      </form>
                    ) : admin.role === "SUPER_ADMIN" ? (
                      <span className="text-[11px] font-semibold" style={{ color: "var(--nc-text-3)" }}>You</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards (<md) ── */}
        <div className="md:hidden divide-y" style={{ borderColor: "var(--nc-border)" }}>
          {admins.map((admin) => (
            <div key={admin.id} className="px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: "var(--nc-sidebar-active)", color: "var(--nc-brand-2)" }}>
                  {getInitials(admin.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate text-sm" style={{ color: "var(--nc-text)" }}>{admin.name}</p>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: admin.role === "SUPER_ADMIN" ? `linear-gradient(135deg, ${brandRed}, #f97316)` : "linear-gradient(135deg, #1a3a6b, #4a9fd4)" }}>
                      {admin.role === "SUPER_ADMIN" && <Crown className="h-2.5 w-2.5" />}
                      {admin.role === "SUPER_ADMIN" ? "SUPER" : "ADMIN"}
                    </span>
                  </div>
                  <p className="text-xs font-mono truncate" style={{ color: "var(--nc-text-3)" }}>{admin.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--nc-text-3)" }}>
                <span className="rounded-full px-2 py-0.5 font-semibold bg-emerald-500/10 text-emerald-400">{admin.status}</span>
                <span>Last: {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never"}</span>
                <span>· Joined {formatDate(admin.createdAt)}</span>
              </div>
              {admin.role === "ADMIN" && admin.email !== currentUserEmail && (
                <div className="pt-1" style={{ borderTop: "1px solid var(--nc-border)" }}>
                  <form action={removeAction} onSubmit={(e) => {
                    if (!confirm(`Revoke admin access for ${admin.email}?`)) e.preventDefault();
                  }}>
                    <input type="hidden" name="userId" value={admin.id} />
                    <button type="submit" disabled={removePending}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:bg-red-500/10 disabled:opacity-50"
                      style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
                      <Trash2 className="h-3.5 w-3.5" />
                      {removePending ? "Revoking…" : "Revoke Access"}
                    </button>
                  </form>
                </div>
              )}
              {admin.role === "SUPER_ADMIN" && (
                <div className="pt-1" style={{ borderTop: "1px solid var(--nc-border)" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "var(--nc-text-3)" }}>This is your account</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {admins.length === 0 && (
          <div className="px-5 py-10 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10" style={{ color: "var(--nc-text-3)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--nc-text-3)" }}>No admins found</p>
          </div>
        )}
      </div>
    </div>
  );
}
