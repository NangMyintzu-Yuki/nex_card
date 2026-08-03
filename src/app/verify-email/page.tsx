// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-context";

function VerifyBody() {
  const params = useSearchParams();
  const token = params.get("token");
  const errorParam = params.get("error");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const brand2 = isDark ? "#d4af37" : "#2d6eb5";

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    errorParam ? "error" : token ? "loading" : "idle"
  );
  const [message, setMessage] = useState(
    errorParam
      ? "This verification link is invalid or has expired."
      : "Waiting for verification…"
  );

  useEffect(() => {
    if (!token || errorParam) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.message ?? "Verification failed.");
          return;
        }
        setStatus("ok");
        setMessage(data.message ?? "Email verified.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Unable to verify email.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, errorParam]);

  return (
    <div
      className="rounded-2xl p-6 text-center sm:p-8"
      style={{
        background: "var(--nc-bg-card)",
        border: "1px solid var(--nc-border)",
      }}
    >
      <h1
        className="text-xl font-black"
        style={{ color: "var(--nc-text)" }}
      >
        Email verification
      </h1>
      <p
        className="mt-3 text-sm"
        style={{
          color: status === "error" ? "#ef4444" : "var(--nc-text-2)",
        }}
      >
        {status === "loading" ? "Verifying your email…" : message}
      </p>
      {(status === "ok" || status === "error" || status === "idle") && (
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-bold hover:underline"
          style={{ color: brand2 }}
        >
          Continue to sign in
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <VerifyBody />
        </Suspense>
      </div>
    </main>
  );
}
