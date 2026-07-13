// src/app/not-found.tsx — NEX CARD themed 404 page
import Link from "next/link";
import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>

      {/* Logo */}
      <div className="mb-8">
        <NexCardLogoStatic size={48} isDark />
      </div>

      {/* Big 404 */}
      <div className="relative mb-6">
        <p className="text-[120px] font-black leading-none tracking-tighter select-none"
          style={{ color: "var(--nc-bg-3)", WebkitTextStroke: "2px var(--nc-border)" }}>
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", boxShadow: "var(--nc-shadow)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="var(--nc-text-3)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-black mb-2" style={{ color: "var(--nc-text)" }}>
        Profile Not Found
      </h1>
      <p className="max-w-sm text-sm leading-relaxed mb-8" style={{ color: "var(--nc-text-2)" }}>
        This NEX CARD page doesn&apos;t exist, has been removed, or hasn&apos;t been published yet.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/"
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-black text-black transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #d4af37, #f0c050)" }}>
          ← Back to Home
        </Link>
        <Link href="/register"
          className="flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
          style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
          Create Your Own Card
        </Link>
      </div>

      <p className="mt-12 text-xs" style={{ color: "var(--nc-text-3)" }}>NEX CARD</p>
    </main>
  );
}