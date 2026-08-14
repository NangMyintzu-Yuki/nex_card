// src/lib/storage/index.ts
// Pluggable upload storage — switch providers via STORAGE_DRIVER in .env
//
// Supported drivers:
//   local       → public/uploads/ on disk; payment proofs in data/private-uploads/
//   r2          → Cloudflare R2 (S3-compatible); proofs via GetObject
//   cloudinary  → Cloudinary CDN
//   supabase    → Supabase Storage
//
// Set STORAGE_DRIVER=local|r2|cloudinary|supabase in .env.local

import { getStorageDriver } from "@/lib/env";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_PAYMENT_FILE_BYTES,
  MAX_PROFILE_FILE_BYTES,
} from "./constants";
import { uploadToLocal, readLocalPaymentFile } from "./providers/local";
import { uploadToR2, deleteFromR2, getR2Object } from "./providers/r2";
import { uploadToCloudinary } from "./providers/cloudinary";
import { uploadToSupabase } from "./providers/supabase";
import { paymentStorageKey } from "@/lib/security/payment-url";
import { uploadKeyFromUrl } from "@/lib/security/upload-ownership";
import type { StorageConfig, UploadInput, UploadResult } from "./types";

export type { StorageDriver, UploadFolder, UploadInput, UploadResult, StorageConfig } from "./types";
export {
  ALLOWED_IMAGE_TYPES,
  UPLOAD_FOLDERS,
  parseUploadFolder,
  maxBytesForFolder,
} from "./constants";

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  const driver = getStorageDriver();

  switch (driver) {
    case "local":
      return uploadToLocal(input);
    case "r2":
      return uploadToR2(input);
    case "cloudinary":
      return uploadToCloudinary(input);
    case "supabase":
      return uploadToSupabase(input);
    default:
      return uploadToLocal(input);
  }
}

/**
 * Extract the storage key from a public URL.
 * Works for R2 URLs (cdn.nexcard.wetechmm.com, pub-xxx.r2.dev, r2.cloudflarestorage.com).
 */
export function extractKeyFromUrl(publicUrl: string): string | null {
  return uploadKeyFromUrl(publicUrl);
}

/**
 * Delete a file from the active storage driver.
 * Currently only R2 is supported for deletion.
 */
export async function deleteFile(url: string): Promise<void> {
  const driver = getStorageDriver();
  if (driver !== "r2") return;

  const key = extractKeyFromUrl(url);
  if (!key) return;

  await deleteFromR2(key);
}

export async function readPaymentObject(
  stored: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const key = paymentStorageKey(stored);
  if (!key) return null;

  const driver = getStorageDriver();

  if (driver === "r2") {
    const fromR2 = await getR2Object(key);
    if (fromR2) return fromR2;
  }

  // Local private + leftover public/uploads/payments, and R2 fallback for mixed deploys
  const filename = key.startsWith("private/payments/")
    ? key.slice("private/payments/".length).split("/").pop()
    : key.startsWith("uploads/payments/")
      ? key.slice("uploads/payments/".length)
      : null;

  if (filename && !filename.includes("/")) {
    const local = await readLocalPaymentFile(filename);
    if (local) return local;
  }

  if (driver !== "r2") {
    return getR2Object(key).catch(() => null);
  }

  return null;
}

export function getStorageConfig(): StorageConfig {
  const driver = getStorageDriver();

  return {
    driver,
    maxFileSizeMb: MAX_PROFILE_FILE_BYTES / (1024 * 1024),
    maxPaymentFileSizeMb: MAX_PAYMENT_FILE_BYTES / (1024 * 1024),
    allowedTypes: ALLOWED_IMAGE_TYPES,
    uploadMode: "direct",
  };
}
