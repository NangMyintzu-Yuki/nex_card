// src/lib/env.ts
// Centralized environment helpers + production fail-fast validation

import { z } from "zod";
import type { StorageDriver } from "@/lib/storage/types";

export type { StorageDriver };

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.nexcard.wetechmm.com";

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
 * Active storage driver — set STORAGE_DRIVER in .env.
 * Production refuses silent fallback to local unless ALLOW_LOCAL_STORAGE=true
 * (intended for VPS with persistent disk).
 */
export function getStorageDriver(): StorageDriver {
  const requested = process.env.STORAGE_DRIVER?.toLowerCase().trim();
  const allowLocal =
    process.env.ALLOW_LOCAL_STORAGE === "true" ||
    process.env.NODE_ENV !== "production";

  if (requested && isValidDriver(requested)) {
    if (isDriverConfigured(requested)) {
      if (requested === "local" && process.env.NODE_ENV === "production" && !allowLocal) {
        throw new Error(
          "[Storage] STORAGE_DRIVER=local is blocked in production unless ALLOW_LOCAL_STORAGE=true (VPS with disk)."
        );
      }
      return requested;
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[Storage] STORAGE_DRIVER=${requested} is not fully configured. Refusing to fall back to local in production.`
      );
    }
    console.warn(
      `[Storage] STORAGE_DRIVER=${requested} is not fully configured — falling back to local.`
    );
    return "local";
  }

  if (process.env.NODE_ENV === "production" && !allowLocal) {
    throw new Error(
      "[Storage] Set STORAGE_DRIVER to r2|cloudinary|supabase, or ALLOW_LOCAL_STORAGE=true for VPS local disk."
    );
  }

  return "local";
}

/** CDN / public asset base URL */
export function getCdnUrl(): string {
  const driver = getStorageDriver();
  switch (driver) {
    case "r2":
      return process.env.R2_PUBLIC_URL ?? "https://cdn.www.nexcard.wetechmm.com";
    case "cloudinary":
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME ?? ""}`;
    case "supabase":
      return `${(process.env.SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/${process.env.SUPABASE_STORAGE_BUCKET ?? "nexcard-uploads"}`;
    default:
      return APP_URL;
  }
}

/** @deprecated Prefer getCdnUrl() — kept for legacy R2 helpers */
export const CDN_URL =
  process.env.R2_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://www.nexcard.wetechmm.com";

// ── Production env fail-fast ────────────────────────────────────────────────

const ProdEnvSchema = z.object({
  DATABASE_URL: z
    .string({ required_error: "DATABASE_URL is required in production" })
    .min(1, "DATABASE_URL is required in production"),
  NEXT_PUBLIC_APP_URL: z
    .string({ required_error: "NEXT_PUBLIC_APP_URL is required in production" })
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .refine((u) => !u.includes("localhost") || process.env.ALLOW_LOCAL_STORAGE === "true", {
      message: "NEXT_PUBLIC_APP_URL must not be localhost in production unless ALLOW_LOCAL_STORAGE=true",
    }),
  REVALIDATION_SECRET: z
    .string({ required_error: "REVALIDATION_SECRET is required in production" })
    .min(32, "REVALIDATION_SECRET must be at least 32 characters"),
  CRON_SECRET: z
    .string({ required_error: "CRON_SECRET is required in production" })
    .min(32, "CRON_SECRET must be at least 32 characters"),
});

let validated = false;

/**
 * Call once at boot (instrumentation). Throws in production on missing secrets.
 * Development only warns.
 */
export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const result = ProdEnvSchema.safeParse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
      CRON_SECRET: process.env.CRON_SECRET,
    });
    if (!result.success) {
      const msg = result.error.issues
        .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
        .join("; ");
      throw new Error(`[env] Production env validation failed: ${msg}`);
    }

    // Storage must resolve without silent local fallback
    const driver = getStorageDriver();
    if (driver === "r2" && !isR2Configured()) {
      throw new Error("[env] STORAGE_DRIVER=r2 requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME");
    }

    // If backup email is partially configured, require full SMTP
    const smtpHost =
      process.env.SMTP_HOST?.trim() || process.env.SYSTEM_MAIL_HOST?.trim();
    if (smtpHost) {
      const SmtpSchema = z.object({
        SMTP_USER: z.string().min(1, "SMTP_USER or SYSTEM_MAIL_USER is required"),
        SMTP_PASS: z.string().min(1, "SMTP_PASS or SYSTEM_MAIL_PASSWORD is required"),
      });
      const smtp = SmtpSchema.safeParse({
        SMTP_USER:
          process.env.SMTP_USER?.trim() || process.env.SYSTEM_MAIL_USER?.trim(),
        SMTP_PASS:
          process.env.SMTP_PASS?.trim() ||
          process.env.SYSTEM_MAIL_PASS?.trim() ||
          process.env.SYSTEM_MAIL_PASSWORD?.trim(),
      });
      if (!smtp.success) {
        throw new Error(
          `[env] SMTP_HOST is set but SMTP is incomplete: ${smtp.error.issues.map((i) => i.message).join("; ")}`
        );
      }
    }
  } else {
    if (!process.env.REVALIDATION_SECRET) {
      console.warn("[env] REVALIDATION_SECRET is unset — revalidate webhook will reject.");
    }
  }
}
