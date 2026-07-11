// src/app/p/[slug]/page.tsx
// /p/[slug] — Public QR-scanned profile landing route
//
// This is a SEPARATE route from /[slug]. When a user scans the QR code,
// they land here instead of the main public profile. This allows:
//   • Separate scan tracking (qrScanCount) vs regular viewCount
//   • A "QR entry" splash that smoothly transitions to the full template
//   • Analytics distinction between organic traffic and QR-driven visits

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/db/prisma";
import { parseTemplateData, type CategorySlug } from "@/lib/validators/template-schemas";
import { TEMPLATE_IDS } from "@/types/templates";

// Import all template components
import { AuroraNameCard }    from "@/components/templates/digital-name-card/aurora";
import { ObsidianNameCard }  from "@/components/templates/digital-name-card/obsidian";
import { PrismNameCard }     from "@/components/templates/digital-name-card/prism";
import { CoralNameCard }     from "@/components/templates/digital-name-card/coral";
import { TitaniumNameCard }  from "@/components/templates/digital-name-card/titanium";
import { CanvasPortfolio }   from "@/components/templates/portfolio/canvas";
import { StudioPortfolio }   from "@/components/templates/portfolio/studio";
import { ForgePortfolio }    from "@/components/templates/portfolio/forge";
import { SpectrumPortfolio } from "@/components/templates/portfolio/spectrum";
import { BlueprintPortfolio }from "@/components/templates/portfolio/blueprint";
import { MarqueeBusiness }   from "@/components/templates/business-ad/marquee";
import { DistrictBusiness }  from "@/components/templates/business-ad/district";
import { EmpireBusiness }    from "@/components/templates/business-ad/empire";
import { NeonBusiness }      from "@/components/templates/business-ad/neon";
import { VaultBusiness }     from "@/components/templates/business-ad/vault";
import { EternalWedding }    from "@/components/templates/wedding/eternal";
import { BlossomWedding }    from "@/components/templates/wedding/blossom";
import { NoirWedding }       from "@/components/templates/wedding/noir";
import { CelestialWedding }  from "@/components/templates/wedding/celestial";
import { RusticWedding }     from "@/components/templates/wedding/rustic";
import { QRScanBadge }       from "@/components/templates/qr-scan-badge";
import { incrementQRScanCount } from "@/lib/actions/qr-action";

