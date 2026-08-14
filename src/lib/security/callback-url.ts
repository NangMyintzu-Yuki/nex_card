// Relative post-login redirects only — blocks open redirects.

const ALLOWED_PREFIXES = ["/dashboard", "/admin"];

export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw) return fallback;
  const path = raw.trim();
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("://")
  ) {
    return fallback;
  }
  if (ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return path;
  }
  return fallback;
}
