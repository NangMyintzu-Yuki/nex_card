"use client";

import { CreditCard, Sun, Moon, Loader2, AlertCircle, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UserProfile {
  id: string;
  slug: string;
  template: { name: string };
  category: { name: string };
}

const CARD_W = 856;
const CARD_H = 540;

const THEMES = {
  dark: {
    bg: "#000000",
    qr: "#d4af37",
    text: "#d4af37",
    accent: "#d4af37",
    wave: "#d4af37",
    waveAlpha: 0.4,
    frameBorder: "#d4af37",
  },
  light: {
    bg: "#ffffff",
    qr: "#1a1a2e",
    text: "#1a1a2e",
    accent: "#1e3a6b",
    wave: "#1e3a6b",
    waveAlpha: 0.25,
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

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2 - 20 * S;

  const frameSize = 220 * S;
  const frameX = cx - frameSize / 2;
  const frameY = cy - frameSize / 2;
  const frameR = 28 * S;

  ctx.fillStyle = c.bg;
  roundRect(ctx, frameX, frameY, frameSize, frameSize, frameR);
  ctx.fill();

  ctx.strokeStyle = c.frameBorder;
  ctx.lineWidth = 6 * S;
  roundRect(ctx, frameX, frameY, frameSize, frameSize, frameR);
  ctx.stroke();

  const qrSize = 170 * S;
  const qrX = cx - qrSize / 2;
  const qrY = cy - qrSize / 2;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.strokeStyle = c.wave;
  ctx.globalAlpha = c.waveAlpha;
  ctx.lineWidth = 4 * S;
  ctx.lineCap = "round";

  const waveOffsetX = 38 * S;

  for (let i = 1; i <= 3; i++) {
    const r = (28 + i * 18) * S;
    ctx.beginPath();
    ctx.arc(cx - waveOffsetX, cy, r, -130 * (Math.PI / 180), 130 * (Math.PI / 180));
    ctx.stroke();
  }

  for (let i = 1; i <= 3; i++) {
    const r = (28 + i * 18) * S;
    ctx.beginPath();
    ctx.arc(cx + waveOffsetX, cy, r, -50 * (Math.PI / 180), 50 * (Math.PI / 180));
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

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

export function CardExportButton({
  userId,
  profileCount,
}: {
  userId: string;
  profileCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (profileCount === 0) return null;

  async function fetchProfiles() {
    if (profiles.length > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/profiles`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    fetchProfiles();
  }

  async function handleExport(profileId: string, slug: string, theme: "dark" | "light") {
    const key = `${profileId}:${theme}`;
    setExporting(key);
    setError("");

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
      const msg = err instanceof Error ? err.message : "Export failed";
      setError(msg);
      setTimeout(() => setError(""), 4000);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}
        title="Export NFC Card"
      >
        <CreditCard className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpen(false)} />

          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-hidden rounded-t-2xl border shadow-2xl
              sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-1 sm:w-80 sm:rounded-2xl"
            style={{ background: "var(--nc-bg-card)", borderColor: "var(--nc-border)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--nc-border)" }}>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--nc-text)" }}>Export Card</p>
                <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>PNG front side · Dark / Light</p>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg sm:hidden" style={{ color: "var(--nc-text-3)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 border-b px-4 py-2.5 text-xs" style={{ borderColor: "var(--nc-border)", background: "rgba(239,68,68,0.06)", color: "#ef4444" }}>
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto sm:max-h-64">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8">
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--nc-text-3)" }} />
                  <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>Loading profiles…</span>
                </div>
              ) : profiles.length === 0 && !error ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>No profiles found</p>
                </div>
              ) : (
                profiles.map((profile) => (
                  <div key={profile.id} className="border-b px-4 py-3 last:border-b-0" style={{ borderColor: "var(--nc-border)" }}>
                    <div className="mb-2">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--nc-text)" }}>{profile.slug}</p>
                      <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>{profile.category.name} · {profile.template.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(profile.id, profile.slug, "dark")}
                        disabled={exporting !== null}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition-all sm:py-1.5"
                        style={{
                          background: exporting === `${profile.id}:dark` ? "var(--nc-bg-hover)" : "#1a1a2e",
                          color: "#d4af37",
                          border: "1px solid #d4af3730",
                          opacity: exporting !== null && exporting !== `${profile.id}:dark` ? 0.5 : 1,
                        }}
                      >
                        {exporting === `${profile.id}:dark` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Moon className="h-3 w-3" />}
                        Dark
                      </button>
                      <button
                        onClick={() => handleExport(profile.id, profile.slug, "light")}
                        disabled={exporting !== null}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition-all sm:py-1.5"
                        style={{
                          background: exporting === `${profile.id}:light` ? "var(--nc-bg-hover)" : "#f0f4f8",
                          color: "#1e3c6e",
                          border: "1px solid #1e3c6e30",
                          opacity: exporting !== null && exporting !== `${profile.id}:light` ? 0.5 : 1,
                        }}
                      >
                        {exporting === `${profile.id}:light` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sun className="h-3 w-3" />}
                        Light
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
