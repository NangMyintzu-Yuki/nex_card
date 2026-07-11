
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowLeft, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — PresenceCard",
  description: "This profile doesn't exist or has been removed.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, #6366f1, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-10 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">PresenceCard</span>
        </Link>

        {/* 404 visual */}
        <div className="mb-6 text-8xl font-black leading-none tracking-tighter text-white/10">
          404
        </div>

        <div
          className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <Search className="h-6 w-6 text-indigo-400" />
        </div>

        <h1 className="mt-4 text-2xl font-black">Profile Not Found</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          This PresenceCard page doesn&apos;t exist, has been removed, or
          hasn&apos;t been published yet.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/20"
          >
            Create Your Own Card
          </Link>
        </div>
      </div>
    </main>
  );
}