// src/lib/storage/providers/supabase.ts
// Supabase Storage via REST API (no SDK required)

import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/env";
import {
  assertAllowedContentType,
  extensionFromContentType,
  maxBytesForFolder,
} from "../constants";
import type { UploadInput, UploadResult } from "../types";

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL!.replace(/\/$/, "");
}

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY!;
}

function getBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "nexcard-uploads";
}

export async function uploadToSupabase(input: UploadInput): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase Storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET."
    );
  }

  assertAllowedContentType(input.contentType);

  const maxBytes = maxBytesForFolder(input.folder);
  if (input.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)} MB size limit.`);
  }

  const ext = extensionFromContentType(input.contentType);
  const filename = `${input.userId}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const objectPath = `${input.folder}/${input.userId}/${filename}`;
  const bucket = getBucket();
  const baseUrl = getSupabaseUrl();

  const res = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getServiceRoleKey()}`,
        "Content-Type": input.contentType,
        "x-upsert": "false",
      },
      body: new Uint8Array(input.buffer),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upload failed: ${err.slice(0, 200)}`);
  }

  const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;

  return {
    url: publicUrl,
    publicUrl,
    key: objectPath,
    filename,
    driver: "supabase",
  };
}
