// src/components/templates/qr-scan-badge.tsx
// Subtle floating badge shown when a profile is accessed via QR scan (/p/[slug])
// Gives the scanner context that they arrived via QR and lets them open the QR link

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, X } from "lucide-react";

interface QRScanBadgeProps {
  slug: string;
  accentColor?: string;
}

export function QRScanBadge({ slug, accentColor = "#6366f1" }: QRScanBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Slide in after a short delay so it doesn't compete with the template load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setDismissed(true), 6000);
    return () => clearTimeout(t);
  }, [visible]);

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-5 left-1/2 z-[200] -translate-x-1/2 transition-all duration-500"
      style={{
        transform: `translateX(-50%) translateY(${visible ? "0" : "80px"})`,
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl"
        style={{
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: `${accentColor}30`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}15`,
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accentColor}20` }}
        >
          <QrCode className="h-4 w-4" style={{ color: accentColor }} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-white">
            Opened via QR scan
          </p>
          <p className="text-xs text-neutral-500">
            www.nexcard.wetechmm.com/p/{slug}
          </p>
        </div>

        <div className="flex items-center gap-1.5 ml-1">
          <Link
            href={`/${slug}`}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-80"
            style={{ background: accentColor }}
          >
            Full Page
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-500 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}