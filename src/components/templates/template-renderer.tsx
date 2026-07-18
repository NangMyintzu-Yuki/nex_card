// src/components/templates/template-renderer.tsx
// Shared template switching engine with dynamic imports for code splitting.
// Only the selected template's JS/CSS is loaded per request.

import dynamic from "next/dynamic";
import { TEMPLATE_IDS } from "@/types/templates";
import type { CategorySlug } from "@/lib/validators/template-schemas";
import {
  safeParseTemplateData,
  type DigitalNameCardData,
  type PortfolioData,
  type BusinessAdData,
  type WeddingInvitationData,
} from "@/lib/validators/template-schemas";

const DEFAULTS: Record<CategorySlug, Record<string, unknown>> = {
  "digital-name-card": { fullName: "", jobTitle: "", company: "", contacts: [], socialLinks: [] },
  "portfolio": { fullName: "", headline: "", bio: "", contacts: [], socialLinks: [], projects: [], experience: [] },
  "business-ad": { businessName: "", tagline: "", description: "", contacts: [], socialLinks: [], services: [] },
  "wedding-invitation": { partner1: { name: "" }, partner2: { name: "" }, weddingDate: "", events: [], loveHistory: [], gallery: [] },
};

function getDefaultData(categorySlug: CategorySlug, rawJson: unknown) {
  const data = (typeof rawJson === "object" && rawJson !== null ? rawJson : {}) as Record<string, unknown>;
  return { ...DEFAULTS[categorySlug], ...data };
}

const AuroraNameCard = dynamic(() =>
  import("@/components/templates/digital-name-card/aurora").then((m) => ({
    default: m.AuroraNameCard,
  }))
);
const ObsidianNameCard = dynamic(() =>
  import("@/components/templates/digital-name-card/obsidian").then((m) => ({
    default: m.ObsidianNameCard,
  }))
);
const PrismNameCard = dynamic(() =>
  import("@/components/templates/digital-name-card/prism").then((m) => ({
    default: m.PrismNameCard,
  }))
);
const CoralNameCard = dynamic(() =>
  import("@/components/templates/digital-name-card/coral").then((m) => ({
    default: m.CoralNameCard,
  }))
);
const TitaniumNameCard = dynamic(() =>
  import("@/components/templates/digital-name-card/titanium").then((m) => ({
    default: m.TitaniumNameCard,
  }))
);

const CanvasPortfolio = dynamic(() =>
  import("@/components/templates/portfolio/canvas").then((m) => ({
    default: m.CanvasPortfolio,
  }))
);
const StudioPortfolio = dynamic(() =>
  import("@/components/templates/portfolio/studio").then((m) => ({
    default: m.StudioPortfolio,
  }))
);
const ForgePortfolio = dynamic(() =>
  import("@/components/templates/portfolio/forge").then((m) => ({
    default: m.ForgePortfolio,
  }))
);
const SpectrumPortfolio = dynamic(() =>
  import("@/components/templates/portfolio/spectrum").then((m) => ({
    default: m.SpectrumPortfolio,
  }))
);
const BlueprintPortfolio = dynamic(() =>
  import("@/components/templates/portfolio/blueprint").then((m) => ({
    default: m.BlueprintPortfolio,
  }))
);

const MarqueeBusiness = dynamic(() =>
  import("@/components/templates/business-ad/marquee").then((m) => ({
    default: m.MarqueeBusiness,
  }))
);
const DistrictBusiness = dynamic(() =>
  import("@/components/templates/business-ad/district").then((m) => ({
    default: m.DistrictBusiness,
  }))
);
const EmpireBusiness = dynamic(() =>
  import("@/components/templates/business-ad/empire").then((m) => ({
    default: m.EmpireBusiness,
  }))
);
const NeonBusiness = dynamic(() =>
  import("@/components/templates/business-ad/neon").then((m) => ({
    default: m.NeonBusiness,
  }))
);
const VaultBusiness = dynamic(() =>
  import("@/components/templates/business-ad/vault").then((m) => ({
    default: m.VaultBusiness,
  }))
);

const EternalWedding = dynamic(() =>
  import("@/components/templates/wedding/eternal").then((m) => ({
    default: m.EternalWedding,
  }))
);
const BlossomWedding = dynamic(() =>
  import("@/components/templates/wedding/blossom").then((m) => ({
    default: m.BlossomWedding,
  }))
);
const NoirWedding = dynamic(() =>
  import("@/components/templates/wedding/noir").then((m) => ({
    default: m.NoirWedding,
  }))
);
const CelestialWedding = dynamic(() =>
  import("@/components/templates/wedding/celestial").then((m) => ({
    default: m.CelestialWedding,
  }))
);
const RusticWedding = dynamic(() =>
  import("@/components/templates/wedding/rustic").then((m) => ({
    default: m.RusticWedding,
  }))
);

export interface TemplateRendererProps {
  categorySlug: CategorySlug;
  templateCode: string;
  dynamicJsonData: unknown;
  accentColor?: string | null;
}

export function TemplateRenderer({
  categorySlug,
  templateCode,
  dynamicJsonData,
  accentColor,
}: TemplateRendererProps) {
  const accent = accentColor ?? undefined;

  // Use safeParse to avoid crashes on missing/invalid fields
  const result = safeParseTemplateData(categorySlug, dynamicJsonData);
  const parsedData = result.success
    ? result.data
    : getDefaultData(categorySlug, dynamicJsonData);

  switch (categorySlug) {
    case "digital-name-card":
      return (
        <DigitalNameCardSwitch
          templateCode={templateCode}
          data={parsedData as any}
          accentColor={accent}
        />
      );
    case "portfolio":
      return (
        <PortfolioSwitch
          templateCode={templateCode}
          data={parsedData as any}
          accentColor={accent}
        />
      );
    case "business-ad":
      return (
        <BusinessAdSwitch
          templateCode={templateCode}
          data={parsedData as any}
          accentColor={accent}
        />
      );
    case "wedding-invitation":
      return (
        <WeddingSwitch
          templateCode={templateCode}
          data={parsedData as any}
          accentColor={accent}
        />
      );
    default:
      return null;
  }
}

interface SwitchProps<T> {
  templateCode: string;
  data: T;
  accentColor?: string;
}

function DigitalNameCardSwitch({
  templateCode,
  data,
  accentColor,
}: SwitchProps<DigitalNameCardData>) {
  const props = { data, accentColor };

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
}: SwitchProps<PortfolioData>) {
  const props = { data, accentColor };

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
}: SwitchProps<BusinessAdData>) {
  // Business templates use slightly different prop shapes — cast at boundary
  const props = { data, accentColor };

  switch (templateCode) {
    case TEMPLATE_IDS.BUSINESS_AD.MARQUEE:
      return <MarqueeBusiness {...(props as any)} />;
    case TEMPLATE_IDS.BUSINESS_AD.DISTRICT:
      return <DistrictBusiness {...(props as any)} />;
    case TEMPLATE_IDS.BUSINESS_AD.EMPIRE:
      return <EmpireBusiness {...(props as any)} />;
    case TEMPLATE_IDS.BUSINESS_AD.NEON:
      return <NeonBusiness {...(props as any)} />;
    case TEMPLATE_IDS.BUSINESS_AD.VAULT:
      return <VaultBusiness {...(props as any)} />;
    default:
      return <MarqueeBusiness {...(props as any)} />;
  }
}

function WeddingSwitch({
  templateCode,
  data,
  accentColor,
}: SwitchProps<WeddingInvitationData>) {
  const props = { data, accentColor };

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
