// src/tests/api/auth-register.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/hash";
import { jsonRequest, readJson } from "./helpers";

vi.mock("@/lib/auth/hash", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn(),
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for weak password", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/auth/register", "POST", {
        name: "Alex",
        email: "alex@nexcard.io",
        password: "short",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing" } as never);

    const res = await POST(
      jsonRequest("http://localhost/api/auth/register", "POST", {
        name: "Alex",
        email: "existing@nexcard.io",
        password: "password123",
      })
    );

    expect(res.status).toBe(409);
    const body = await readJson<{ message: string }>(res);
    expect(body.message).toMatch(/already exists/i);
  });

  it("creates a pending user and requires email verification", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-new",
      name: "Alex",
      email: "alex@nexcard.io",
      role: "USER",
    } as never);
    vi.mocked(prisma.emailToken.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.emailToken.create).mockResolvedValue({} as never);
    vi.mocked(prisma.verificationCode.deleteMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.verificationCode.create).mockResolvedValue({} as never);

    const res = await POST(
      jsonRequest("http://localhost/api/auth/register", "POST", {
        name: "Alex Rivera",
        email: "alex@nexcard.io",
        password: "password123",
      })
    );

    expect(res.status).toBe(201);
    const body = await readJson<{
      success: boolean;
      requiresVerification: boolean;
    }>(res);
    expect(body.success).toBe(true);
    expect(body.requiresVerification).toBe(true);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING_VERIFICATION",
          emailVerifiedAt: null,
        }),
      })
    );
    expect(prisma.session.create).not.toHaveBeenCalled();
    expect(res.cookies.get("session_token")?.value).toBeFalsy();
  });
});
