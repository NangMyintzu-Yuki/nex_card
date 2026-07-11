// src/app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, AlertCircle, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const passwordStrength = password.length >= 8
    ? password.match(/[A-Z]/) && password.match(/[0-9]/)
      ? "strong"
      : "medium"
    : password.length > 0
      ? "weak"
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Registration failed. Please try again.");
        return;
      }

      router.push("/dashboard/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PresenceCard</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Free forever · No credit card required</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/60 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/60 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/60 focus:outline-none transition-colors"
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {passwordStrength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {["weak","medium","strong"].map((level, i) => (
                      <div key={level} className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: passwordStrength === "weak" && i === 0
                          ? "#ef4444"
                          : passwordStrength === "medium" && i <= 1
                          ? "#f59e0b"
                          : passwordStrength === "strong"
                          ? "#22c55e"
                          : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === "weak" ? "text-red-400" :
                    passwordStrength === "medium" ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-1.5">
              {[
                { label: "At least 8 characters", met: password.length >= 8 },
                { label: "Contains a number", met: /[0-9]/.test(password) },
                { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
              ].map(({ label, met }) => (
                <div key={label} className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-emerald-400" : "text-neutral-600"}`}>
                  <Check className={`h-3 w-3 ${met ? "opacity-100" : "opacity-30"}`} />
                  {label}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-neutral-700">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-neutral-500 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-neutral-500 transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
