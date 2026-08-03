// src/lib/slugs/reserved.ts
// Shared reserved slugs — used by /api/slug/check AND selectTemplateAction

export const RESERVED_SLUGS = new Set([
  "admin",
  "dashboard",
  "login",
  "register",
  "logout",
  "api",
  "settings",
  "onboarding",
  "help",
  "about",
  "pricing",
  "contact",
  "terms",
  "privacy",
  "blog",
  "legal",
  "presencecard",
  "nexcard",
  "nex-card",
  "support",
  "404",
  "500",
  "sitemap",
  "robots",
  "manifest",
  "icon",
  "apple-icon",
  "maintenance",
  "p",
  "demo",
  "export",
  "upload",
  "uploads",
  "forgot-password",
  "reset-password",
  "verify-email",
  "cron",
  "n",
  "health",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}
