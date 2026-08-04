// src/app/api/upload/route.ts
// POST /api/upload — unified FormData upload for all storage drivers

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { getStorageDriver } from "@/lib/env";
import {
  uploadFile,
  getStorageConfig,
  parseUploadFolder,
  maxBytesForFolder,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/storage";
import { generateR2PresignedUrl } from "@/lib/storage/providers/r2";
import { detectImageMime } from "@/lib/security/image-magic";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";

const PresignedUploadInput = z.object({
  contentType: z.string().min(1),
  folder: z.enum(["avatars", "gallery", "logos", "og-images"]).default("gallery"),
  fileSize: z.number().positive().max(8 * 1024 * 1024),
});

function isR2PresignedEnabled(): boolean {
  return (
    getStorageDriver() === "r2" &&
    process.env.STORAGE_R2_USE_PRESIGNED === "true"
  );
}

export async function GET() {
  return NextResponse.json(getStorageConfig());
}

export async function POST(request: NextRequest) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const limited = rateLimit(`upload:${ip}`, 30, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      if (!isR2PresignedEnabled()) {
        return NextResponse.json(
          {
            error:
              "Send FormData with a file field. JSON presigned uploads require STORAGE_DRIVER=r2 and STORAGE_R2_USE_PRESIGNED=true.",
            driver: getStorageDriver(),
          },
          { status: 400 }
        );
      }
      return handlePresignedUpload(request, session.user.id);
    }

    return handleFormDataUpload(request, session.user.id);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}

async function handlePresignedUpload(request: NextRequest, userId: string) {
  const body = await request.json();
  const parsed = PresignedUploadInput.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(". ") },
      { status: 400 }
    );
  }

  const { contentType, folder, fileSize } = parsed.data;

  if (!ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (fileSize > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const result = await generateR2PresignedUrl(userId, contentType, folder);

  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    publicUrl: result.publicUrl,
    key: result.key,
  });
}

async function handleFormDataUpload(request: NextRequest, userId: string) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = parseUploadFolder(formData.get("folder") as string | null);

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const maxSize = maxBytesForFolder(folder);
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large (max ${maxSize / (1024 * 1024)}MB)` },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const detected = detectImageMime(buffer);
  if (!detected) {
    return NextResponse.json(
      { error: "File content is not a valid image (JPEG, PNG, WebP, GIF, AVIF)." },
      { status: 400 }
    );
  }

  // Prefer magic-byte MIME over client-declared type
  if (
    file.type &&
    ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]) &&
    file.type !== detected
  ) {
    // Mismatch is OK if both are allowed images — use detected
  }

  const result = await uploadFile({
    buffer,
    contentType: detected,
    userId,
    folder,
    originalFilename: file.name,
  });

  return NextResponse.json({
    url: result.url,
    publicUrl: result.publicUrl,
    filename: result.filename,
    key: result.key,
    driver: result.driver,
  });
}
