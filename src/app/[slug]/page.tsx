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
import { TemplateRenderer } from "@/components/templates/template-renderer";
import { SafeTemplateRenderer } from "@/app/p/[slug]/safe-renderer";
import { ProfileJsonLd } from "@/lib/seo/json-ld";
import { APP_URL } from "@/lib/env";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const profiles = await prisma.userProfile.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 200,
    select: { slug: true },
  });

  return profiles.map((p) => ({ slug: p.slug }));
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
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <div className="relative z-10 max-w-sm">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black">Profile is a Draft</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            <strong className="text-white">/{slug}</strong> exists but hasn&apos;t been published
            yet. Go to your editor, toggle <strong className="text-amber-400">Publish Now</strong>,
            then save.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/dashboard/edit/${slug}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-amber-400"
            >
              Edit &amp; Publish →
            </a>
            <a
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/20"
            >
              Dashboard
            </a>
          </div>
          <p className="mt-6 text-xs text-neutral-700">NEX CARD</p>
        </div>
      </main>
    );
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
          accentColor={profile.template.accentColor}
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
