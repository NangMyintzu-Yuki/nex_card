// src/app/p/[slug]/page.tsx
// /p/[slug] — Public QR-scanned profile landing route

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import {
  getProfileBySlug,
  incrementQRScanCount,
} from "@/lib/cache/profile-cache";
import prisma from "@/lib/db/prisma";
import type { CategorySlug } from "@/lib/validators/template-schemas";
import { APP_URL } from "@/lib/env";
import { SafeTemplateRenderer } from "./safe-renderer";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const profiles = await prisma.userProfile.findMany({
      where: { isPublished: true, qrLocked: true },
      orderBy: { qrScanCount: "desc" },
      take: 500,
      select: { slug: true },
    });
    return profiles.map((p) => ({ slug: p.slug }));
  } catch (err) {
    console.warn("Skipping static generation for /p/[slug] (database unavailable):", err);
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

  if (!profile || !profile.isPublished) {
    return { title: "Page Not Found" };
  }

  const title = profile.metaTitle ?? `${profile.user.name} · ${profile.category.name}`;
  const description =
    profile.metaDescription ??
    `View ${profile.user.name}'s ${profile.category.name} on NEX CARD.`;
  const ogImage = profile.ogImageUrl ?? `${APP_URL}/api/og?slug=${slug}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${APP_URL}/${slug}`,
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QRProfilePage({ params }: PageProps) {
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

  if (!profile.qrLocked) {
    redirect(`/${slug}`);
  }

  incrementQRScanCount(profile.id);
  const { getSettings } = await import("@/lib/settings");
  const settings = await getSettings();
  if (settings.enable_analytics) {
    const { headers } = await import("next/headers");
    const { trackProfileEvent } = await import("@/lib/analytics/track");
    const h = await headers();
    trackProfileEvent({
      profileId: profile.id,
      type: "QR_SCAN",
      referrer: h.get("referer"),
      userAgent: h.get("user-agent"),
    });
  }

  const categorySlug = profile.category.slug as CategorySlug;
  const accentColor = profile.template.accentColor ?? undefined;

  return (
    <Suspense fallback={<QRLoadingSkeleton />}>
      <SafeTemplateRenderer
        categorySlug={categorySlug}
        templateCode={profile.template.codeIdentifier}
        dynamicJsonData={profile.dynamicJsonData}
        accentColor={accentColor}
        publicSlug={slug}
      />
    </Suspense>
  );
}

function QRLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full animate-pulse flex-col items-center justify-center gap-6 bg-neutral-950 px-4">
      <div className="h-28 w-28 rounded-full bg-neutral-800" />
      <div className="h-8 w-64 rounded-lg bg-neutral-800" />
      <div className="h-4 w-40 rounded bg-neutral-800" />
    </div>
  );
}
