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

const PROFILE_SELECT = {
  id: true,
  slug: true,
  isPublished: true,
  viewCount: true,
  metaTitle: true,
  metaDescription: true,
  ogImageUrl: true,
  templateLocked: true,
  qrLocked: true,
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
} as const;

async function fetchProfileBySlug(slug: string): Promise<ResolvedProfile | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { slug },
    select: PROFILE_SELECT,
  });

  if (!profile) return null;
  // BigInt can't be JSON-serialized by the cache layer — convert to Number.
  return { ...profile, viewCount: Number(profile.viewCount) } as ResolvedProfile;
}

/**
 * Fetches a profile by slug (published or draft).
 * Published profiles are ISR-cached with per-slug tags for surgical revalidation.
 * Draft profiles bypass cache so owners see live edits immediately.
 */
export async function getProfileBySlug(slug: string): Promise<ResolvedProfile | null> {
  const getCachedPublishedProfile = unstable_cache(
    async (cachedSlug: string) => {
      const profile = await fetchProfileBySlug(cachedSlug);
      if (!profile?.isPublished) return null;
      return profile;
    },
    ["profile-by-slug", slug],
    {
      revalidate: 3600,
      tags: [CACHE_TAGS.profile(slug)],
    }
  );

  const cached = await getCachedPublishedProfile(slug);
  if (cached) return cached;

  return fetchProfileBySlug(slug);
}

/**
 * Fetches all profiles for a specific user (dashboard listing).
 * Short revalidation — user sees their own updates quickly.
 * Cache key MUST include userId to prevent cross-user data leaks.
 */
export async function getCachedUserProfiles(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const profiles = await prisma.userProfile.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          isPublished: true,
          viewCount: true,
          templateLocked: true,
          paymentStatus: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          template: {
            select: {
              id: true,
              codeIdentifier: true,
              name: true,
              thumbnailUrl: true,
              isPremium: true,
              priceQrOnly: true,
              priceNfcCard: true,
              priceNfcQr: true,
            },
          },
          payment: {
            select: { tier: true, status: true, screenshotUrl: true },
          },
        },
      });
      return profiles.map((p) => ({ ...p, viewCount: Number(p.viewCount) }));
    },
    ["user-profiles", userId],
    {
      revalidate: 60,
      tags: [CACHE_TAGS.userProfiles(userId)],
    }
  );

  return getCached();
}

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
 * Never awaited in the render path — keeps TTFB low.
 */
export function incrementProfileViewCount(profileId: string): void {
  prisma.userProfile
    .update({
      where: { id: profileId },
      data: { viewCount: { increment: 1 } },
    })
    .catch((err) => {
      console.error("[ViewCount] Failed to increment for profile:", profileId, err);
    });
}

/**
 * Increments QR scan count atomically in the background.
 * Not a server action — avoids unauthenticated RPC abuse.
 */
export function incrementQRScanCount(profileId: string): void {
  prisma.userProfile
    .update({
      where: { id: profileId },
      data: { qrScanCount: { increment: 1 } },
    })
    .catch((err) => {
      console.error("[QR ScanCount] Failed for profile:", profileId, err);
    });
}
