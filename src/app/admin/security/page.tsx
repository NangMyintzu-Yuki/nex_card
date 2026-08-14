// src/app/admin/security/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";

export default function AdminSecurityPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/2fa/setup");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Unable to load 2FA setup.");
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
        setError("Unable to load 2FA setup.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        return;
      }
      setEnabled(true);
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not enable 2FA.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6" style={{ color: "var(--nc-brand-1)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>
          Admin two-factor authentication
        </h1>
      </div>
      <p className="mb-8 text-sm" style={{ color: "var(--nc-text-2)" }}>
        Admin accounts must enable an authenticator app before using the control panel.
      </p>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--nc-brand-1)" }} />
      ) : enabled ? (
        <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>
          Two-factor authentication is already enabled on this account.
        </p>
      ) : (
        <div className="space-y-6">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Authenticator QR code" className="h-48 w-48 rounded-lg bg-white p-2" />
          ) : null}
          {secret ? (
            <p className="font-mono text-sm" style={{ color: "var(--nc-text)" }}>
              Secret: {secret}
            </p>
          ) : null}
          {otpauthUrl ? (
            <p className="break-all text-xs" style={{ color: "var(--nc-text-3)" }}>
              {otpauthUrl}
            </p>
          ) : null}
          <label className="block text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
            6-digit code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono tracking-widest"
              style={{
                background: "var(--nc-bg-card)",
                borderColor: "var(--nc-border)",
                color: "var(--nc-text)",
              }}
            />
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="button"
            onClick={enable}
            disabled={code.length !== 6 || saving}
            className="rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "var(--nc-brand-1)" }}
          >
            {saving ? "Verifying…" : "Enable 2FA"}
          </button>
        </div>
      )}
    </div>
  );
}
