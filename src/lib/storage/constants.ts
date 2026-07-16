// src/lib/storage/constants.ts

import type { UploadFolder } from "./types";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const UPLOAD_FOLDERS = new Set<string>([
  "payments",
  "avatars",
  "gallery",
  "logos",
  "og-images",
]);

export const MAX_PROFILE_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_PAYMENT_FILE_BYTES = 5 * 1024 * 1024;

export function parseUploadFolder(raw: string | null | undefined): UploadFolder {
  const value = raw?.toLowerCase() ?? "payments";
  return UPLOAD_FOLDERS.has(value) ? (value as UploadFolder) : "payments";
}

export function maxBytesForFolder(folder: UploadFolder): number {
  return folder === "payments" ? MAX_PAYMENT_FILE_BYTES : MAX_PROFILE_FILE_BYTES;
}

export function assertAllowedContentType(contentType: string): void {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF.");
  }
}

export function extensionFromContentType(contentType: string): string {
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return ["jpg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
}
