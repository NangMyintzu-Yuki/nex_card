"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";
import { ShieldCheck } from "lucide-react";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const token = searchParams.get("token");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const brand2 = isDark ? "#d4af37" : "#1a3a6b";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    // Decode token to get masked email for display
    try {
      const [encoded] = token.split(".");
      if (encoded) {
        const payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.email) {
          const [local, domain] = payload.email.split("@");
          setEmail(`${local.slice(0, 2)}***@${domain}`);
        }
      }
    } catch {}
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, totpCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Verification failed.");
        return;
      }
      const dest = data.role === "ADMIN" ? "/admin" : "/dashboard";
      router.replace(dest);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--nc-bg-card)",
    border: "1px solid var(--nc-border)",
    color: "var(--nc-text)",
    borderRadius: "0.75rem",
    padding: "0.625rem 1rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
  };

  if (!token) return null;

  return (
    <main className="nc-page-enter relative flex min-h-dvh flex-col items-center justify-center overflow-y-auto px-4 py-16 sm:px-4 sm:py-12"
      style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>

      {/* Theme toggle top-right */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <ThemeToggle size="md" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-3 flex flex-col items-center gap-1 sm:mb-8 sm:gap-3">
          <NexCardLogoStatic size={96} showText isDark={isDark} className="sm:hidden" />
          <NexCardLogoStatic size={120} showText isDark={isDark} className="hidden sm:block" />
          <div className="text-center">
            <h1 className="text-lg font-black sm:text-2xl" style={{ color: "var(--nc-text)" }}>Two-Factor Verification</h1>
            <p className="mt-0.5 text-[11px] sm:text-sm" style={{ color: "var(--nc-text-2)" }}>
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-3.5 space-y-2.5 sm:p-6 sm:space-y-4"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", boxShadow: "var(--nc-shadow)" }}>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: `${brand2}15` }}>
              <ShieldCheck className="h-7 w-7" style={{ color: brand2 }} />
            </div>
          </div>

          {email && (
            <p className="text-center text-xs sm:text-sm" style={{ color: "var(--nc-text-2)" }}>
              Signing in as <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{email}</span>
            </p>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs sm:text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold sm:mb-1.5 sm:text-xs" style={{ color: "var(--nc-text-2)" }}>
                Authenticator Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
                autoFocus
                autoComplete="one-time-code"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = brand2)}
                onBlur={e => (e.target.style.borderColor = "var(--nc-border)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black text-black transition-all hover:opacity-90 disabled:opacity-50 sm:mt-2"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Verifying…</>
              ) : "Verify"}
            </button>
          </form>

          <button
            onClick={() => router.push("/login")}
            className="w-full text-center text-xs sm:text-sm hover:underline"
            style={{ color: brand2, background: "none", border: "none", cursor: "pointer" }}
          >
            Back to login
          </button>
        </div>
      </div>
    </main>
  );
}
