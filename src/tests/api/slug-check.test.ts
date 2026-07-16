// src/tests/api/slug-check.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/slug/check/route";
import prisma from "@/lib/db/prisma";
import { getRequest } from "./helpers";

describe("GET /api/slug/check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when slug param is missing", async () => {
    const res = await GET(getRequest("http://localhost/api/slug/check"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.available).toBe(false);
  });

  it("returns unavailable for invalid slug format", async () => {
    const res = await GET(getRequest("http://localhost/api/slug/check?slug=AB"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.available).toBe(false);
    expect(body.message).toMatch(/lowercase/i);
  });

  it("returns unavailable for reserved slugs", async () => {
    const res = await GET(getRequest("http://localhost/api/slug/check?slug=admin"));
    const body = await res.json();
    expect(body.available).toBe(false);
    expect(body.message).toMatch(/reserved/i);
    expect(prisma.userProfile.findUnique).not.toHaveBeenCalled();
  });

  it("returns available when slug is not taken", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

    const res = await GET(getRequest("http://localhost/api/slug/check?slug=alex-rivera"));
    const body = await res.json();

    expect(body.available).toBe(true);
    expect(body.message).toBe("Available!");
    expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
      where: { slug: "alex-rivera" },
      select: { id: true },
    });
  });

  it("returns unavailable when slug is taken", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({ id: "profile-1" } as never);

    const res = await GET(getRequest("http://localhost/api/slug/check?slug=taken-slug"));
    const body = await res.json();

    expect(body.available).toBe(false);
    expect(body.message).toMatch(/already taken/i);
  });
});
