// src/lib/security/payment-url.ts
// Constrain payment screenshot URLs to uploads owned by the submitting user

/**
 * Accepts storage shapes used by this app:
 * - Private local:  private/payments/{userId}-{timestamp}-{uuid}.ext
 * - Private R2:     private/payments/{userId}/{uuid}.ext
 * - Legacy local:   /uploads/payments/{userId}-{timestamp}-{uuid}.ext
 *
 * Public CDN payment URLs are rejected for new submissions.
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
      // New submissions must not use a public CDN URL for proofs
      return false;
    }
  } catch {
    return false;
  }

  if (pathname.startsWith("/")) pathname = pathname.slice(1);

  const privateLocal = new RegExp(
    `^private/payments/${escapedId}-[A-Za-z0-9._-]+$`
  );
  if (privateLocal.test(pathname)) return true;

  const privateR2 = new RegExp(
    `^private/payments/${escapedId}/[A-Za-z0-9._-]+$`
  );
  if (privateR2.test(pathname)) return true;

  // Legacy local disk (pre-hardening)
  const localLegacy = new RegExp(
    `^uploads/payments/${escapedId}-[A-Za-z0-9._-]+$`
  );
  if (localLegacy.test(pathname)) return true;

  return false;
}

/** Normalize a stored screenshot value to a storage key (no leading slash). */
export function paymentStorageKey(raw: string): string | null {
  if (!raw || raw.length > 2048) return null;
  if (raw.includes("..") || raw.includes("\\")) return null;

  let pathname = raw.trim();
  try {
    if (/^https?:\/\//i.test(pathname)) {
      const parsed = new URL(pathname);
      pathname = parsed.pathname;
    }
  } catch {
    return null;
  }
  if (pathname.startsWith("/")) pathname = pathname.slice(1);
  return pathname || null;
}
