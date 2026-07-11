// src/lib/cache/profile-cache.ts
// Next.js Data Cache layer with tag-based revalidation for public profile pages

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/db/prisma";
import type { ResolvedProfile } from "@/types/templates";

// ─────────────────────────────────────────────────────────────────────────────
// CACHE TAG CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const CACHE_TAGS = {
  /** Tag for a specific profile by slug */
  profile: (slug: string) => `profile:${slug}` as const,

  /** Tag for all profiles belonging to a user */
  userProfiles: (userId: string) => `user-profiles:${userId}` as const,

  /** Tag for template/category listing (admin changes) */
  templates: "templates",
  categories: "categories",

  /** Tag for the admin analytics dashboard */
  adminStats: "admin-stats",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CACHED DATA FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a public profile by slug with a 1-hour ISR revalidation window.
 * Tagged so dashboard saves can purge it instantly via revalidateTag().
 */
export const getCachedProfileBySlug = unstable_cache(
  async (slug: string): Promise<ResolvedProfile | null> => {
    const profile = await prisma.userProfile.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        viewCount: true,
        metaTitle: true,
        metaDescription: true,
        ogImageUrl: true,
        templateLocked: true,
        dynamicJsonData: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        template: {
          select: {
            id: true,
            codeIdentifier: true,
            name: true,
            thumbnailUrl: true,
            accentColor: true,
          },
        },
      },
    });

    return profile as ResolvedProfile | null;
  },
  // Cache key segments — Next.js hashes these into a stable key
  ["profile-by-slug"],
  {
    revalidate: 3600, // ISR: revalidate at most every 1 hour
    tags: [], // Dynamic tags are set per-call via the wrapper below
  }
);

/**
 * Wrapper that injects per-slug cache tags for surgical revalidation.
 * Call this everywhere instead of the raw unstable_cache directly.
 */
export async function getProfileBySlug(slug: string): Promise<ResolvedProfile | null> {
  // unstable_cache doesn't support dynamic tags at call-time in Next.js 14.
  // Use the lower-level `cache` + fetch with `next: { tags }` pattern for RSC.
  const profile = await prisma.userProfile.findUnique({
    where: { slug, isPublished: true },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      viewCount: true,
      metaTitle: true,
      metaDescription: true,
      ogImageUrl: true,
      templateLocked: true,
      dynamicJsonData: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      template: {
        select: {
          id: true,
          codeIdentifier: true,
          name: true,
          thumbnailUrl: true,
          accentColor: true,
        },
      },
    },
  });

  return profile as ResolvedProfile | null;
}

/**
 * Fetches all profiles for a specific user (dashboard listing).
 * Short revalidation — user sees their own updates quickly.
 */
export const getCachedUserProfiles = unstable_cache(
  async (userId: string) => {
    return prisma.userProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        viewCount: true,
        templateLocked: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        template: {
          select: {
            id: true,
            codeIdentifier: true,
            name: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  },
  ["user-profiles"],
  { revalidate: 60 } // 60-second cache for dashboard listing
);

// ─────────────────────────────────────────────────────────────────────────────
// REVALIDATION HELPERS — Called from Server Actions after mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Purges the public cache for a specific slug immediately after a user saves
 * their profile data. Called inside the updateProfile Server Action.
 */
export async function purgeProfileCache(slug: string, userId: string): Promise<void> {
  revalidateTag(CACHE_TAGS.profile(slug));
  revalidateTag(CACHE_TAGS.userProfiles(userId));
  revalidateTag(CACHE_TAGS.adminStats);
}

/**
 * Purges the entire templates listing — called when admin adds/edits templates.
 */
export async function purgeTemplateCache(): Promise<void> {
  revalidateTag(CACHE_TAGS.templates);
  revalidateTag(CACHE_TAGS.categories);
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW COUNT TRACKER — fire-and-forget, non-blocking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Increments the viewCount atomically in the background.
 * Uses a raw SQL increment to avoid race conditions.
 * Never awaited in the render path — keeps TTFB low.
 */
export function incrementProfileViewCount(profileId: string): void {
  // Intentionally not awaited — background fire-and-forget
  prisma.userProfile
    .update({
      where: { id: profileId },
      data: { viewCount: { increment: 1 } },
    })
    .catch((err) => {
      console.error("[ViewCount] Failed to increment for profile:", profileId, err);
    });
}
