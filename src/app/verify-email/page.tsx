"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { maintenancePath } from "@/lib/maintenance-path";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { NexCardLogo } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const purpose = (searchParams.get("purpose") as "register" | "login") || "register";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenVerifying, setTokenVerifying] = useState(Boolean(token));
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setTokenVerifying(true);
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          router.replace(maintenancePath("/login?verified=1"));
          return;
        }
        setError(data.message ?? "This verification link is invalid or has expired.");
        setTokenVerifying(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to verify email. Please try the code instead.");
        setTokenVerifying(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let remember = true;
      try { remember = sessionStorage.getItem("auth_remember") !== "0"; } catch {}
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode, purpose, remember }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Verification failed.");
        return;
      }
      try { sessionStorage.removeItem("auth_remember"); } catch {}
      if (purpose === "login") {
        const role = data.role;
        const dest = role === "ADMIN" ? "/admin" : "/dashboard";
        router.replace(maintenancePath(dest));
      } else {
        router.replace(maintenancePath("/dashboard/onboarding"));
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      setResendTimer(60);
      setCode(["", "", "", "", "", ""]);
      setInfo("If this email is registered, a new code has been sent.");
      inputsRef.current[0]?.focus();
    } catch {
      // silent
    } finally {
      setResendLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--nc-bg-card)",
    border: "1px solid var(--nc-border)",
    color: "var(--nc-text)",
    borderRadius: "0.75rem",
    textAlign: "center" as const,
    fontWeight: 700,
    outline: "none",
    letterSpacing: "0.1em",
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--nc-bg)" }}>
      <nav className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <NexCardLogo />
        </Link>
        <ThemeToggle />
      </nav>

      <main className="nc-page-enter flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl p-4 sm:space-y-8 sm:p-8"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", boxShadow: "var(--nc-shadow)" }}>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--nc-brand-grad)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--nc-text)" }}>Verify your email</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--nc-text-2)" }}>
              {tokenVerifying
                ? "Confirming your email…"
                : (
                  <>
                    We sent a 6-digit code to<br />
                    <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{email || "your inbox"}</span>
                  </>
                )}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: "var(--nc-danger)", color: "var(--nc-danger)", background: "rgba(220,38,38,0.05)" }}>
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: "var(--nc-brand-2)", color: "var(--nc-text)", background: "var(--nc-brand-2)10" }}>
              {info}
            </div>
          )}

          {!tokenVerifying && (
          <>
          <div className="flex justify-center gap-1.5 sm:gap-3" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-11 w-9 shrink-0 text-lg sm:h-14 sm:w-12 sm:text-2xl"
                style={inputStyle}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || code.join("").length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "var(--nc-brand-grad)" }}>
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Verify & Continue"
            )}
          </button>

          <div className="text-center">
            <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
              Didn&apos;t receive the code?{" "}
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="font-semibold underline"
                  style={{ color: "var(--nc-brand-2)" }}>
                  {resendLoading ? "Sending…" : "Resend code"}
                </button>
              )}
            </p>
          </div>
          </>
          )}

          <div className="text-center">
            <Link href="/login" className="text-xs underline" style={{ color: "var(--nc-text-3)" }}>
              ← Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <ThemeProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--nc-bg)", color: "var(--nc-text-2)" }}>
            Loading…
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </ThemeProvider>
  );
}
