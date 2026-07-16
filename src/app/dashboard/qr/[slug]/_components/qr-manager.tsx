// src/app/dashboard/qr/[slug]/_components/qr-manager.tsx
"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode, Lock, Download, Share2, ExternalLink,
  Eye, Smartphone, AlertTriangle, Check, Copy,
  ArrowLeft, RefreshCw, Scan,
} from "lucide-react";
import { generateQRAction, GenerateQRState } from "@/lib/actions/qr-action";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface QRManagerProps {
  profile: {
    id: string;
    slug: string;
    isPublished: boolean;
    templateLocked: boolean;
    qrLocked: boolean;
    qrGeneratedAt: string | null;
    qrScanCount: number;
    viewCount: number;
    updatedAt: Date;
    category: { name: string; slug: string };
    template: {
      name: string;
      codeIdentifier: string;
      accentColor: string | null;
      thumbnailUrl: string;
    };
  };
  appUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function QRManager({ profile, appUrl }: QRManagerProps) {
  const accentColor = profile.template.accentColor ?? "#6366f1";
  const publicUrl   = `${appUrl}/${profile.slug}`;
  const qrScanUrl   = `${appUrl}/p/${profile.slug}`;
  const qrApiUrl    = `/api/qr/${profile.slug}`;

  const [formState, submitAction, isPending] = useActionState<GenerateQRState, FormData>(
    generateQRAction,
    { status: "idle" }
  );

  const [isLocked, setIsLocked]   = useState(profile.qrLocked);
  const [lockedAt, setLockedAt]   = useState<string | null>(profile.qrGeneratedAt);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [qrSize, setQrSize]       = useState<256 | 512 | 1024>(512);
  const [qrFormat, setQrFormat]   = useState<"svg" | "png">("svg");
  const qrImgRef = useRef<HTMLImageElement>(null);

  // Update lock state when action completes
  useEffect(() => {
    if (formState.status === "success") {
      setIsLocked(true);
      setLockedAt(formState.qrGeneratedAt);
      setShowConfirm(false);
    }
  }, [formState]);

  function handleCopy() {
    navigator.clipboard.writeText(qrScanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDownload(format: "svg" | "png", size: number) {
    const url = `${qrApiUrl}?format=${format}&size=${size}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `presencecard-qr-${profile.slug}.${format}`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `My PresenceCard — /${profile.slug}`,
        text: `Scan this QR or visit: ${qrScanUrl}`,
        url: qrScanUrl,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard"
            className="nc-btn-ghost mb-2 inline-flex items-center gap-1.5 text-xs transition-colors px-2 py-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profiles
          </Link>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--nc-text)" }}>
            <QrCode className="h-6 w-6" style={{ color: accentColor }} />
            QR Code
            <span className="font-mono text-indigo-400">/{profile.slug}</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
            {profile.category.name} · {profile.template.name}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/edit/${profile.slug}`}
            className="nc-btn-brand flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
            Edit Content
          </Link>
          <Link href={publicUrl} target="_blank" rel="noopener noreferrer"
            className="nc-btn-ghost flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-all">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">

        {/* ── LEFT: QR Display (3 cols) ────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* QR code card */}
          <div className="nc-card overflow-hidden rounded-3xl">
            {/* QR visual area */}
            <div className="relative flex items-center justify-center p-10"
              style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}03)` }}>

              {isLocked ? (
                <div className="relative">
                  {/* Actual QR from API */}
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl"
                    style={{ boxShadow: `0 0 40px ${accentColor}25` }}>
                    <img
                      ref={qrImgRef}
                      src={`${qrApiUrl}?format=svg&size=512`}
                      alt={`QR code for ${profile.slug}`}
                      width={220}
                      height={220}
                      className="block"
                    />
                    {/* PresenceCard logo overlay in center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md">
                      <div className="h-6 w-6 rounded-md flex items-center justify-center"
                        style={{ background: accentColor }}>
                        <span className="text-white text-xs font-black">P</span>
                      </div>
                    </div>
                  </div>

                  {/* Lock badge */}
                  <div className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                    <Lock className="h-3 w-3" /> Locked
                  </div>
                </div>
              ) : (
                /* Placeholder QR before generation */
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed"
                    style={{ borderColor: `${accentColor}40`, background: `${accentColor}08` }}>
                    <div className="space-y-2">
                      <QrCode className="mx-auto h-16 w-16" style={{ color: `${accentColor}50` }} />
                      <p className="text-xs px-4" style={{ color: "var(--nc-text-3)" }}>
                        Generate your QR to see it here
                      </p>
                    </div>
                    {/* Corner decorations to hint QR */}
                    {[
                      "top-2 left-2 border-t-2 border-l-2 rounded-tl-lg",
                      "top-2 right-2 border-t-2 border-r-2 rounded-tr-lg",
                      "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg",
                      "bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute h-6 w-6 ${cls}`}
                        style={{ borderColor: `${accentColor}60` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR URL display */}
            <div className="px-5 py-4" style={{ borderTop: "1px solid var(--nc-border)" }}>
              <p className="mb-1 text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>QR points to</p>
              <div className="flex items-center justify-between gap-3">
                <code className="nc-input flex-1 truncate rounded-lg px-3 py-2 text-xs font-mono" style={{ color: "var(--nc-brand-2)" }}>
                  {qrScanUrl}
                </code>
                <button onClick={handleCopy}
                  className="nc-btn-ghost flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all">
                  {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
            </div>
          </div>

          {/* Download controls (only when locked) */}
          {isLocked && (
            <div className="nc-card overflow-hidden rounded-2xl">
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
                <h3 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Download QR Code</h3>
                <p className="mt-0.5 text-xs" style={{ color: "var(--nc-text-3)" }}>
                  High-resolution versions for print and digital use
                </p>
              </div>
              <div className="p-5 space-y-4">
                {/* Size selector */}
                <div>
                  <p className="mb-2 text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Size</p>
                  <div className="flex gap-2">
                    {([256, 512, 1024] as const).map((s) => (
                      <button key={s} onClick={() => setQrSize(s)}
                        className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                          qrSize === s
                            ? "text-white"
                            : "nc-btn-ghost"
                        }`}
                        style={qrSize === s ? { background: accentColor } : {}}>
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleDownload("svg", qrSize)}
                    className="nc-btn-ghost flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all">
                    <Download className="h-4 w-4" />
                    SVG
                    <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>Vector</span>
                  </button>
                  <button onClick={() => handleDownload("png", qrSize)}
                    className="nc-btn-ghost flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all">
                    <Download className="h-4 w-4" />
                    PNG
                    <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>{qrSize}px</span>
                  </button>
                </div>

                {/* Share */}
                <button onClick={handleShare}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
                  <Share2 className="h-4 w-4" />
                  Share QR Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Stats + Generate (2 cols) ────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stats */}
          <div className="nc-card overflow-hidden rounded-2xl">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <h3 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>Performance</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--nc-border)" }}>
              {[
                { icon: Scan,       label: "QR Scans",    value: (isLocked ? profile.qrScanCount : 0).toLocaleString(), color: accentColor },
                { icon: Eye,        label: "Page Views",  value: profile.viewCount.toLocaleString(),                     color: "#0ea5e9"  },
                { icon: Smartphone, label: "Profile URL", value: `/${profile.slug}`,                                     color: "#22c55e"  },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `${color}15` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>{label}</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lock Status */}
          <div className={`overflow-hidden rounded-2xl ${
            isLocked
              ? "border border-emerald-500/20 bg-emerald-500/5"
              : "nc-card"
          }`}>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isLocked ? "bg-emerald-500/20" : ""
                }`} style={!isLocked ? { background: "var(--nc-bg-card)" } : undefined}>
                  <Lock className={`h-4 w-4 ${isLocked ? "text-emerald-400" : ""}`} style={!isLocked ? { color: "var(--nc-text-3)" } : undefined} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>
                    {isLocked ? "Profile Locked" : "Not Yet Locked"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {isLocked ? "Template & category are frozen" : "Lock activates on first QR generation"}
                  </p>
                </div>
              </div>

              {isLocked && lockedAt && (
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">Locked on</p>
                  <p className="text-xs text-emerald-300/80">{formatDate(lockedAt)}</p>
                  <div className="mt-2 space-y-0.5">
                    {[
                      `Template: ${profile.template.name}`,
                      `Category: ${profile.category.name}`,
                    ].map((line) => (
                      <p key={line} className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                        <Check className="h-3 w-3 shrink-0" />{line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate / Regenerate section */}
          {!isLocked ? (
            <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <div className="px-5 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300 text-sm">One-Time Lock Warning</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-400/70">
                      Generating your QR code will <strong className="text-amber-300">permanently lock</strong> your
                      template and category. You will <strong className="text-amber-300">not</strong> be able to
                      change the template or move this profile to a different category after this point.
                    </p>
                    <p className="mt-2 text-xs text-amber-400/70">
                      You can still edit your profile content, photos, links, and text at any time.
                    </p>
                  </div>
                </div>

                {!profile.isPublished && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-400">
                      Your profile must be <strong>published</strong> before generating a QR.
                      <Link href={`/dashboard/edit/${profile.slug}`} className="ml-1 underline">
                        Publish it now →
                      </Link>
                    </p>
                  </div>
                )}

                {formState.status === "error" && (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                    {formState.message}
                  </p>
                )}

                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={!profile.isPublished}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-black transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
                    <QrCode className="h-4 w-4" />
                    Generate My QR Code
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center text-sm font-semibold text-amber-300">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowConfirm(false)}
                        className="nc-btn-ghost flex-1 rounded-xl py-3 text-sm font-semibold transition-colors">
                        Cancel
                      </button>
                      <form action={submitAction} className="flex-1">
                        <input type="hidden" name="profileId" value={profile.id} />
                        <button type="submit" disabled={isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: "#f59e0b" }}>
                          {isPending
                            ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />Locking…</>
                            : <><Lock className="h-4 w-4" />Yes, Lock & Generate</>}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Already locked — show usage tips */
            <div className="nc-card overflow-hidden rounded-2xl">
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
                <h3 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>How to Use Your QR</h3>
              </div>
              <div className="px-5 py-5 space-y-3">
                {[
                  { emoji: "🖨️", tip: "Print on business cards, flyers, or banners" },
                  { emoji: "📧", tip: "Add to your email signature as an image" },
                  { emoji: "🪟", tip: "Display at your desk or storefront" },
                  { emoji: "📱", tip: "Add to your Instagram bio or WhatsApp status" },
                  { emoji: "🎪", tip: "Use at events, conferences, and exhibitions" },
                ].map(({ emoji, tip }) => (
                  <div key={tip} className="flex items-start gap-3 text-sm" style={{ color: "var(--nc-text-2)" }}>
                    <span className="shrink-0 text-base">{emoji}</span>
                    {tip}
                  </div>
                ))}

                <div className="mt-2 nc-card rounded-xl p-3">
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                    <strong style={{ color: "var(--nc-text-2)" }}>Pro tip:</strong> Download the SVG version for print
                    (infinitely scalable) and PNG for digital use.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile card preview */}
          <div className="nc-card overflow-hidden rounded-2xl">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={profile.template.thumbnailUrl}
                alt={profile.template.name}
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end gap-1 p-4" style={{ background: "linear-gradient(to top, var(--nc-bg), transparent)" }}>
                <span className="text-xs" style={{ color: "var(--nc-text-2)" }}>{profile.category.name}</span>
                <span className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>{profile.template.name}</span>
                <Link href={publicUrl} target="_blank" rel="noopener noreferrer"
                  className="nc-btn-ghost flex items-center gap-1 text-xs transition-colors">
                  <ExternalLink className="h-3 w-3" />
                  {appUrl.replace("https://", "")}/{profile.slug}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}