// src/lib/storage/providers/r2.ts
// Cloudflare R2 via S3-compatible API

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
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

function getPublicBucketName(): string {
  return process.env.R2_BUCKET_NAME ?? "nexcard-uploads";
}

function getPaymentBucketName(): string {
  return process.env.R2_PRIVATE_BUCKET?.trim() || getPublicBucketName();
}

function getPublicBaseUrl(): string {
  return process.env.R2_PUBLIC_URL ?? "https://cdn.www.nexcard.wetechmm.com";
}

function isPaymentFolder(folder: UploadInput["folder"]): boolean {
  return folder === "payments";
}

export async function uploadToR2(input: UploadInput): Promise<UploadResult> {
  assertAllowedContentType(input.contentType);

  const maxBytes = maxBytesForFolder(input.folder);
  if (input.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)} MB size limit.`);
  }

  const ext = extensionFromContentType(input.contentType);
  const payment = isPaymentFolder(input.folder);
  const key = payment
    ? `private/payments/${input.userId}/${randomUUID()}.${ext}`
    : `uploads/${input.userId}/${input.folder}/${randomUUID()}.${ext}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: payment ? getPaymentBucketName() : getPublicBucketName(),
      Key: key,
      Body: input.buffer,
      ContentType: input.contentType,
      CacheControl: payment ? "private, no-store" : "public, max-age=31536000, immutable",
      Metadata: {
        userId: input.userId,
        uploadedAt: new Date().toISOString(),
      },
    })
  );

  if (payment) {
    return {
      url: key,
      publicUrl: "",
      key,
      driver: "r2",
    };
  }

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
  if (folder === "payments") {
    throw new Error("Payment screenshots cannot use presigned uploads.");
  }
  assertAllowedContentType(contentType);

  const ext = extensionFromContentType(contentType);
  const key = `uploads/${userId}/${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: getPublicBucketName(),
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
  const privateObject = key.startsWith("private/");
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: privateObject ? getPaymentBucketName() : getPublicBucketName(),
      Key: key,
    })
  );
}

export async function getR2Object(
  key: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const privateObject = key.startsWith("private/");
  try {
    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: privateObject ? getPaymentBucketName() : getPublicBucketName(),
        Key: key,
      })
    );
    if (!result.Body) return null;
    const bytes = await result.Body.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      contentType: result.ContentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}