// ISR — same as main profile route
export const revalidate = 3600;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC PARAMS — Pre-build all QR-locked profiles
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const profiles = await prisma.userProfile.findMany({
    where: { isPublished: true, qrLocked: true },
    orderBy: { qrScanCount: "desc" },
    take: 500,
    select: { slug: true },
  });
  return profiles.map((p) => ({ slug: p.slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.userProfile.findUnique({
    where: { slug, isPublished: true },
    select: {
      metaTitle: true,
      metaDescription: true,
      ogImageUrl: true,
      user: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  if (!profile) {
    return { title: "Page Not Found" };
  }

  const title = profile.metaTitle ?? `${profile.user.name} · ${profile.category.name}`;
  const description = profile.metaDescription ?? `View ${profile.user.name}'s ${profile.category.name} on PresenceCard.`;
  const ogImage = profile.ogImageUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/og?slug=${slug}`;

  return {
    title,
    description,
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
    // Mark as canonical — the /p/ route is the QR-specific URL
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/p/${slug}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE — Renders the full template + increments QR scan count
// ─────────────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QRProfilePage({ params }: PageProps) {
  const { slug } = await params;

  const profile = await prisma.userProfile.findUnique({
    where: { slug, isPublished: true },
    select: {
      id: true,
      slug: true,
      qrLocked: true,
      isPublished: true,
      dynamicJsonData: true,
      template: {
        select: {
          codeIdentifier: true,
          accentColor: true,
          name: true,
        },
      },
      category: { select: { slug: true, name: true } },
    },
  });

  if (!profile) notFound();

  // If QR not generated yet — redirect to main profile page
  if (!profile.qrLocked) {
    redirect(`/${slug}`);
  }

  // Fire-and-forget QR scan count increment
  incrementQRScanCount(profile.id);

  const categorySlug = profile.category.slug as CategorySlug;
  const parsedData = parseTemplateData(categorySlug, profile.dynamicJsonData);
  const templateCode = profile.template.codeIdentifier;
  const accentColor = profile.template.accentColor ?? undefined;

  return (
    <Suspense fallback={<QRLoadingSkeleton />}>
      {/* QR scan entry badge — subtle floating indicator */}
      <QRScanBadge slug={slug} accentColor={accentColor} />

      {/* Full template render — exactly the same as /[slug] */}
      {categorySlug === "digital-name-card" && (
        <DigitalCardSwitch templateCode={templateCode} data={parsedData as ReturnType<typeof parseTemplateData<"digital-name-card">>} accentColor={accentColor} />
      )}
      {categorySlug === "portfolio" && (
        <PortfolioSwitch templateCode={templateCode} data={parsedData as ReturnType<typeof parseTemplateData<"portfolio">>} accentColor={accentColor} />
      )}
      {categorySlug === "business-ad" && (
        <BusinessSwitch templateCode={templateCode} data={parsedData as ReturnType<typeof parseTemplateData<"business-ad">>} accentColor={accentColor} />
      )}
      {categorySlug === "wedding-invitation" && (
        <WeddingSwitch templateCode={templateCode} data={parsedData as ReturnType<typeof parseTemplateData<"wedding-invitation">>} accentColor={accentColor} />
      )}
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SWITCH COMPONENTS (identical to /[slug]/page.tsx)
// ─────────────────────────────────────────────────────────────────────────────

function DigitalCardSwitch({ templateCode, data, accentColor }: { templateCode: string; data: ReturnType<typeof parseTemplateData<"digital-name-card">>; accentColor?: string }) {
  const p = { data, accentColor };
  switch (templateCode) {
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.AURORA:    return <AuroraNameCard {...p} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.OBSIDIAN:  return <ObsidianNameCard {...p} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.PRISM:     return <PrismNameCard {...p} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.CORAL:     return <CoralNameCard {...p} />;
    case TEMPLATE_IDS.DIGITAL_NAME_CARD.TITANIUM:  return <TitaniumNameCard {...p} />;
    default:                                        return <AuroraNameCard {...p} />;
  }
}

function PortfolioSwitch({ templateCode, data, accentColor }: { templateCode: string; data: ReturnType<typeof parseTemplateData<"portfolio">>; accentColor?: string }) {
  const p = { data, accentColor };
  switch (templateCode) {
    case TEMPLATE_IDS.PORTFOLIO.CANVAS:    return <CanvasPortfolio {...p} />;
    case TEMPLATE_IDS.PORTFOLIO.STUDIO:    return <StudioPortfolio {...p} />;
    case TEMPLATE_IDS.PORTFOLIO.FORGE:     return <ForgePortfolio {...p} />;
    case TEMPLATE_IDS.PORTFOLIO.SPECTRUM:  return <SpectrumPortfolio {...p} />;
    case TEMPLATE_IDS.PORTFOLIO.BLUEPRINT: return <BlueprintPortfolio {...p} />;
    default:                               return <CanvasPortfolio {...p} />;
  }
}

function BusinessSwitch({ templateCode, data, accentColor }: { templateCode: string; data: ReturnType<typeof parseTemplateData<"business-ad">>; accentColor?: string }) {
  const p = { data, accentColor };
  switch (templateCode) {
    case TEMPLATE_IDS.BUSINESS_AD.MARQUEE:  return <MarqueeBusiness {...p} />;
    case TEMPLATE_IDS.BUSINESS_AD.DISTRICT: return <DistrictBusiness {...p} />;
    case TEMPLATE_IDS.BUSINESS_AD.EMPIRE:   return <EmpireBusiness {...p} />;
    case TEMPLATE_IDS.BUSINESS_AD.NEON:     return <NeonBusiness {...p} />;
    case TEMPLATE_IDS.BUSINESS_AD.VAULT:    return <VaultBusiness {...p} />;
    default:                                return <MarqueeBusiness {...p} />;
  }
}

function WeddingSwitch({ templateCode, data, accentColor }: { templateCode: string; data: ReturnType<typeof parseTemplateData<"wedding-invitation">>; accentColor?: string }) {
  const p = { data, accentColor };
  switch (templateCode) {
    case TEMPLATE_IDS.WEDDING.ETERNAL:    return <EternalWedding {...p} />;
    case TEMPLATE_IDS.WEDDING.BLOSSOM:    return <BlossomWedding {...p} />;
    case TEMPLATE_IDS.WEDDING.NOIR:       return <NoirWedding {...p} />;
    case TEMPLATE_IDS.WEDDING.CELESTIAL:  return <CelestialWedding {...p} />;
    case TEMPLATE_IDS.WEDDING.RUSTIC:     return <RusticWedding {...p} />;
    default:                              return <EternalWedding {...p} />;
  }
}

function QRLoadingSkeleton() {
  return (
    <div className="min-h-screen w-full animate-pulse bg-neutral-950 flex flex-col items-center justify-center gap-5 px-4">
      <div className="h-28 w-28 rounded-2xl bg-neutral-800" />
      <div className="h-7 w-52 rounded-xl bg-neutral-800" />
      <div className="h-4 w-36 rounded-lg bg-neutral-800/70" />
    </div>
  );
}