// src/lib/storage/r2-upload.ts
// Cloudflare R2 upload helper using the S3-compatible API
// Install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// R2 CLIENT SINGLETON
// ─────────────────────────────────────────────────────────────────────────────

const R2_ACCOUNT_ID  = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY  = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_KEY  = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "presencecard-uploads";
const R2_PUBLIC_URL  = process.env.R2_PUBLIC_URL ?? "https://cdn.presencecard.io";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ALLOWED FILE TYPES
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD IMAGE — Server-side direct upload
// ─────────────────────────────────────────────────────────────────────────────

interface UploadImageOptions {
  buffer: Buffer;
  contentType: string;
  userId: string;
  folder?: "avatars" | "gallery" | "logos" | "og-images";
}

interface UploadImageResult {
  url: string;
  key: string;
}

export async function uploadImage({
  buffer,
  contentType,
  userId,
  folder = "gallery",
}: UploadImageOptions): Promise<UploadImageResult> {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(
      `File type "${contentType}" is not allowed. Accepted: JPEG, PNG, WebP, AVIF, GIF.`
    );
  }

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds the 8 MB size limit.");
  }

  const ext = contentType.split("/")[1].replace("jpeg", "jpg");
  const key = `uploads/${userId}/${folder}/${randomUUID()}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    })
  );

  return {
    url: `${R2_PUBLIC_URL}/${key}`,
    key,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESIGNED UPLOAD URL — Client-side direct upload (preferred for large files)
// ─────────────────────────────────────────────────────────────────────────────

interface PresignedUrlOptions {
  userId: string;
  contentType: string;
  folder?: "avatars" | "gallery" | "logos" | "og-images";
  expiresInSeconds?: number;
}

interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function generatePresignedUploadUrl({
  userId,
  contentType,
  folder = "gallery",
  expiresInSeconds = 300, // 5 minutes
}: PresignedUrlOptions): Promise<PresignedUrlResult> {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`File type "${contentType}" is not allowed.`);
  }

  const ext = contentType.split("/")[1].replace("jpeg", "jpg");
  const key = `uploads/${userId}/${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
    key,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE IMAGE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteImage(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT KEY FROM URL — Helper to get the R2 key from a public URL
// ─────────────────────────────────────────────────────────────────────────────

export function extractKeyFromUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    // Remove leading slash
    return url.pathname.slice(1);
  } catch {
    return null;
  }
}
