"use client";

import { Moon, Sun, Loader2 } from "lucide-react";
import { useState } from "react";

const CARD_W = 2000;
const CARD_H = 1271;

const THEMES = {
  dark: {
    border: "/brand/dark_border.png",
    qr: "#000000",
    qrX: 1000,
    qrY: 565,
    qrSize: 280,
  },
  light: {
    border: "/brand/white_border.png",
    qr: "#1a3a6b",
    qrX: 1034,
    qrY: 555,
    qrSize: 280,
  },
} as const;

async function generateQR(url: string, color: string): Promise<HTMLCanvasElement> {
  const QRCode = (await import("qrcode")).default;
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, {
    width: 400,
    margin: 0,
    color: { dark: color, light: "#ffffff00" },
    errorCorrectionLevel: "H",
  });
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

export function DashboardCardExport({
  profileId,
  slug,
}: {
  profileId: string;
  slug: string;
}) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(theme: "dark" | "light") {
    setExporting(theme);
    try {
      const c = THEMES[theme];
      const profileUrl = `${window.location.origin}/p/${slug}`;

      // Generate QR with themed color
      const qrCanvas = await generateQR(profileUrl, c.qr);

      // Load border image
      const borderImg = await loadImage(c.border);

      // Create final canvas
      const canvas = document.createElement("canvas");
      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Draw border
      ctx.drawImage(borderImg, 0, 0, CARD_W, CARD_H);

      // Overlay QR at theme-specific center
      ctx.drawImage(qrCanvas, c.qrX - c.qrSize / 2, c.qrY - c.qrSize / 2, c.qrSize, c.qrSize);

      // Export as PNG
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nex-card-${slug}-${theme}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Card export failed:", err);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleExport("dark")}
        disabled={exporting !== null}
        className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all"
        style={{
          background: exporting === "dark" ? "var(--nc-bg-hover)" : "rgba(212,175,55,0.1)",
          color: "#d4af37",
          border: "1px solid rgba(212,175,55,0.2)",
          opacity: exporting !== null && exporting !== "dark" ? 0.5 : 1,
        }}
        title="Export dark theme card"
      >
        {exporting === "dark" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={() => handleExport("light")}
        disabled={exporting !== null}
        className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all"
        style={{
          background: exporting === "light" ? "var(--nc-bg-hover)" : "rgba(30,60,110,0.1)",
          color: "#4a9fd4",
          border: "1px solid rgba(30,60,110,0.2)",
          opacity: exporting !== null && exporting !== "light" ? 0.5 : 1,
        }}
        title="Export light theme card"
      >
        {exporting === "light" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sun className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
