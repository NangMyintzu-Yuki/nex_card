// src/app/login/page.tsx — themed NEX CARD login page
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const brand2 = isDark ? "#d4af37" : "#2d6eb5";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Login failed."); return; }
      router.push("/dashboard");
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>

      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="md" showLabel />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <NexCardLogoStatic size={52} isDark={isDark} />
          <div className="text-center">
            <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Welcome back</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--nc-text-2)" }}>Sign in to your NEX CARD account</p>
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = brand2)}
                onBlur={e => (e.target.style.borderColor = "var(--nc-border)")}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Password</label>
                <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: brand2 }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = brand2)}
                onBlur={e => (e.target.style.borderColor = "var(--nc-border)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: `linear-gradient(135deg, ${brand2}, ${brand3})` }}>
              {loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Signing in…</>
              ) : "Sign In"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="rounded-xl px-4 py-3" style={{ background: "var(--nc-bg-hover)", border: "1px solid var(--nc-border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--nc-text-2)" }}>Demo credentials</p>
            <button onClick={() => { setEmail("demo@nexcard.io"); setPassword("demo-password-123"); }}
              className="text-xs hover:underline" style={{ color: brand2 }}>
              demo@nexcard.io / demo-password-123
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--nc-text-2)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold hover:underline" style={{ color: brand2 }}>
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}