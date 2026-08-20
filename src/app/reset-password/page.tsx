// src/app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { useRouter, useSearchParams } from "next/navigation";
import { maintenancePath } from "@/lib/maintenance-path";
import { Eye, EyeOff } from "lucide-react";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const brand2 = isDark ? "#d4af37" : "#1a3a6b";
  const brand3 = isDark ? "#f0c050" : "#4a9fd4";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Request a new link.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Reset failed.");
        return;
      }
      router.replace(maintenancePath("/login?reset=1"));
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
        Choose a new password
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={{ color: "var(--nc-text-2)" }}
          >
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              style={{ ...inputStyle, paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--nc-text-3)" }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={{ color: "var(--nc-text-2)" }}
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              style={{ ...inputStyle, paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--nc-text-3)" }}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {error}
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
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const brand2 = isDark ? "#d4af37" : "#1a3a6b";

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle size="sm" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <NexCardLogoStatic className="h-10" />
        </div>
        <Suspense
          fallback={
            <p className="text-center text-sm" style={{ color: "var(--nc-text-3)" }}>
              Loading…
            </p>
          }
        >
          <ResetForm />
        </Suspense>
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
