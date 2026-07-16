// src/lib/storage/types.ts
// Shared types for the pluggable upload storage layer

export type StorageDriver = "local" | "r2" | "cloudinary" | "supabase";

export type UploadFolder =
  | "payments"
  | "avatars"
  | "gallery"
  | "logos"
  | "og-images";

export interface UploadInput {
  buffer: Buffer;
  contentType: string;
  userId: string;
  folder: UploadFolder;
  originalFilename?: string;
}

export interface UploadResult {
  /** Relative path (local) or full URL depending on driver */
  url: string;
  /** Always a publicly accessible URL for use in profiles */
  publicUrl: string;
  /** Storage object key / path (when applicable) */
  key?: string;
  filename?: string;
  driver: StorageDriver;
}

export interface StorageConfig {
  driver: StorageDriver;
  maxFileSizeMb: number;
  maxPaymentFileSizeMb: number;
  allowedTypes: readonly string[];
  /** FormData upload through /api/upload (all drivers use this) */
  uploadMode: "direct";
}
