// src/app/api/upload/route.ts
// POST /api/upload — generates a presigned R2 URL for client-side direct upload
// The client uploads directly to R2, keeping our server free of binary data

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { generatePresignedUploadUrl } from "@/lib/storage/r2-upload";

const UploadRequestSchema = z.object({
  contentType: z.enum([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ]),
  folder: z
    .enum(["avatars", "gallery", "logos", "og-images"])
    .default("gallery"),
  fileSize: z.number().int().min(1).max(8 * 1024 * 1024), // max 8MB
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const { contentType, folder, fileSize } = parsed.data;

    // Generate presigned URL (valid for 5 minutes)
    const { uploadUrl, publicUrl, key } = await generatePresignedUploadUrl({
      userId: session.user.id,
      contentType,
      folder,
    });

    return NextResponse.json({
      uploadUrl,   // PUT to this URL with the file binary
      publicUrl,   // Store this in the profile dynamicJsonData
      key,         // Keep for potential future deletion
    });
  } catch (error) {
    console.error("[Upload API]", error);
    return NextResponse.json(
      { message: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
