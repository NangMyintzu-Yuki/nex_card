// src/tests/security/phase-c.test.ts
import { describe, it, expect } from "vitest";
import {
  generateTotpSecret,
  generateTotp,
  verifyTotp,
} from "@/lib/auth/totp";
import { detectDevice } from "@/lib/analytics/track";
import { isReservedSlug } from "@/lib/slugs/reserved";

describe("Phase C — TOTP", () => {
  it("generates and verifies a TOTP code", () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret);
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyTotp(secret, code)).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
  });
});

describe("Phase C — analytics device detect", () => {
  it("classifies common user agents", () => {
    expect(detectDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(
      "mobile"
    );
    expect(detectDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
    expect(detectDevice("Googlebot/2.1")).toBe("bot");
  });
});

describe("Phase C — reserved NFC slug", () => {
  it("reserves n for NFC tap route", () => {
    expect(isReservedSlug("n")).toBe(true);
  });
});
