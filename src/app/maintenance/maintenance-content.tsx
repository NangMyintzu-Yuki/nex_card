// src/app/maintenance/maintenance-content.tsx
"use client";

import { NexCardLogoStatic } from "@/components/ui/nex-card-logo";
import { Wrench } from "lucide-react";

export function MaintenanceContent() {
  return (
    <div className="nc-dark flex min-h-dvh items-center justify-center px-4"
      style={{ background: "#0a0a0a", color: "#f5f5f5" }}>
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <Wrench className="h-10 w-10" style={{ color: "#888" }} />
        </div>

        <NexCardLogoStatic size={96} className="mx-auto mb-8" />

        <h1 className="text-3xl font-black sm:text-4xl" style={{ color: "#f5f5f5" }}>
          Under Maintenance
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed" style={{ color: "#888" }}>
          We&apos;re performing scheduled maintenance to improve your experience.
          Check back soon — we&apos;ll be back online shortly.
        </p>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm" style={{ color: "#888" }}>
          <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: "#d4af37" }} />
          Maintenance in progress
        </div>
      </div>
    </div>
  );
}
