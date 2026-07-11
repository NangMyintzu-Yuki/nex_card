// src/app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { User, Lock, Trash2, AlertTriangle, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [nameValue, setNameValue]           = useState("");
  const [currentPw, setCurrentPw]           = useState("");
  const [newPw, setNewPw]                   = useState("");
  const [confirmPw, setConfirmPw]           = useState("");
  const [nameSaved, setNameSaved]           = useState(false);
  const [pwSaved, setPwSaved]               = useState(false);
  const [pwError, setPwError]               = useState("");
  const [deleteConfirm, setDeleteConfirm]   = useState("");

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to a Server Action — updateAccountName(nameValue)
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    // TODO: wire to a Server Action — updatePassword(currentPw, newPw)
    setPwSaved(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSaved(false), 2500);
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none transition-colors";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Account Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile and security preferences
        </p>
      </div>

      <div className="space-y-5">
        {/* ── Profile info ──────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-white/5 px-6 py-4">
            <User className="h-4 w-4 text-neutral-500" />
            <h2 className="font-bold text-white text-sm">Profile Information</h2>
          </div>
          <form onSubmit={handleNameSave} className="px-6 py-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                Display Name
              </label>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                Avatar URL
              </label>
              <input
                type="url"
                placeholder="https://…/avatar.jpg"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-neutral-600">
                Direct link to a publicly accessible image (JPG, PNG, WebP).
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400"
            >
              {nameSaved ? <><Check className="h-4 w-4" /> Saved!</> : "Save Changes"}
            </button>
          </form>
        </section>

        {/* ── Change password ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-white/5 px-6 py-4">
            <Lock className="h-4 w-4 text-neutral-500" />
            <h2 className="font-bold text-white text-sm">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="px-6 py-5 space-y-4">
            {pwError && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {pwError}
              </p>
            )}
            {pwSaved && (
              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
                Password updated successfully.
              </p>
            )}
            {[
              { label: "Current Password", value: currentPw, set: setCurrentPw, auto: "current-password" },
              { label: "New Password",     value: newPw,     set: setNewPw,     auto: "new-password" },
              { label: "Confirm New Password", value: confirmPw, set: setConfirmPw, auto: "new-password" },
            ].map(({ label, value, set, auto }) => (
              <div key={label}>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">{label}</label>
                <input type="password" value={value} onChange={(e) => set(e.target.value)}
                  autoComplete={auto} placeholder="••••••••" className={inputCls} />
              </div>
            ))}
            <button type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400">
              Update Password
            </button>
          </form>
        </section>

        {/* ── Active profiles ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <h2 className="font-bold text-white text-sm">Your Public Links</h2>
            <Link href="/dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Manage profiles →
            </Link>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-neutral-500 mb-3">
              Your active public pages. Share these links anywhere.
            </p>
            <p className="text-xs text-neutral-700">
              Go to your{" "}
              <Link href="/dashboard" className="text-indigo-400 hover:underline">
                Profiles dashboard
              </Link>{" "}
              to manage all your pages.
            </p>
          </div>
        </section>

        {/* ── Export data ───────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
          <div className="border-b border-white/5 px-6 py-4">
            <h2 className="font-bold text-white text-sm">Export Your Data</h2>
          </div>
          <div className="px-6 py-5 flex items-start justify-between gap-4">
            <p className="text-sm text-neutral-500">
              Download all your profile data as JSON. This includes your
              dynamic content, settings, and metadata.
            </p>
            <button
              className="shrink-0 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:border-white/20 hover:bg-white/10 transition-all"
              onClick={() => {
                // TODO: wire to GET /api/export/data
                alert("Export will download your data as data-export.json");
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Export JSON
            </button>
          </div>
        </section>

        {/* ── Danger zone ───────────────────────────────────────────── */}
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-red-500/20 px-6 py-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h2 className="font-bold text-red-400 text-sm">Danger Zone</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-neutral-500">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-400">
                Type <span className="font-mono text-red-400">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-red-500/40 focus:outline-none"
              />
            </div>
            <button
              disabled={deleteConfirm !== "DELETE"}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                // TODO: wire to Server Action — deleteAccount()
                alert("Account deletion would be triggered here.");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete My Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
