// src/app/dashboard/settings/page.tsx — themed NEX CARD settings page
"use client";

import { useState, useActionState } from "react";
import { User, Lock, Trash2, AlertTriangle, Check, Download, Eye, EyeOff } from "lucide-react";
import {
  updateProfileInfoAction, type UpdateProfileInfoState,
  changePasswordAction,   type ChangePasswordState,
  deleteAccountAction,    type DeleteAccountState,
} from "@/lib/actions/account-actions";
import { useTheme } from "@/lib/theme/theme-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const brand2 = isDark ? "#d4af37" : "#2d6eb5";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  const [profileState, profileAction, profilePending] = useActionState<UpdateProfileInfoState, FormData>(
    updateProfileInfoAction, { status: "idle" }
  );
  const [pwState, pwAction, pwPending] = useActionState<ChangePasswordState, FormData>(
    changePasswordAction, { status: "idle" }
  );
  const [deleteState, deleteAction, deletePending] = useActionState<DeleteAccountState, FormData>(
    deleteAccountAction, { status: "idle" }
  );

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [exporting, setExporting]         = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export/data");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), {
        href: url,
        download: `nexcard-export-${new Date().toISOString().split("T")[0]}.json`,
      });
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Export failed. Please try again."); }
    finally { setExporting(false); }
  }

  const cardStyle  = { background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", borderRadius: "1rem", overflow: "hidden" };
  const headerStyle = { borderBottom: "1px solid var(--nc-border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.625rem" };
  const inputCls   = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors nc-input";

  function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
    return (
      <div style={headerStyle}>
        <Icon className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
        <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>{label}</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10" style={{ color: "var(--nc-text)" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Account Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
          Manage your NEX CARD account preferences
        </p>
      </div>

      <div className="space-y-5">

        {/* Theme preference */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span className="text-base">🎨</span>
            <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Theme Preference</h2>
          </div>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--nc-text)" }}>
                {isDark ? "Dark / Gold Mode" : "Light / Navy Mode"}
              </p>
              <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>
                {isDark
                  ? "Black background with gold NEX CARD branding"
                  : "White background with navy-blue NEX CARD branding"}
              </p>
            </div>
            <ThemeToggle size="md" showLabel />
          </div>
        </div>

        {/* Profile info */}
        <div style={cardStyle}>
          <SectionHeader icon={User} label="Profile Information" />
          <form action={profileAction} className="p-6 space-y-4">
            {profileState.status === "success" && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-300">Profile updated successfully.</p>
              </div>
            )}
            {profileState.status === "error" && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {profileState.message}
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Display Name <span className="text-red-400">*</span>
              </label>
              <input name="name" type="text" placeholder="Your full name" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Avatar URL
              </label>
              <input name="avatarUrl" type="url" placeholder="https://…/avatar.jpg" className={inputCls} />
            </div>
            <button type="submit" disabled={profilePending}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-black disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {profilePending
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Saving…</>
                : "Save Changes"
              }
            </button>
          </form>
        </div>

        {/* Change password */}
        <div style={cardStyle}>
          <SectionHeader icon={Lock} label="Change Password" />
          <form action={pwAction} className="p-6 space-y-4">
            {pwState.status === "success" && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-300">Password updated. Other sessions signed out.</p>
              </div>
            )}
            {pwState.status === "error" && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {pwState.message}
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Current Password
              </label>
              <div className="relative">
                <input name="currentPassword" type={showCurrentPw ? "text" : "password"}
                  placeholder="••••••••" required autoComplete="current-password" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowCurrentPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--nc-text-3)" }}>
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                New Password
              </label>
              <div className="relative">
                <input name="newPassword" type={showNewPw ? "text" : "password"}
                  placeholder="Minimum 8 characters" required autoComplete="new-password" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowNewPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--nc-text-3)" }}>
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Confirm New Password
              </label>
              <input name="confirmPassword" type="password" placeholder="••••••••"
                required autoComplete="new-password" className={inputCls} />
            </div>
            <button type="submit" disabled={pwPending}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-black disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {pwPending
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Updating…</>
                : "Update Password"
              }
            </button>
          </form>
        </div>

        {/* Export data */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <Download className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
            <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Export Your Data</h2>
          </div>
          <div className="flex items-center justify-between gap-4 p-6">
            <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>
              Download all your profile data as a portable JSON file.
            </p>
            <button onClick={handleExport} disabled={exporting}
              className="shrink-0 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Exporting…" : "Export JSON"}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ ...cardStyle, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
          <div style={{ ...headerStyle, borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h2 className="font-bold text-sm text-red-400">Danger Zone</h2>
          </div>
          <form action={deleteAction} className="p-6 space-y-4">
            {deleteState.status === "error" && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {deleteState.message}
              </p>
            )}
            <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>
              Permanently deletes your account and all profiles.{" "}
              <span className="font-bold" style={{ color: "var(--nc-text)" }}>This cannot be undone.</span>
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-red-400">
                Type <span className="font-mono text-red-300">DELETE</span> to confirm
              </label>
              <input type="text" name="confirmation" value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE" autoComplete="off"
                className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-white placeholder-red-900 focus:border-red-500/40 focus:outline-none" />
            </div>
            <button type="submit"
              disabled={deleteConfirm !== "DELETE" || deletePending}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40">
              {deletePending
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />Deleting…</>
                : <><Trash2 className="h-4 w-4" />Delete My Account</>
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}