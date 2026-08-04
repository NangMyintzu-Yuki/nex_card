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
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <div className="relative z-10 max-w-sm">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black">Profile Not Published</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            <strong className="text-white">/{slug}</strong> exists but is still a draft.
            The owner needs to publish it before the QR code will work.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400"
            >
              Go to NEX CARD
            </a>
          </div>
          <p className="mt-6 text-xs text-neutral-700">NEX CARD</p>
        </div>
      </main>
    );
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
