// src/lib/security/payment-url.ts
// Constrain payment screenshot URLs to uploads owned by the submitting user

/**
 * Accepts storage shapes used by this app:
 * - Local:  /uploads/payments/{userId}-{timestamp}-{uuid}.ext
 * - Absolute same path on APP_URL
 * - R2/CDN: .../uploads/{userId}/payments/{uuid}.ext
 */
export function isOwnedPaymentScreenshotUrl(
  url: string,
  userId: string
): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  if (trimmed.includes("..") || trimmed.includes("\\")) return false;

  const escapedId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let pathname = trimmed;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      pathname = parsed.pathname;
    }
  } catch {
    return false;
  }

  // Local disk pattern: /uploads/payments/{userId}-...
  const localPattern = new RegExp(
    `^/uploads/payments/${escapedId}-[A-Za-z0-9._-]+$`
  );
  if (localPattern.test(pathname)) return true;

  // Object-store pattern: /uploads/{userId}/payments/...
  const objectPattern = new RegExp(
    `^/uploads/${escapedId}/payments/[A-Za-z0-9._-]+$`
  );
  if (objectPattern.test(pathname)) return true;

  // Some CDNs omit leading uploads/ — still require userId + payments
  const loose = new RegExp(
    `/(?:uploads/)?${escapedId}/payments/[A-Za-z0-9._-]+$`
  );
  if (loose.test(pathname)) return true;

  return false;
}
