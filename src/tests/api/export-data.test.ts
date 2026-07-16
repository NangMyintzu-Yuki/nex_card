// src/tests/api/export-data.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/export/data/route";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { getRequest } from "./helpers";

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

describe("GET /api/export/data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET(getRequest("http://localhost/api/export/data"));
    expect(res.status).toBe(401);
  });

  it("returns user export JSON when authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
      },
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "Alex",
      email: "alex@nexcard.io",
      avatarUrl: null,
      role: "USER",
      status: "ACTIVE",
      createdAt: new Date("2026-01-01"),
      emailVerifiedAt: new Date("2026-01-01"),
    } as never);

    vi.mocked(prisma.userProfile.findMany).mockResolvedValue([
      {
        id: "profile-1",
        slug: "alex",
        isPublished: true,
        templateLocked: true,
        viewCount: BigInt(42),
        dynamicJsonData: { fullName: "Alex" },
        metaTitle: null,
        metaDescription: null,
        ogImageUrl: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
        category: { name: "Digital Name Card", slug: "digital-name-card" },
        template: { name: "Aurora", codeIdentifier: "digital-card-aurora" },
      },
    ] as never);

    const res = await GET(getRequest("http://localhost/api/export/data"));
    expect(res.status).toBe(200);

    const text = await res.text();
    const data = JSON.parse(text);

    expect(data.platform).toBe("NEX CARD");
    expect(data.user.email).toBe("alex@nexcard.io");
    expect(data.profiles).toHaveLength(1);
    expect(data.profiles[0].viewCount).toBe("42");
    expect(res.headers.get("Content-Disposition")).toMatch(/nexcard-export/);
  });
});
