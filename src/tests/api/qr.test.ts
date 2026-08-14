// src/tests/api/qr.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/qr/[slug]/route";
import prisma from "@/lib/db/prisma";
import QRCode from "qrcode";
import { getRequest } from "./helpers";

vi.mock("qrcode", () => ({
  default: {
    toString: vi.fn().mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("png-data")),
  },
}));

describe("GET /api/qr/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when profile is not published", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

    const res = await GET(getRequest("http://localhost/api/qr/missing"), {
      params: Promise.resolve({ slug: "missing" }),
    });

    expect(res.status).toBe(404);
  });

  it("returns SVG QR code for published profile", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
      id: "profile-1",
      isPublished: true,
      qrLocked: true,
      template: { accentColor: "#6366f1" },
    } as never);

    const res = await GET(getRequest("http://localhost/api/qr/alex-rivera"), {
      params: Promise.resolve({ slug: "alex-rivera" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(QRCode.toString).toHaveBeenCalledWith(
      "https://www.nexcard.wetechmm.com/p/alex-rivera",
      expect.objectContaining({ type: "svg" })
    );
  });

  it("returns PNG when format=png", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
      id: "profile-1",
      isPublished: true,
      qrLocked: true,
      template: { accentColor: "#6366f1" },
    } as never);

    const res = await GET(
      getRequest("http://localhost/api/qr/alex-rivera?format=png&size=256"),
      { params: Promise.resolve({ slug: "alex-rivera" }) }
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(QRCode.toBuffer).toHaveBeenCalled();
    expect(res.headers.get("Content-Disposition")).toMatch(/nexcard-qr-alex-rivera\.png/);
  });
});
