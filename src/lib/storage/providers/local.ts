// src/lib/storage/providers/local.ts
// Saves files to public/uploads/ on the server filesystem

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { APP_URL } from "@/lib/env";
import {
  assertAllowedContentType,
  extensionFromContentType,
  maxBytesForFolder,
} from "../constants";
import type { UploadInput, UploadResult } from "../types";

export async function uploadToLocal(input: UploadInput): Promise<UploadResult> {
  assertAllowedContentType(input.contentType);

  const maxBytes = maxBytesForFolder(input.folder);
  if (input.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)} MB size limit.`);
  }

  const ext = extensionFromContentType(input.contentType);
  const filename = `${input.userId}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", input.folder);
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, input.buffer);

  const url = `/uploads/${input.folder}/${filename}`;

  return {
    url,
    publicUrl: `${APP_URL}${url}`,
    key: url,
    filename,
    driver: "local",
  };
}
