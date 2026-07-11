// src/lib/utils.ts
// Shared utility helpers used across the entire application

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─────────────────────────────────────────────────────────────────────────────
// CN — Tailwind class merger (clsx + tailwind-merge)
// Usage: cn("px-4 py-2", isActive && "bg-indigo-500", className)
// ─────────────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// SLUG UTILS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a display name into a URL-safe slug.
 * "Alex Rivera 2024" → "alex-rivera-2024"
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Validates that a slug matches the allowed pattern.
 * Only lowercase alphanumeric + hyphens, 3–60 chars.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(slug);
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string.
 * e.g. "2 hours ago", "3 days ago", "just now"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Formats a Date as "Jan 15, 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats an ISO datetime string for display in templates.
 * "2025-11-15T14:00:00+08:00" → { date: "Saturday, November 15, 2025", time: "2:00 PM" }
 */
export function formatEventDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compactly formats large numbers.
 * 1247 → "1.2K", 1200000 → "1.2M"
 */
export function formatNumber(n: number | bigint): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// STRING UTILS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Truncates a string to maxLength, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Returns initials from a full name.
 * "Alex Rivera" → "AR", "Madonna" → "MA"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// URL UTILS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensures a URL has a protocol prefix.
 * "example.com" → "https://example.com"
 */
export function ensureHttps(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

/**
 * Extracts a clean display domain from a full URL.
 * "https://www.linkedin.com/in/alexrivera" → "linkedin.com"
 */
export function getDomain(url: string): string {
  try {
    return new URL(ensureHttps(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR UTILS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a hex color to RGB values.
 * "#6366f1" → { r: 99, g: 102, b: 241 }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Returns a CSS rgba() string from a hex color with an alpha value.
 * hexToRgba("#6366f1", 0.2) → "rgba(99, 102, 241, 0.2)"
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
