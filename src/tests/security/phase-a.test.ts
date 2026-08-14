import { describe, it, expect } from "vitest";
import { isOwnedPaymentScreenshotUrl } from "@/lib/security/payment-url";
import { isOwnedUploadTarget } from "@/lib/security/upload-ownership";
import { detectImageMime } from "@/lib/security/image-magic";
import { isReservedSlug } from "@/lib/slugs/reserved";
import { rateLimit } from "@/lib/security/rate-limit";
import { safeHref } from "@/lib/security/safe-href";
import { safeCallbackUrl } from "@/lib/security/callback-url";

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

  it("accepts private local key", () => {
    expect(
      isOwnedPaymentScreenshotUrl(
        `private/payments/${userId}-1710000000-abcd1234.jpg`,
        userId
      )
    ).toBe(true);
  });

  it("accepts private R2 key", () => {
    expect(
      isOwnedPaymentScreenshotUrl(
        `private/payments/${userId}/abc.png`,
        userId
      )
    ).toBe(true);
  });

  it("rejects public CDN payment URL for new submissions", () => {
    expect(
      isOwnedPaymentScreenshotUrl(
        `https://cdn.www.nexcard.wetechmm.com/uploads/${userId}/payments/abc.png`,
        userId
      )
    ).toBe(false);
  });
});

describe("isOwnedUploadTarget", () => {
  const userId = "clhuser123456789012345";

  it("accepts R2 pathname owned by user", () => {
    expect(
      isOwnedUploadTarget(
        `https://cdn.www.nexcard.wetechmm.com/uploads/${userId}/gallery/abc.png`,
        userId
      )
    ).toBe(true);
  });

  it("rejects query-string spoof", () => {
    expect(
      isOwnedUploadTarget(
        `https://cdn.www.nexcard.wetechmm.com/uploads/victim/payments/x.jpg?x=${userId}`,
        userId
      )
    ).toBe(false);
  });

  it("accepts private payment key", () => {
    expect(
      isOwnedUploadTarget(`private/payments/${userId}/shot.jpg`, userId)
    ).toBe(true);
  });
});

describe("safeHref", () => {
  it("allows https and rejects javascript", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com/");
    expect(safeHref("javascript:alert(1)")).toBe("#");
    expect(safeHref("example.com")).toBe("https://example.com/");
  });
});

describe("safeCallbackUrl", () => {
  it("allowlists dashboard and admin paths", () => {
    expect(safeCallbackUrl("/dashboard", "/dashboard")).toBe("/dashboard");
    expect(safeCallbackUrl("/dashboard/profiles", "/dashboard")).toBe(
      "/dashboard/profiles"
    );
    expect(safeCallbackUrl("/admin/security", "/admin")).toBe("/admin/security");
  });

  it("rejects open redirects", () => {
    expect(safeCallbackUrl("https://evil.example", "/dashboard")).toBe(
      "/dashboard"
    );
    expect(safeCallbackUrl("//evil.example", "/dashboard")).toBe("/dashboard");
    expect(safeCallbackUrl("/login", "/dashboard")).toBe("/dashboard");
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
