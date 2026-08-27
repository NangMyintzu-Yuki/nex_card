// src/app/admin/security/page.tsx
"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { maintenancePath } from "@/lib/maintenance-path";
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import QRCode from "qrcode";
import {
  changePasswordAction, type ChangePasswordState,
} from "@/lib/actions/account-actions";

export default function AdminSecurityPage() {
  const router = useRouter();

  // ── 2FA State ──
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // ── Password State ──
  const [pwState, pwAction, pwPending] = useActionState<ChangePasswordState, FormData>(
    changePasswordAction, { status: "idle" }
  );
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/2fa/setup");
        const data = await res.json();
        if (!res.ok) {
          setTwoFaError(data.error ?? "Unable to load 2FA setup.");
          return;
        }
        if (data.enabled) {
          setEnabled(true);
          return;
        }
        setSecret(data.secret ?? "");
        setOtpauthUrl(data.otpauthUrl ?? "");
        if (data.otpauthUrl) {
          const url = await QRCode.toDataURL(data.otpauthUrl, { margin: 1, width: 192 });
          if (!cancelled) setQrDataUrl(url);
        }
      } catch {
        setTwoFaError("Unable to load 2FA setup.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function enable() {
    setSaving(true);
    setTwoFaError("");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.error ?? "Invalid code.");
        return;
      }
      setEnabled(true);
      router.replace(maintenancePath("/admin"));
      router.refresh();
    } catch {
      setTwoFaError("Could not enable 2FA.");
    } finally {
      setSaving(false);
    }
  }

  const cardStyle = { background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", borderRadius: "1rem", overflow: "hidden" };
  const headerStyle = { borderBottom: "1px solid var(--nc-border)", padding: "1rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem" };
  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors nc-input";

  return (
    <div className="mx-auto max-w-lg nc-page px-3 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black" style={{ color: "var(--nc-text)" }}>Security</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
          Manage your account security settings
        </p>
      </div>

      <div className="space-y-5">
        {/* ── 2FA Section ── */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
            <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Two-Factor Authentication</h2>
          </div>
          <div className="p-4 sm:p-6">
            <p className="mb-5 text-sm" style={{ color: "var(--nc-text-2)" }}>
              Admin accounts must enable an authenticator app before using the control panel.
            </p>

            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--nc-brand-1)" }} />
            ) : enabled ? (
              <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                <Check className="h-4 w-4 shrink-0" />
                Two-factor authentication is enabled on this account.
              </div>
            ) : (
              <div className="space-y-5">
                {qrDataUrl ? (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="Authenticator QR code" className="h-48 w-48 rounded-lg bg-white p-2" />
                  </div>
                ) : null}
                {secret ? (
                  <div className="rounded-xl p-3" style={{ background: "var(--nc-bg)" }}>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--nc-text-3)" }}>Manual entry key</p>
                    <p className="font-mono text-sm font-bold tracking-wider" style={{ color: "var(--nc-text)" }}>{secret}</p>
                  </div>
                ) : null}
                {otpauthUrl ? (
                  <p className="break-all text-[10px]" style={{ color: "var(--nc-text-3)" }}>{otpauthUrl}</p>
                ) : null}
                <label className="block text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                  Enter 6-digit code from your app
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="mt-2 w-full rounded-xl border px-4 py-3 font-mono text-lg tracking-[0.5em] text-center"
                    style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)", color: "var(--nc-text)" }}
                  />
                </label>
                {twoFaError ? (
                  <div className="flex items-center gap-2 rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <AlertCircle className="h-4 w-4 shrink-0" /> {twoFaError}
                  </div>
                ) : null}
                <button
                  type="button" onClick={enable}
                  disabled={code.length !== 6 || saving}
                  className="nc-btn-brand flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {saving ? "Verifying…" : "Enable 2FA"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Change Password Section ── */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <Lock className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
            <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Change Password</h2>
          </div>
          <form action={pwAction} className="space-y-4 p-4 sm:p-6">
            {pwState.status === "success" && (
              <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                <Check className="h-4 w-4 shrink-0" /> Password updated successfully. Other sessions signed out.
              </div>
            )}
            {pwState.status === "error" && (
              <div className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                <AlertCircle className="h-4 w-4 shrink-0" /> {pwState.message}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Current Password</label>
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
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>New Password</label>
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
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Confirm New Password</label>
              <input name="confirmPassword" type="password" placeholder="••••••••"
                required autoComplete="new-password" className={inputCls} />
            </div>
            <button type="submit" disabled={pwPending}
              className="nc-btn-brand flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50">
              {pwPending
                ? <><Loader2 className="h-4 w-4 animate-spin" />Updating…</>
                : "Update Password"
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
