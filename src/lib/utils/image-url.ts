// src/lib/utils/image-url.ts
// Resolves image URLs to work in both local dev and production.
// Handles: relative paths, localhost URLs, R2/CDN URLs.

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Already a full external URL (R2, Cloudinary, etc.)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Replace localhost URLs with current origin (client-side) or APP_URL (server-side)
    if (url.includes("localhost")) {
      if (typeof window !== "undefined") {
        return url.replace(/https?:\/\/localhost:\d+/, window.location.origin);
      }
      // Server-side: use APP_URL env
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      return url.replace(/https?:\/\/localhost:\d+/, appUrl);
    }
    return url;
  }

  // Relative path — prepend origin
  if (url.startsWith("/")) {
    if (typeof window !== "undefined") {
      return url;
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return `${appUrl}${url}`;
  }

  return url;
}
