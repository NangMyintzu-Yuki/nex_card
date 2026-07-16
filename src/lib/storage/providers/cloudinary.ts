// src/lib/storage/providers/cloudinary.ts
// Cloudinary image upload via signed REST API (no extra SDK required)

import { createHash, randomUUID } from "crypto";
import { isCloudinaryConfigured } from "@/lib/env";
import {
  assertAllowedContentType,
  extensionFromContentType,
  maxBytesForFolder,
} from "../constants";
import type { UploadInput, UploadResult } from "../types";

function getCloudName(): string {
  return process.env.CLOUDINARY_CLOUD_NAME!;
}

function getApiKey(): string {
  return process.env.CLOUDINARY_API_KEY!;
}

function getApiSecret(): string {
  return process.env.CLOUDINARY_API_SECRET!;
}

function getFolderPrefix(): string {
  return process.env.CLOUDINARY_FOLDER?.replace(/\/$/, "") ?? "nexcard";
}

export async function uploadToCloudinary(input: UploadInput): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }

  assertAllowedContentType(input.contentType);

  const maxBytes = maxBytesForFolder(input.folder);
  if (input.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)} MB size limit.`);
  }

  const cloudName = getCloudName();
  const apiKey = getApiKey();
  const apiSecret = getApiSecret();
  const timestamp = Math.round(Date.now() / 1000);

  const ext = extensionFromContentType(input.contentType);
  const publicId = `${input.userId}-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const folder = `${getFolderPrefix()}/${input.folder}/${input.userId}`;

  // Cloudinary signed upload signature
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(paramsToSign).digest("hex");

  const body = new FormData();
  body.append(
    "file",
    new Blob([new Uint8Array(input.buffer)], { type: input.contentType }),
    `${publicId}.${ext}`
  );
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", folder);
  body.append("public_id", publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
  };

  return {
    url: data.secure_url,
    publicUrl: data.secure_url,
    key: data.public_id,
    filename: `${publicId}.${ext}`,
    driver: "cloudinary",
  };
}
