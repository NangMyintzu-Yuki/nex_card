import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";

describe("hashPassword / verifyPassword", () => {
  it("verifies bcrypt hashes created by hashPassword", async () => {
    const hash = await hashPassword("secure-password-123");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword("secure-password-123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("supports legacy SHA-256 hex hashes from seed data", async () => {
    const legacyHash =
      "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";
    expect(await verifyPassword("password123", legacyHash)).toBe(true);
    expect(await verifyPassword("wrong", legacyHash)).toBe(false);
  });
});
