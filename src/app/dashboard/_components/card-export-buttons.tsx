"use client";

import { Moon, Sun, Loader2 } from "lucide-react";
import { useState } from "react";

const CARD_W = 856;
const CARD_H = 540;

const THEMES = {
  dark: {
    bg: "#000000",
    qr: "#d4af37",
    text: "#d4af37",
    accent: "#d4af37",
    accentDark: "#b8941f",
    wave: "#d4af37",
    waveAlpha: 0.4,
    qrBg: "#000000",
    frameBorder: "#d4af37",
  },
  light: {
    bg: "#ffffff",
    qr: "#1a1a2e",
    text: "#1a1a2e",
    accent: "#1e3a6b",
    accentDark: "#152c52",
    wave: "#1e3a6b",
    waveAlpha: 0.25,
    qrBg: "#ffffff",
    frameBorder: "#1e3a6b",
  },
} as const;

function drawCard(
  ctx: CanvasRenderingContext2D,
  qrImage: HTMLImageElement,
  theme: "dark" | "light"
) {
  const c = THEMES[theme];
  const S = 3;
  const W = CARD_W * S;
  const H = CARD_H * S;

  ctx.clearRect(0, 0, W, H);

  // ── Background ──
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2 - 20 * S;

  // ── QR frame (rounded rect with gold border) ──
  const frameSize = 220 * S;
  const frameX = cx - frameSize / 2;
  const frameY = cy - frameSize / 2;
  const frameR = 28 * S;

  // Frame fill
  ctx.fillStyle = c.bg;
  roundRect(ctx, frameX, frameY, frameSize, frameSize, frameR);
  ctx.fill();

  // Frame border (thick gold)
  ctx.strokeStyle = c.frameBorder;
  ctx.lineWidth = 6 * S;
  roundRect(ctx, frameX, frameY, frameSize, frameSize, frameR);
  ctx.stroke();

  // ── QR code inside frame ──
  const qrSize = 170 * S;
  const qrX = cx - qrSize / 2;
  const qrY = cy - qrSize / 2;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // ── NFC wave arcs (left side) ──
  ctx.strokeStyle = c.wave;
  ctx.globalAlpha = c.waveAlpha;
  ctx.lineWidth = 4 * S;
  ctx.lineCap = "round";

  const waveOffsetX = 38 * S;

  for (let i = 1; i <= 3; i++) {
    const r = (28 + i * 18) * S;

    // Left arcs
    ctx.beginPath();
    ctx.arc(cx - waveOffsetX, cy, r, -130 * (Math.PI / 180), 130 * (Math.PI / 180));
    ctx.stroke();
  }

  for (let i = 1; i <= 3; i++) {
    const r = (28 + i * 18) * S;

    // Right arcs
    ctx.beginPath();
    ctx.arc(cx + waveOffsetX, cy, r, -50 * (Math.PI / 180), 50 * (Math.PI / 180));
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // ── "NEX CARD" text ──
  ctx.fillStyle = c.text;
  ctx.font = `bold ${36 * S}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("NEX CARD", cx, cy + frameSize / 2 + 30 * S);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
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
      const qrUrl = `/api/qr/${slug}?format=png&size=400&t=${Date.now()}`;
      let qrImage: HTMLImageElement;
      try {
        qrImage = await loadImage(qrUrl);
      } catch {
        throw new Error("Failed to load QR code. Is the profile published?");
      }

      const S = 3;
      const canvas = document.createElement("canvas");
      canvas.width = CARD_W * S;
      canvas.height = CARD_H * S;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      drawCard(ctx, qrImage, theme);

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
