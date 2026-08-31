// src/app/[slug]/page.tsx
// PUBLIC PROFILE RENDER ENGINE

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getProfileBySlug,
  incrementProfileViewCount,
} from "@/lib/cache/profile-cache";
import prisma from "@/lib/db/prisma";
import type { CategorySlug } from "@/lib/validators/template-schemas";
import { SafeTemplateRenderer } from "@/app/p/[slug]/safe-renderer";
import { ProfileJsonLd } from "@/lib/seo/json-ld";
import { APP_URL } from "@/lib/env";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const profiles = await prisma.userProfile.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: "desc" },
      take: 200,
      select: { slug: true },
    });

    return profiles.map((p) => ({ slug: p.slug }));
  } catch (err) {
    console.warn("Skipping static generation for /[slug] (database unavailable):", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) {
    return {
      title: "Page Not Found",
      description: "This profile does not exist or has been removed.",
    };
  }

  const { metaTitle, metaDescription, ogImageUrl, category, user } = profile;

  const resolvedTitle =
    metaTitle ||
    (user?.name && category?.name ? `${user.name} · ${category.name}` : "My Digital Card");

  const resolvedDescription =
    metaDescription ||
    (user?.name && category?.name
      ? `View ${user.name}'s ${category.name} on NEX CARD.`
      : "A beautiful digital presence page.");

  const resolvedOgImage =
    ogImageUrl || `${APP_URL}/api/og?slug=${slug}`;

  const canonicalUrl = `${APP_URL}/${slug}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "profile",
      url: canonicalUrl,
      title: resolvedTitle,
      description: resolvedDescription,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
      siteName: "NEX CARD",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedOgImage],
      creator: "@nexcard",
    },
    robots: {
      index: profile.isPublished,
      follow: profile.isPublished,
      googleBot: {
        index: profile.isPublished,
        follow: profile.isPublished,
      },
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  if (!profile.isPublished) {
    const { getServerSession } = await import("@/lib/auth/session");
    const session = await getServerSession();
    const isOwner = session?.user?.id === profile.user.id;
    if (!isOwner) {
      notFound();
    }
  }

  const { getSettings } = await import("@/lib/settings");
  const settings = await getSettings();
  if (settings.enable_analytics) {
    incrementProfileViewCount(profile.id);
    const { headers } = await import("next/headers");
    const { trackProfileEvent } = await import("@/lib/analytics/track");
    const h = await headers();
    trackProfileEvent({
      profileId: profile.id,
      type: "VIEW",
      referrer: h.get("referer"),
      userAgent: h.get("user-agent"),
    });
  }

  const categorySlug = profile.category.slug as CategorySlug;
  const data = profile.dynamicJsonData as Record<string, unknown>;

  return (
    <>
      <ProfileJsonLd
        profile={{
          slug,
          categorySlug,
          name: profile.user.name,
          description: profile.metaDescription,
          imageUrl: profile.ogImageUrl ?? profile.user.avatarUrl,
          jobTitle: typeof data.fullName === "string" ? (data.jobTitle as string) : undefined,
          businessName: typeof data.businessName === "string" ? data.businessName : undefined,
          weddingDate: typeof data.weddingDate === "string" ? data.weddingDate : undefined,
          partner1:
            data.partner1 && typeof data.partner1 === "object" && "name" in data.partner1
              ? String((data.partner1 as { name?: string }).name ?? "")
              : undefined,
          partner2:
            data.partner2 && typeof data.partner2 === "object" && "name" in data.partner2
              ? String((data.partner2 as { name?: string }).name ?? "")
              : undefined,
        }}
      />
      <Suspense fallback={<ProfileLoadingSkeleton />}>
        <SafeTemplateRenderer
          categorySlug={categorySlug}
          templateCode={profile.template.codeIdentifier}
          dynamicJsonData={profile.dynamicJsonData}
          accentColor={typeof data.accentColor === "string" && data.accentColor ? data.accentColor : profile.template.accentColor}
          backgroundStyle={typeof data.backgroundStyle === "string" ? data.backgroundStyle as "gradient" | "solid" | "mesh" | "noise" : undefined}
          publicSlug={slug}
        />
      </Suspense>
    </>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full animate-pulse flex-col items-center justify-center gap-6 bg-neutral-950 px-4">
      <div className="h-28 w-28 rounded-full bg-neutral-800" />
      <div className="h-8 w-64 rounded-lg bg-neutral-800" />
      <div className="h-4 w-40 rounded bg-neutral-800" />
      <div className="mt-4 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-10 rounded-full bg-neutral-800" />
        ))}
      </div>
    </div>
  );
}
