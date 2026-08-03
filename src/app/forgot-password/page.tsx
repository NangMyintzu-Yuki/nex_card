// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const brand2 = isDark ? "#d4af37" : "#2d6eb5";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Request failed.");
        return;
      }
      setMessage(data.message ?? "Check your email for a reset link.");
    } catch {
      setError("An unexpected error occurred.");
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
    width: "100%" as const,
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle size="sm" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <NexCardLogoStatic className="h-10" />
        </div>
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--nc-bg-card)",
            border: "1px solid var(--nc-border)",
          }}
        >
          <h1
            className="text-xl font-black sm:text-2xl"
            style={{ color: "var(--nc-text)" }}
          >
            Reset password
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--nc-text-3)" }}>
            Enter your account email and we&apos;ll send a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold"
                style={{ color: "var(--nc-text-2)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm" style={{ color: "var(--nc-success)" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-black text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${brand2}, ${brand3})`,
              }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </div>
        <p
          className="mt-4 text-center text-sm"
          style={{ color: "var(--nc-text-2)" }}
        >
          <Link href="/login" className="font-bold hover:underline" style={{ color: brand2 }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
