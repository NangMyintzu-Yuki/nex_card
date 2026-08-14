// src/lib/security/upload-ownership.ts
// Ownership checks for DELETE /api/upload — pathname only, ignore query/hash

/**
 * Returns true when `raw` points at an object owned by `userId`.
 * Query strings and hashes are ignored so `?x={attackerId}` cannot bypass.
 */
export function isOwnedUploadTarget(raw: string, userId: string): boolean {
  if (!raw || !userId || raw.length > 2048) return false;
  if (raw.includes("..") || raw.includes("\\")) return false;

  const escapedId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let pathname = raw.trim();
  try {
    if (/^https?:\/\//i.test(pathname)) {
      const parsed = new URL(pathname);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      pathname = parsed.pathname;
    }
  } catch {
    return false;
  }

  if (pathname.startsWith("/")) pathname = pathname.slice(1);

  const patterns = [
    // R2 public: uploads/{userId}/{folder}/file
    new RegExp(`^uploads/${escapedId}/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$`),
    // Local public: uploads/{folder}/{userId}-...
    new RegExp(`^uploads/[A-Za-z0-9._-]+/${escapedId}-[A-Za-z0-9._-]+$`),
    // Private R2: private/payments/{userId}/file
    new RegExp(`^private/payments/${escapedId}/[A-Za-z0-9._-]+$`),
    // Private local: private/payments/{userId}-...
    new RegExp(`^private/payments/${escapedId}-[A-Za-z0-9._-]+$`),
  ];

  return patterns.some((re) => re.test(pathname));
}

/** Storage key used for delete/read — pathname without leading slash, no query. */
export function uploadKeyFromUrl(raw: string): string | null {
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
