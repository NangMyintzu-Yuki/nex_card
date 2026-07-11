// src/app/p/[slug]/error.tsx
// Error boundary for the QR-scanned public profile route

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, QrCode } from "lucide-react";

export default function QRProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[QRProfileError]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-sm">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <QrCode className="h-6 w-6 text-red-400" />
        </div>

        <h1 className="text-2xl font-black">Failed to Load Profile</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          This profile couldn&apos;t load after scanning the QR code.
          This is likely temporary — please try again.
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-xs text-neutral-700">
            Ref: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/20 transition-all"
          >
            PresenceCard Home
          </Link>
        </div>
      </div>
    </main>
  );
}