// src/app/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC PROFILE RENDER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
// Architecture decisions:
//   • ISR via `export const revalidate` — pages served from CDN edge cache
//   • `generateMetadata` fetches from DB for pixel-perfect OG sharing
//   • `generateStaticParams` pre-builds high-traffic slugs at deploy time
//   • Template switching is a pure conditional render — no dynamic import
//     waterfalls; all templates are bundled in the server component tree
//   • View count increment is fire-and-forget — never blocks TTFB

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProfileBySlug, incrementProfileViewCount } from "@/lib/cache/profile-cache";
import prisma from "@/lib/db/prisma";
import { parseTemplateData, type CategorySlug } from "@/lib/validators/template-schemas";
import { TEMPLATE_IDS } from "@/types/templates";

// ── Template imports — Digital Name Card ─────────────────────────────────────
import { AuroraNameCard } from "@/components/templates/digital-name-card/aurora";
import { ObsidianNameCard } from "@/components/templates/digital-name-card/obsidian";
import { PrismNameCard } from "@/components/templates/digital-name-card/prism";
import { CoralNameCard } from "@/components/templates/digital-name-card/coral";
import { TitaniumNameCard } from "@/components/templates/digital-name-card/titanium";

// ── Template imports — Portfolio ─────────────────────────────────────────────
import { CanvasPortfolio } from "@/components/templates/portfolio/canvas";
import { StudioPortfolio } from "@/components/templates/portfolio/studio";
import { ForgePortfolio } from "@/components/templates/portfolio/forge";
import { SpectrumPortfolio } from "@/components/templates/portfolio/spectrum";
import { BlueprintPortfolio } from "@/components/templates/portfolio/blueprint";

// ── Template imports — Business Advertisement ────────────────────────────────
import { MarqueeBusiness } from "@/components/templates/business-ad/marquee";
import { DistrictBusiness } from "@/components/templates/business-ad/district";
import { EmpireBusiness } from "@/components/templates/business-ad/empire";
import { NeonBusiness } from "@/components/templates/business-ad/neon";
import { VaultBusiness } from "@/components/templates/business-ad/vault";

// ── Template imports — Wedding Invitation ────────────────────────────────────
import { EternalWedding } from "@/components/templates/wedding/eternal";
import { BlossomWedding } from "@/components/templates/wedding/blossom";
import { NoirWedding } from "@/components/templates/wedding/noir";
import { CelestialWedding } from "@/components/templates/wedding/celestial";
import { RusticWedding } from "@/components/templates/wedding/rustic";

