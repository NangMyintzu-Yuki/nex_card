// src/app/maintenance/maintenance-content.tsx
"use client";

import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";

export function MaintenanceContent() {
  return (
    <div className="nc-dark relative flex min-h-dvh items-center justify-center overflow-hidden px-4"
      style={{ background: "#0a0a0a" }}>

      {/* Animated background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="maintenance-orb-1 absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }} />
        <div className="maintenance-orb-2 absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #f0c050 0%, transparent 70%)" }} />
        <div className="maintenance-orb-3 absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

      <div className="relative z-10 text-center">
        {/* Animated gear icon */}
        <div className="maintenance-gear mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl"
          style={{
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.15)",
            boxShadow: "0 0 60px rgba(212,175,55,0.08)",
          }}>
          <svg className="maintenance-spin h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </div>

        {/* Logo with glow */}
        <div className="maintenance-fade-in mx-auto mb-8" style={{ animationDelay: "0.2s" }}>
          <NexCardLogoStatic size={96} isDark className="mx-auto" />
        </div>

        {/* Title */}
        <h1 className="maintenance-fade-in mb-4 text-4xl font-black tracking-tight sm:text-5xl"
          style={{ color: "#f5f5f5", animationDelay: "0.4s" }}>
          Under Maintenance
        </h1>

        {/* Subtitle */}
        <p className="maintenance-fade-in mx-auto mb-10 max-w-md text-base leading-relaxed sm:text-lg"
          style={{ color: "#777", animationDelay: "0.6s" }}>
          We&apos;re performing scheduled maintenance to improve your experience.
          Check back soon — we&apos;ll be back online shortly.
        </p>

        {/* Animated progress bar */}
        <div className="maintenance-fade-in mx-auto mb-8 max-w-xs" style={{ animationDelay: "0.8s" }}>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "#1a1a1a" }}>
            <div className="maintenance-progress h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #d4af37, #f0c050, #d4af37)" }} />
          </div>
        </div>

        {/* Status indicator */}
        <div className="maintenance-fade-in flex items-center justify-center gap-3 text-sm"
          style={{ color: "#777", animationDelay: "1s" }}>
          <span className="maintenance-pulse relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#d4af37" }} />
            <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: "#d4af37" }} />
          </span>
          Maintenance in progress
        </div>
      </div>
    </div>
  );
}
