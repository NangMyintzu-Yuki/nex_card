// src/lib/env.ts
// Centralized environment helpers + production fail-fast validation

import { z } from "zod";
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
      return process.env.R2_PUBLIC_URL ?? "https://cdn.nexcard.io";
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
  "https://nexcard.io";

// ── Production env fail-fast ────────────────────────────────────────────────

const ProdEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required in production"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .refine((u) => !u.includes("localhost"), {
      message: "NEXT_PUBLIC_APP_URL must not be localhost in production",
    }),
  REVALIDATION_SECRET: z
    .string()
    .min(32, "REVALIDATION_SECRET must be at least 32 characters"),
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
    });
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join("; ");
      throw new Error(`[env] Production env validation failed: ${msg}`);
    }

    // Storage must resolve without silent local fallback
    getStorageDriver();

    // If backup email is partially configured, require full SMTP
    const smtpHost = process.env.SMTP_HOST?.trim();
    if (smtpHost) {
      const SmtpSchema = z.object({
        SMTP_HOST: z.string().min(1),
        SMTP_PORT: z.string().optional(),
        SMTP_USER: z.string().min(1),
        SMTP_PASS: z.string().min(1),
        SMTP_FROM: z.string().email().optional(),
      });
      const smtp = SmtpSchema.safeParse({
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM || undefined,
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
