import { describe, it, expect } from "vitest";
import { isOwnedPaymentScreenshotUrl } from "@/lib/security/payment-url";
import { detectImageMime } from "@/lib/security/image-magic";
import { isReservedSlug } from "@/lib/slugs/reserved";
import { rateLimit } from "@/lib/security/rate-limit";

describe("isReservedSlug", () => {
  it("blocks platform routes", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("login")).toBe(true);
    expect(isReservedSlug("alex-rivera")).toBe(false);
  });
});

describe("isOwnedPaymentScreenshotUrl", () => {
  const userId = "clhuser123456789012345";

  it("accepts local payment upload path for owner", () => {
    expect(
      isOwnedPaymentScreenshotUrl(
        `/uploads/payments/${userId}-1710000000-abcd1234.jpg`,
        userId
      )
    ).toBe(true);
  });

  it("rejects another user's upload", () => {
    expect(
      isOwnedPaymentScreenshotUrl(
        `/uploads/payments/otheruser-1710000000-abcd1234.jpg`,
        userId
      )
    ).toBe(false);
  });

  it("accepts R2-style path", () => {
    expect(
      isOwnedPaymentScreenshotUrl(
        `https://cdn.nexcard.io/uploads/${userId}/payments/abc.png`,
        userId
      )
    ).toBe(true);
  });
});

describe("detectImageMime", () => {
  it("detects PNG magic bytes", () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);
    expect(detectImageMime(png)).toBe("image/png");
  });

  it("rejects non-image bytes", () => {
    expect(detectImageMime(Buffer.from("hello world!!"))).toBeNull();
  });
});

describe("rateLimit", () => {
  it("blocks after limit", () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(false);
  });
});
