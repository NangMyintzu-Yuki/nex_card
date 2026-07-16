// src/tests/api/auth-login.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";
import prisma from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/hash";
import { jsonRequest, readJson } from "./helpers";

vi.mock("@/lib/auth/hash", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/auth/login", "POST", {
        email: "not-an-email",
        password: "secret123",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 401 when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await POST(
      jsonRequest("http://localhost/api/auth/login", "POST", {
        email: "missing@nexcard.io",
        password: "secret123",
      })
    );

    expect(res.status).toBe(401);
    const body = await readJson<{ message: string }>(res);
    expect(body.message).toMatch(/invalid email or password/i);
  });

  it("returns 403 for suspended accounts", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "Suspended",
      email: "suspended@nexcard.io",
      hashedPassword: "hash",
      status: "SUSPENDED",
      role: "USER",
    } as never);

    const res = await POST(
      jsonRequest("http://localhost/api/auth/login", "POST", {
        email: "suspended@nexcard.io",
        password: "secret123",
      })
    );

    expect(res.status).toBe(403);
  });

  it("returns 401 for wrong password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "Alex",
      email: "alex@nexcard.io",
      hashedPassword: "hash",
      status: "ACTIVE",
      role: "USER",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const res = await POST(
      jsonRequest("http://localhost/api/auth/login", "POST", {
        email: "alex@nexcard.io",
        password: "wrong-password",
      })
    );

    expect(res.status).toBe(401);
  });

  it("creates session and sets cookie on success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      name: "Alex",
      email: "alex@nexcard.io",
      hashedPassword: "hash",
      status: "ACTIVE",
      role: "USER",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(prisma.session.create).mockResolvedValue({} as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const res = await POST(
      jsonRequest("http://localhost/api/auth/login", "POST", {
        email: "alex@nexcard.io",
        password: "correct-password",
      })
    );

    expect(res.status).toBe(200);
    const body = await readJson<{ success: boolean; user: { email: string } }>(res);
    expect(body.success).toBe(true);
    expect(body.user.email).toBe("alex@nexcard.io");
    expect(prisma.session.create).toHaveBeenCalledOnce();
    expect(res.cookies.get("session_token")?.value).toBeTruthy();
  });
});