// ─────────────────────────────────────────────────────────────────────────────
// ISR CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Revalidate the cached page at most every 3600 seconds (1 hour) via ISR.
// The `purgeProfileCache` server action calls `revalidateTag` on save,
// which immediately invalidates the edge cache — making updates appear
// within milliseconds of the user clicking "Publish".
export const revalidate = 3600;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC PARAMS — Pre-build the most active slugs at deploy time
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  // Pre-build the top 200 most-viewed published profiles at build time.
  // All others are generated on-demand with ISR on first request.
  const profiles = await prisma.userProfile.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 200,
    select: { slug: true },
  });

  return profiles.map((p) => ({ slug: p.slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE METADATA — Full OG, Twitter Card, and canonical SEO
// ─────────────────────────────────────────────────────────────────────────────

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

  // Resolve display title: user override → generated → fallback
 const resolvedTitle =
  metaTitle ||
  (user?.name && category?.name 
    ? `${user.name} · ${category.name}` 
    : "My Digital Card");

  const resolvedDescription =
  metaDescription ||
  (user?.name && category?.name 
    ? `View ${user.name}'s ${category.name} on PresenceCard.` 
    : "A beautiful digital presence page.");

const resolvedOgImage =
  ogImageUrl ||
  (slug 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/og?slug=${slug}` 
    : `${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`);

  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
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
      siteName: "PresenceCard",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedOgImage],
      creator: "@presencecard",
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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT — The Dynamic Template Render Switching Engine
// ─────────────────────────────────────────────────────────────────────────────

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
    // Profile exists but draft — show actionable page instead of 404
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <div className="relative z-10 max-w-sm">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl mx-auto"
            style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)"}}>
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black">Profile is a Draft</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            <strong className="text-white">/{slug}</strong> exists but hasn&apos;t been published yet.
            Go to your editor, toggle <strong className="text-amber-400">Publish Now</strong>, then save.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={`/dashboard/edit/${slug}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-all">
              Edit &amp; Publish →
            </a>
            <a href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/20 transition-all">
              Dashboard
            </a>
          </div>
          <p className="mt-6 text-xs text-neutral-700">PresenceCard</p>
        </div>
      </main>
    );
  }

  // Fire-and-forget view count increment — never blocks render
  incrementProfileViewCount(profile.id);

  const categorySlug = profile.category.slug as CategorySlug;
  const templateCode = profile.template.codeIdentifier;

  // ── Safe JSON Parsing ──────────────────────────────────────────────────────
  // parseTemplateData throws a ZodError with descriptive messages if the
  // stored JSON is malformed. This surfaces as a 500 in prod, which is
  // preferable to silently rendering broken UI with partial data.
  const parsedData = parseTemplateData(categorySlug, profile.dynamicJsonData);

  // ── Template Switching Engine ──────────────────────────────────────────────
  // Each category block is a compile-time switch — no dynamic import() needed.
  // Next.js server components handle code-splitting at the route level.

  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      {categorySlug === "digital-name-card" && (
        <DigitalNameCardSwitch
          templateCode={templateCode}
          data={parsedData as ReturnType<typeof parseTemplateData<"digital-name-card">>}
          accentColor={profile.template.accentColor}
        />
      )}

      {categorySlug === "portfolio" && (
        <PortfolioSwitch
          templateCode={templateCode}
          data={parsedData as ReturnType<typeof parseTemplateData<"portfolio">>}
          accentColor={profile.template.accentColor}
        />
      )}

      {categorySlug === "business-ad" && (
        <BusinessAdSwitch
          templateCode={templateCode}
          data={parsedData as ReturnType<typeof parseTemplateData<"business-ad">>}
          accentColor={profile.template.accentColor}
        />
      )}

      {categorySlug === "wedding-invitation" && (
        <WeddingSwitch
          templateCode={templateCode}
          data={parsedData as ReturnType<typeof parseTemplateData<"wedding-invitation">>}
          accentColor={profile.template.accentColor}
        />
      )}
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SWITCH COMPONENTS
// Separate components keep the match logic clean and type-safe
// ─────────────────────────────────────────────────────────────────────────────

interface SwitchProps<T> {
  templateCode: string;
  data: T;
  accentColor: string | null;
}

function DigitalNameCardSwitch({
  templateCode,
  data,
  accentColor,
}: SwitchProps<ReturnType<typeof parseTemplateData<"digital-name-card">>>) {
  const props = { data, accentColor: accentColor ?? undefined };

  switch (templateCode) {
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.AURORA:
      return <AuroraNameCard {...props} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.OBSIDIAN:
      return <ObsidianNameCard {...props} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.PRISM:
      return <PrismNameCard {...props} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.CORAL:
      return <CoralNameCard {...props} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.TITANIUM:
      return <TitaniumNameCard {...props} />;
    default:
      return <AuroraNameCard {...props} />;
  }
}

function PortfolioSwitch({
  templateCode,
  data,
  accentColor,
}: SwitchProps<ReturnType<typeof parseTemplateData<"portfolio">>>) {
  const props = { data, accentColor: accentColor ?? undefined };

  switch (templateCode) {
    case TEMPLATE_IDS.PORTFOLIO.CANVAS:
      return <CanvasPortfolio {...props} />;
    case TEMPLATE_IDS.PORTFOLIO.STUDIO:
      return <StudioPortfolio {...props} />;
    case TEMPLATE_IDS.PORTFOLIO.FORGE:
      return <ForgePortfolio {...props} />;
    case TEMPLATE_IDS.PORTFOLIO.SPECTRUM:
      return <SpectrumPortfolio {...props} />;
    case TEMPLATE_IDS.PORTFOLIO.BLUEPRINT:
      return <BlueprintPortfolio {...props} />;
    default:
      return <CanvasPortfolio {...props} />;
  }
}

function BusinessAdSwitch({
  templateCode,
  data,
  accentColor,
}: SwitchProps<ReturnType<typeof parseTemplateData<"business-ad">>>) {
  const props = { data, accentColor: accentColor ?? undefined };

  switch (templateCode) {
    case TEMPLATE_IDS.BUSINESS_AD.MARQUEE:
      return <MarqueeBusiness {...props} />;
    case TEMPLATE_IDS.BUSINESS_AD.DISTRICT:
      return <DistrictBusiness {...props} />;
    case TEMPLATE_IDS.BUSINESS_AD.EMPIRE:
      return <EmpireBusiness {...props} />;
    case TEMPLATE_IDS.BUSINESS_AD.NEON:
      return <NeonBusiness {...props} />;
    case TEMPLATE_IDS.BUSINESS_AD.VAULT:
      return <VaultBusiness {...props} />;
    default:
      return <MarqueeBusiness {...props} />;
  }
}

function WeddingSwitch({
  templateCode,
  data,
  accentColor,
}: SwitchProps<ReturnType<typeof parseTemplateData<"wedding-invitation">>>) {
  const props = { data, accentColor: accentColor ?? undefined };

  switch (templateCode) {
    case TEMPLATE_IDS.WEDDING.ETERNAL:
      return <EternalWedding {...props} />;
    case TEMPLATE_IDS.WEDDING.BLOSSOM:
      return <BlossomWedding {...props} />;
    case TEMPLATE_IDS.WEDDING.NOIR:
      return <NoirWedding {...props} />;
    case TEMPLATE_IDS.WEDDING.CELESTIAL:
      return <CelestialWedding {...props} />;
    case TEMPLATE_IDS.WEDDING.RUSTIC:
      return <RusticWedding {...props} />;
    default:
      return <EternalWedding {...props} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────

function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen w-full animate-pulse bg-neutral-950 flex flex-col items-center justify-center gap-6 px-4">
      <div className="h-28 w-28 rounded-full bg-neutral-800" />
      <div className="h-8 w-64 rounded-lg bg-neutral-800" />
      <div className="h-4 w-40 rounded bg-neutral-800" />
      <div className="flex gap-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-10 rounded-full bg-neutral-800" />
        ))}
      </div>
    </div>
  );
}