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
import { uploadToR2 } from "./providers/r2";
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
