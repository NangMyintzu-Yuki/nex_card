// src/app/api/upload/route.ts
// POST /api/upload — unified FormData upload for all storage drivers
//
// Set STORAGE_DRIVER in .env: local | r2 | cloudinary | supabase
//
// FormData fields:
//   file   (required)
//   folder (optional) — payments | avatars | gallery | logos | og-images
//
// Optional R2 presigned flow (advanced): JSON body when
// STORAGE_DRIVER=r2 and STORAGE_R2_USE_PRESIGNED=true

import { NextRequest, NextResponse } from "next/server";
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

const PresignedUploadInput = z.object({
  contentType: z.string().min(1),
  folder: z.enum(["avatars", "gallery", "logos", "og-images"]).default("gallery"),
  fileSize: z.number().positive().max(8 * 1024 * 1024),
});

function useR2Presigned(): boolean {
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
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      if (!useR2Presigned()) {
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

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await uploadFile({
    buffer,
    contentType: file.type,
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
