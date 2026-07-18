// src/components/ui/nex-card-logo.tsx
// NEX CARD Logo — uses actual brand JPG files with theme-aware CSS filters
"use client";

/**
 * Image-only logo mark.
 * - Dark mode: gold tint via CSS filter (white bg removed with mix-blend-mode: screen)
 * - Light mode: navy tint via CSS filter (white bg removed with mix-blend-mode: multiply)
 */
function LogoMark({
  size,
  isDark = true,
  variant = "icon",
}: {
  size: number;
  isDark?: boolean;
  variant?: "icon" | "full";
}) {
  const src = variant === "full" ? "/brand/nex-qr-full.png" : "/brand/nex-qr-icon.png";

  // Gold tint (dark mode): black → gold
  const darkFilter = "invert(68%) sepia(58%) saturate(600%) hue-rotate(8deg) brightness(105%)";
  // Navy tint (light mode): black → navy
  const lightFilter = "invert(28%) sepia(90%) saturate(400%) hue-rotate(195deg) brightness(90%)";

  return (
    <img
      src={src}
      alt="NEX CARD"
      width={size}
      height={size}
      style={{
        display: "block",
        width: size,
        height: size,
        objectFit: "contain",
        filter: isDark ? darkFilter : lightFilter,
      }}
    />
  );
}

// ── Wordmark text — always matches theme brand color ────────────────────────
function LogoText({
  size,
  isDark = true,
}: {
  size: number;
  isDark?: boolean;
}) {
  const color = isDark ? "#d4af37" : "#2d6eb5";
  const colorLight = isDark ? "#f0c050" : "#4a9fd4";

  return (
    <span
      className="font-black tracking-widest leading-none select-none"
      style={{
        fontSize: size * 0.42,
        backgroundImage: `linear-gradient(135deg, ${color}, ${colorLight})`,
        backgroundColor: "transparent",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
    >
      NEX CARD
    </span>
  );
}

// ── Main exports ────────────────────────────────────────────────────────────

/**
 * Brand lockup — icon-only (for nav, sidebars, footer).
 * Uses nex-qr-icon.jpg (no text).
 */
export function NexCardLogo({
  size = 40,
  isDark = true,
  className = "",
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ background: "transparent" }}
    >
      <LogoMark size={size} isDark={isDark} variant="icon" />
    </div>
  );
}

/**
 * Static logo — theme-aware.
 * - showText=false → nex-qr-icon.png (icon only)
 * - showText=true  → nex-qr-full.png (icon + "NEX CARD" text)
 */
export function NexCardLogoStatic({
  size = 40,
  showText = false,
  isDark = true,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ background: "transparent" }}
    >
      <LogoMark size={size} isDark={isDark} variant={showText ? "full" : "icon"} />
    </div>
  );
}

/**
 * Auto logo — same as NexCardLogo (kept for backward compat).
 */
export function NexCardLogoAuto({
  size = 40,
  isDark = true,
  className = "",
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ background: "transparent" }}
    >
      <LogoMark size={size} isDark={isDark} variant="icon" />
    </div>
  );
}
