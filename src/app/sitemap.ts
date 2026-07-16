// src/app/sitemap.ts
// Dynamic sitemap — lists all published public profile pages

import type { MetadataRoute } from "next";
import prisma from "@/lib/db/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nexcard.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  try {
    const profiles = await prisma.userProfile.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const profilePages: MetadataRoute.Sitemap = profiles.map((profile) => ({
      url: `${APP_URL}/${profile.slug}`,
      lastModified: profile.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...profilePages];
  } catch {
    return staticPages;
  }
}
