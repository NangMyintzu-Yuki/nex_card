// src/lib/storage/providers/r2.ts
// Cloudflare R2 via S3-compatible API

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { isR2Configured } from "@/lib/env";
import {
  assertAllowedContentType,
  extensionFromContentType,
  maxBytesForFolder,
} from "../constants";
import type { UploadInput, UploadResult } from "../types";

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured. Set R2_* environment variables.");
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  return r2Client;
}

function getBucketName(): string {
  return process.env.R2_BUCKET_NAME ?? "nexcard-uploads";
}

function getPublicBaseUrl(): string {
  return process.env.R2_PUBLIC_URL ?? "https://cdn.nexcard.io";
}

export async function uploadToR2(input: UploadInput): Promise<UploadResult> {
  assertAllowedContentType(input.contentType);

  const maxBytes = maxBytesForFolder(input.folder);
  if (input.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)} MB size limit.`);
  }

  const ext = extensionFromContentType(input.contentType);
  const key = `uploads/${input.userId}/${input.folder}/${randomUUID()}.${ext}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: input.buffer,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        userId: input.userId,
        uploadedAt: new Date().toISOString(),
      },
    })
  );

  const publicUrl = `${getPublicBaseUrl()}/${key}`;

  return {
    url: publicUrl,
    publicUrl,
    key,
    driver: "r2",
  };
}

/** Optional: presigned PUT URL for client-side direct upload (advanced) */
export async function generateR2PresignedUrl(
  userId: string,
  contentType: string,
  folder: UploadInput["folder"],
  expiresInSeconds = 300
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  assertAllowedContentType(contentType);

  const ext = extensionFromContentType(contentType);
  const key = `uploads/${userId}/${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    publicUrl: `${getPublicBaseUrl()}/${key}`,
    key,
  };
}

export async function deleteFromR2(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );
}
