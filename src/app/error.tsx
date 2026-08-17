// src/app/error.tsx
// Global error boundary — catches unexpected server/client errors

"use client";

import { useEffect } from "react";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
    void import("@/lib/observability").then(({ captureException }) =>
      captureException(error, { digest: error.digest, source: "app/error" })
    );
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>

      <h1 className="text-2xl font-black">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
        {process.env.NODE_ENV === "development" && error.message
          ? error.message
          : "An unexpected error occurred. Our team has been notified."}
        {error.digest && (
          <span className="mt-1 block font-mono text-xs text-neutral-700">
            Error ID: {error.digest}
          </span>
        )}
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/20 transition-all"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
