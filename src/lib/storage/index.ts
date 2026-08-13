// src/lib/storage/index.ts
// Pluggable upload storage — switch providers via STORAGE_DRIVER in .env
//
// Supported drivers:
//   local       → public/uploads/ on your VPS (default, no external service)
//   r2          → Cloudflare R2 (S3-compatible)
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
import { uploadToLocal } from "./providers/local";
import { uploadToR2, deleteFromR2 } from "./providers/r2";
import { uploadToCloudinary } from "./providers/cloudinary";
import { uploadToSupabase } from "./providers/supabase";
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
  try {
    const url = new URL(publicUrl);
    // Strip leading slash — keys are like uploads/{userId}/{folder}/{file}
    return url.pathname.slice(1) || null;
  } catch {
    return null;
  }
}

/**
 * Delete a file from the active storage driver.
 * Currently only R2 is supported for deletion.
 */
export async function deleteFile(url: string): Promise<void> {
  const driver = getStorageDriver();
  if (driver !== "r2") return; // Only R2 deletion is implemented

  const key = extractKeyFromUrl(url);
  if (!key) return;

  await deleteFromR2(key);
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
