// src/app/register/page.tsx — themed NEX CARD register page
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

function PasswordStrength({ pw }: { pw: string }) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  if (!pw) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {checks.map((ok, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? colors[score] : "var(--nc-border)" }} />
        ))}
      </div>
      <p className="mt-0.5 text-[10px]" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const brand2 = isDark ? "#d4af37" : "#2d6eb5";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          router.replace(data.user?.role === "ADMIN" ? "/admin" : "/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Registration failed."); return; }
      router.replace("/dashboard/onboarding");
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>

      <div className="absolute top-4 right-4">
        <ThemeToggle size="md" showLabel />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <NexCardLogoStatic size={52} isDark={isDark} />
          <div className="text-center">
            <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Create your account</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--nc-text-2)" }}>
              Join NEX CARD — it&apos;s free
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", boxShadow: "var(--nc-shadow)" }}>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Full Name
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Alex Rivera" required autoComplete="name" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = brand2)}
                onBlur={e => (e.target.style.borderColor = "var(--nc-border)")} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = brand2)}
                onBlur={e => (e.target.style.borderColor = "var(--nc-border)")} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" required autoComplete="new-password" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = brand2)}
                onBlur={e => (e.target.style.borderColor = "var(--nc-border)")} />
              <PasswordStrength pw={password} />
            </div>

            <button type="submit" disabled={loading || password.length < 8}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {loading
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Creating account…</>
                : "Create Free Account →"
              }
            </button>
          </form>

          {/* Feature list */}
          <div className="pt-2 space-y-1.5">
            {["20 premium templates", "QR code generation", "NFC tag programming", "Analytics dashboard"].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--nc-text-2)" }}>
                <span style={{ color: brand2 }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--nc-text-2)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-bold hover:underline" style={{ color: brand2 }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}