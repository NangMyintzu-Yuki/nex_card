// src/lib/storage/providers/local.ts
// Public gallery/avatars → public/uploads/; payment proofs → data/private-uploads/

import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { APP_URL } from "@/lib/env";
import {
  assertAllowedContentType,
  extensionFromContentType,
  maxBytesForFolder,
} from "../constants";
import type { UploadInput, UploadResult } from "../types";

export function localPrivatePaymentsDir(): string {
  return path.join(process.cwd(), "data", "private-uploads", "payments");
}

export function localPublicUploadsDir(folder: string): string {
  return path.join(process.cwd(), "public", "uploads", folder);
}

export async function uploadToLocal(input: UploadInput): Promise<UploadResult> {
  assertAllowedContentType(input.contentType);

  const maxBytes = maxBytesForFolder(input.folder);
  if (input.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)} MB size limit.`);
  }

  const ext = extensionFromContentType(input.contentType);
  const filename = `${input.userId}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  if (input.folder === "payments") {
    const uploadDir = localPrivatePaymentsDir();
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, input.buffer);
    const key = `private/payments/${filename}`;
    return {
      url: key,
      publicUrl: "",
      key,
      filename,
      driver: "local",
    };
  }

  const uploadDir = localPublicUploadsDir(input.folder);
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, input.buffer);
  const url = `/uploads/${input.folder}/${filename}`;

  return {
    url,
    publicUrl: `${APP_URL}${url}`,
    key: url.replace(/^\//, ""),
    filename,
    driver: "local",
  };
}

export async function readLocalPaymentFile(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }

  const privatePath = path.join(localPrivatePaymentsDir(), filename);
  const publicPath = path.join(localPublicUploadsDir("payments"), filename);

  for (const filepath of [privatePath, publicPath]) {
    try {
      const buffer = await readFile(filepath);
      const ext = path.extname(filename).slice(1).toLowerCase();
      const contentType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : ext === "gif"
              ? "image/gif"
              : ext === "avif"
                ? "image/avif"
                : "image/jpeg";
      return { buffer, contentType };
    } catch {
      // try next location
    }
  }
  return null;
}
