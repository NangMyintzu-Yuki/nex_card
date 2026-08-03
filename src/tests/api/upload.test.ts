// src/tests/api/upload.test.ts
import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/upload/route";
import { getServerSession } from "@/lib/auth/session";
import { uploadFile, getStorageConfig } from "@/lib/storage";
import { generateR2PresignedUrl } from "@/lib/storage/providers/r2";
import { getStorageDriver } from "@/lib/env";
import { jsonRequest, readJson } from "./helpers";

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn(),
  getStorageConfig: vi.fn().mockReturnValue({
    driver: "local",
    maxFileSizeMb: 8,
    maxPaymentFileSizeMb: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    uploadMode: "direct",
  }),
  parseUploadFolder: vi.fn((raw: string | null) => raw ?? "payments"),
  maxBytesForFolder: vi.fn(() => 8 * 1024 * 1024),
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
}));

vi.mock("@/lib/storage/providers/r2", () => ({
  generateR2PresignedUrl: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getStorageDriver: vi.fn(),
  isR2Configured: vi.fn(),
  APP_URL: "https://nexcard.io",
  CDN_URL: "https://nexcard.io",
}));

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStorageConfig).mockReturnValue({
      driver: "local",
      maxFileSizeMb: 8,
      maxPaymentFileSizeMb: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
      uploadMode: "direct",
    });
    vi.mocked(uploadFile).mockResolvedValue({
      url: "/uploads/gallery/user-1-test.png",
      publicUrl: "https://nexcard.io/uploads/gallery/user-1-test.png",
      filename: "user-1-test.png",
      driver: "local",
    });
    delete process.env.STORAGE_R2_USE_PRESIGNED;
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await POST(
      jsonRequest("http://localhost/api/upload", "POST", {
        contentType: "image/png",
        folder: "gallery",
        fileSize: 1024,
      })
    );

    expect(res.status).toBe(401);
  });

  it("returns 400 for JSON upload when presigned mode is off", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
      },
    });
    vi.mocked(getStorageDriver).mockReturnValue("local");

    const res = await POST(
      jsonRequest("http://localhost/api/upload", "POST", {
        contentType: "image/png",
        folder: "gallery",
        fileSize: 1024,
      })
    );

    expect(res.status).toBe(400);
    const body = await readJson<{ driver: string }>(res);
    expect(body.driver).toBe("local");
  });

  it("returns presigned upload URL for JSON when R2 presigned mode is on", async () => {
    process.env.STORAGE_R2_USE_PRESIGNED = "true";
    vi.mocked(getStorageDriver).mockReturnValue("r2");
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
      },
    });
    vi.mocked(generateR2PresignedUrl).mockResolvedValue({
      uploadUrl: "https://r2.example/upload",
      publicUrl: "https://cdn.nexcard.io/uploads/user-1/gallery/file.png",
      key: "uploads/user-1/gallery/file.png",
    });

    const res = await POST(
      jsonRequest("http://localhost/api/upload", "POST", {
        contentType: "image/png",
        folder: "gallery",
        fileSize: 2048,
      })
    );

    expect(res.status).toBe(200);
    const body = await readJson<{ uploadUrl: string; publicUrl: string }>(res);
    expect(body.uploadUrl).toContain("r2.example");
  });

  it("accepts FormData upload for any storage driver", async () => {
    vi.mocked(getStorageDriver).mockReturnValue("cloudinary");
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
      },
    });
    vi.mocked(uploadFile).mockResolvedValue({
      url: "https://res.cloudinary.com/demo/image/upload/v1/nexcard/gallery/user-1.png",
      publicUrl: "https://res.cloudinary.com/demo/image/upload/v1/nexcard/gallery/user-1.png",
      driver: "cloudinary",
    });

    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]);
    const formData = new FormData();
    formData.append("file", new File([pngBytes], "photo.png", { type: "image/png" }));
    formData.append("folder", "gallery");

    const res = await POST(
      new NextRequest("http://localhost/api/upload", { method: "POST", body: formData })
    );

    expect(res.status).toBe(200);
    const body = await readJson<{ publicUrl: string; driver: string }>(res);
    expect(body.publicUrl).toContain("cloudinary.com");
    expect(body.driver).toBe("cloudinary");
    expect(uploadFile).toHaveBeenCalledOnce();
  });
});
