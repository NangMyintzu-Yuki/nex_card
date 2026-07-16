// src/lib/storage/r2-upload.ts
// @deprecated Import from @/lib/storage or ./providers/r2 — kept for backward compatibility

import { CDN_URL } from "@/lib/env";
import {
  uploadToR2,
  generateR2PresignedUrl,
  deleteFromR2,
} from "./providers/r2";

export async function uploadImage(options: {
  buffer: Buffer;
  contentType: string;
  userId: string;
  folder?: "avatars" | "gallery" | "logos" | "og-images";
}) {
  const result = await uploadToR2({
    ...options,
    folder: options.folder ?? "gallery",
  });
  return { url: result.publicUrl, key: result.key! };
}

export async function generatePresignedUploadUrl(options: {
  userId: string;
  contentType: string;
  folder?: "avatars" | "gallery" | "logos" | "og-images";
  expiresInSeconds?: number;
}) {
  return generateR2PresignedUrl(
    options.userId,
    options.contentType,
    options.folder ?? "gallery",
    options.expiresInSeconds
  );
}

export async function deleteImage(key: string): Promise<void> {
  return deleteFromR2(key);
}

export function extractKeyFromUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    if (publicUrl.startsWith(CDN_URL)) {
      return url.pathname.slice(1);
    }
    return url.pathname.slice(1);
  } catch {
    return null;
  }
}
