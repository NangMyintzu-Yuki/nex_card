// src/lib/thumbnails.ts
// Resolve template thumbnail URLs — migrates legacy placehold.co → local SVGs

/**
 * Maps a template name or placehold.co URL to a local /thumbnails/{name}.svg path.
 * Safe to call with already-local URLs.
 */
export function resolveThumbnailUrl(url: string, templateName?: string): string {
  if (!url) {
    return templateName
      ? `/thumbnails/${templateName.toLowerCase()}.svg`
      : "/thumbnails/aurora.svg";
  }

  // Already local
  if (url.startsWith("/thumbnails/")) return url;

  // Legacy placehold.co — extract name from ?text=Aurora
  if (url.includes("placehold.co")) {
    try {
      const parsed = new URL(url);
      const text = parsed.searchParams.get("text");
      if (text) return `/thumbnails/${decodeURIComponent(text).toLowerCase()}.svg`;
    } catch {
      // fall through
    }
    if (templateName) return `/thumbnails/${templateName.toLowerCase()}.svg`;
  }

  return url;
}
