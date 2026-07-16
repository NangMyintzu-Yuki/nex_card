// src/lib/env.ts
// Centralized environment helpers

import type { StorageDriver } from "@/lib/storage/types";

export type { StorageDriver };

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://nexcard.io";

const ALL_DRIVERS: StorageDriver[] = ["local", "r2", "cloudinary", "supabase"];

function isValidDriver(value: string): value is StorageDriver {
  return ALL_DRIVERS.includes(value as StorageDriver);
}

// ── Provider configuration checks ───────────────────────────────────────────

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isLocalConfigured(): boolean {
  return true;
}

export function isDriverConfigured(driver: StorageDriver): boolean {
  switch (driver) {
    case "local":
      return isLocalConfigured();
    case "r2":
      return isR2Configured();
    case "cloudinary":
      return isCloudinaryConfigured();
    case "supabase":
      return isSupabaseConfigured();
    default:
      return false;
  }
}

/**
 * Active storage driver — set STORAGE_DRIVER in .env:
 *
 *   STORAGE_DRIVER=local       → public/uploads/ (default, free, no VPN)
 *   STORAGE_DRIVER=r2          → Cloudflare R2
 *   STORAGE_DRIVER=cloudinary  → Cloudinary
 *   STORAGE_DRIVER=supabase    → Supabase Storage
 *
 * Falls back to `local` if the requested driver is not configured.
 */
export function getStorageDriver(): StorageDriver {
  const requested = process.env.STORAGE_DRIVER?.toLowerCase().trim();

  if (requested && isValidDriver(requested)) {
    if (isDriverConfigured(requested)) {
      return requested;
    }
    console.warn(
      `[Storage] STORAGE_DRIVER=${requested} is not fully configured — falling back to local.`
    );
    return "local";
  }

  return "local";
}

/** CDN / public asset base URL (used by legacy R2 helpers) */
export function getCdnUrl(): string {
  const driver = getStorageDriver();
  switch (driver) {
    case "r2":
      return process.env.R2_PUBLIC_URL ?? "https://cdn.nexcard.io";
    case "cloudinary":
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME ?? ""}`;
    case "supabase":
      return `${(process.env.SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/${process.env.SUPABASE_STORAGE_BUCKET ?? "nexcard-uploads"}`;
    default:
      return APP_URL;
  }
}

/** @deprecated Use getCdnUrl() */
export const CDN_URL = getCdnUrl();
