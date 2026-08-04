"use client";

import dynamic from "next/dynamic";
import type { BusinessAdData } from "@/lib/validators/template-schemas";

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

const SAMPLE_NAME_CARD_DATA = {
  fullName: "Alex Rivera",
  jobTitle: "Senior Product Designer",
  company: "Horizon Labs",
  tagline: "Designing systems that scale. Shipping products that matter.",
  bio: "I help early-stage startups translate complex ideas into intuitive, beautiful products. 8 years in product design across fintech, healthtech, and SaaS.",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
  contacts: [
    { type: "email" as const, value: "alex@horizonlabs.io", label: "Work Email", isPrimary: true },
    { type: "phone" as const, value: "+1 (555) 012-3456", label: "Mobile" },
    { type: "website" as const, value: "https://alexrivera.design", label: "Portfolio" },
  ],
  socialLinks: [
    { platform: "linkedin" as const, url: "https://linkedin.com/in/alexrivera", label: "LinkedIn" },
    { platform: "github" as const, url: "https://github.com/alexrivera", label: "GitHub" },
    { platform: "twitter" as const, url: "https://twitter.com/alexrivera", label: "Twitter" },
  ],
  skills: [
    { name: "Figma", level: 95 },
    { name: "UX Research", level: 88 },
    { name: "Design Systems", level: 92 },
    { name: "React", level: 72 },
    { name: "Prototyping", level: 90 },
  ],
  featuredQuote: "Great design is invisible — it removes friction and creates delight without asking for attention.",
  accentColor: "#6366f1",
};

const SAMPLE_PORTFOLIO_DATA = {
  fullName: "Sam Chen",
  headline: "Full-Stack Engineer & Open Source Contributor",
  bio: "I build scalable web applications and love contributing to open source. Currently focused on TypeScript, React, and distributed systems.",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  resumeUrl: "https://example.com/resume.pdf",
  contacts: [
    { type: "email" as const, value: "sam@example.com", label: "Email" },
  ],
  socialLinks: [
    { platform: "github" as const, url: "https://github.com/samchen", label: "GitHub" },
    { platform: "linkedin" as const, url: "https://linkedin.com/in/samchen", label: "LinkedIn" },
  ],
  projects: [
    {
      id: "proj-1",
      title: "OpenMetrics Dashboard",
      description: "A real-time analytics platform built with Next.js, Prisma, and PostgreSQL. Handles 10M+ events/day.",
      tags: ["Next.js", "TypeScript", "PostgreSQL"],
      coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      liveUrl: "https://openmetrics.dev",
      repoUrl: "https://github.com/samchen/openmetrics",
      featured: true,
    },
    {
      id: "proj-2",
      title: "CLI Toolkit",
      description: "A zero-dependency CLI toolkit for scaffolding TypeScript projects with best practices baked in.",
      tags: ["Node.js", "TypeScript", "CLI"],
      coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
      repoUrl: "https://github.com/samchen/cli-toolkit",
      featured: false,
    },
  ],
  experience: [
    {
      company: "Stripe",
      role: "Senior Software Engineer",
      startDate: "2022-03",
      description: "Built payment infrastructure processing billions in transactions. Led migration to edge-first architecture.",
      location: "Remote",
    },
    {
      company: "Vercel",
      role: "Software Engineer",
      startDate: "2020-06",
      endDate: "2022-02",
      description: "Worked on Next.js core team. Shipped ISR, Edge Middleware, and Image Optimization features.",
      location: "San Francisco, CA",
    },
  ],
  skills: [
    { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { category: "Backend", items: ["Node.js", "Go", "PostgreSQL", "Redis"] },
    { category: "DevOps", items: ["Docker", "Kubernetes", "AWS", "Vercel"] },
  ],
  availability: "available" as const,
  availabilityNote: "Open to full-time & contract work",
};

const SAMPLE_BUSINESS_DATA = {
  businessName: "Apex Creative Studio",
  tagline: "We craft digital experiences that convert.",
  description: "A boutique design and development agency specializing in high-performance websites, brand identities, and digital marketing campaigns for ambitious startups and scale-ups.",
  heroImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
  contacts: [
    { type: "email" as const, value: "hello@apexcreative.io", label: "Email" },
    { type: "phone" as const, value: "+60 11-1234 5678", label: "WhatsApp" },
    { type: "address" as const, value: "Level 18, Menara Prestige, KLCC, Kuala Lumpur", label: "Office" },
  ],
  socialLinks: [
    { platform: "instagram" as const, url: "https://instagram.com/apexcreative", label: "Instagram" },
    { platform: "linkedin" as const, url: "https://linkedin.com/company/apexcreative", label: "LinkedIn" },
  ],
  services: [
    { title: "Brand Identity", description: "Full brand system — logo, typography, color, guidelines.", price: "From $2,500", highlighted: false, features: ["Logo design", "Brand guidelines", "Asset library"] },
    { title: "Web Design & Dev", description: "Fast, beautiful, conversion-optimised websites.", price: "From $5,000", highlighted: true, features: ["Custom design", "Next.js development", "CMS integration", "3-month support"] },
    { title: "Growth Marketing", description: "SEO, paid ads, and conversion rate optimisation.", price: "From $1,200/mo", highlighted: false, features: ["SEO audit", "Google Ads", "Analytics setup"] },
  ],
  testimonials: [
    { author: "Reza Mahmoud", rating: 5, text: "Apex completely transformed our online presence. Our leads tripled within 2 months of launching the new site.", platform: "Google" },
    { author: "Lisa Tan", rating: 5, text: "The team is incredibly talented and communicative. They delivered ahead of schedule and the quality was exceptional.", platform: "Clutch" },
  ],
  businessHours: [
    { day: "Monday" as const, open: "09:00", close: "18:00" },
    { day: "Tuesday" as const, open: "09:00", close: "18:00" },
    { day: "Wednesday" as const, open: "09:00", close: "18:00" },
    { day: "Thursday" as const, open: "09:00", close: "18:00" },
    { day: "Friday" as const, open: "09:00", close: "17:00" },
    { day: "Saturday" as const, open: "10:00", close: "14:00" },
    { day: "Sunday" as const, open: "10:00", close: "14:00", isClosed: true },
  ],
  primaryCtaLabel: "Get a Free Quote",
  primaryCtaUrl: "mailto:hello@apexcreative.io",
  industry: "Creative Agency",
  founded: 2019,
};

const SAMPLE_WEDDING_DATA = {
  partner1: {
    name: "Aryan",
    nickname: "Ari",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Software engineer by day, amateur chef by night. Loves hiking and bad puns.",
  },
  partner2: {
    name: "Priya",
    nickname: "Pri",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    bio: "Architect and design enthusiast. Passionate about sustainability and good coffee.",
  },
  weddingDate: "2025-11-15T14:00:00+08:00",
  headline: "Two hearts, one beautiful story",
  coupleMessage: "We can't wait to celebrate the start of our forever with the people we love most. Thank you for being part of our journey.",
  loveHistory: [
    { date: "March 2019", title: "The First Hello", story: "We met at a mutual friend's rooftop gathering in Bangsar. Ari spilled his drink on Priya's shoes. It was not impressive.", emoji: "☕", location: "Bangsar, KL" },
    { date: "June 2019", title: "First Date", story: "Ari made up for the spilled drink with a surprise sunset picnic at Titiwangsa Lake. It became our spot.", emoji: "🌅", location: "Titiwangsa, KL" },
    { date: "December 2021", title: "The Proposal", story: "Under the stars at Batu Ferringhi beach during a weekend getaway, Ari got down on one knee. Priya said yes before he finished the question.", emoji: "💍", location: "Penang" },
    { date: "November 2025", title: "Forever Begins", story: "Surrounded by our families and closest friends, we say I do.", emoji: "🎊" },
  ],
  events: [
    { name: "Nikah Ceremony", date: "2025-11-15T10:00:00+08:00", venue: "Masjid Negara", address: "Jalan Lembah Perdana, 50480 Kuala Lumpur", dressCode: "Traditional / Smart Formal", googleMapsUrl: "https://maps.google.com" },
    { name: "Wedding Reception", date: "2025-11-15T18:00:00+08:00", venue: "The Majestic Hotel Kuala Lumpur", address: "5, Jalan Sultan Hishamuddin, 50000 Kuala Lumpur", dressCode: "Baju Melayu / Kebaya / Formal", googleMapsUrl: "https://maps.google.com", notes: "Valet parking available. Dietary options available — please indicate in RSVP." },
  ],
  gallery: [
    { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", alt: "Couple photo 1" },
    { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80", alt: "Couple photo 2" },
    { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80", alt: "Couple photo 3" },
    { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80", alt: "Couple photo 4" },
    { url: "https://images.unsplash.com/photo-1583939411023-c2e4cfcf8ef7?w=600&q=80", alt: "Couple photo 5" },
    { url: "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=600&q=80", alt: "Couple photo 6" },
  ],
  rsvp: {
    deadline: "2025-10-31T23:59:00+08:00",
    formUrl: "https://forms.google.com/example",
    contactEmail: "rsvp@aryanandpriya.com",
    contactPhone: "+60 12-345 6789",
    note: "Please RSVP by 31 October 2025. Kindly indicate any dietary requirements or allergies.",
    maxGuestsPerInvite: 2,
  },
  hashtag: "AryanAndPriya2025",
  songTitle: "Can't Help Falling in Love",
  songArtist: "Elvis Presley",
  allowWishes: true,
  wishesTitle: "Leave Us a Wish",
  colorPalette: ["#fdf8f0", "#c9a96e", "#7a5c3a"],
};

export function PreviewRenderer({
  codeIdentifier,
  accentColor,
}: {
  codeIdentifier: string;
  accentColor: string | null;
}) {
  const accent = accentColor ?? "#6366f1";

  switch (codeIdentifier) {
    case "digital-card-aurora":   return <AuroraNameCard   data={SAMPLE_NAME_CARD_DATA} accentColor={accent} />;
    case "digital-card-obsidian": return <ObsidianNameCard data={SAMPLE_NAME_CARD_DATA} accentColor={accent} />;
    case "digital-card-prism":    return <PrismNameCard    data={SAMPLE_NAME_CARD_DATA} accentColor={accent} />;
    case "digital-card-coral":    return <CoralNameCard    data={SAMPLE_NAME_CARD_DATA} accentColor={accent} />;
    case "digital-card-titanium": return <TitaniumNameCard data={SAMPLE_NAME_CARD_DATA} accentColor={accent} />;
    case "portfolio-canvas":      return <CanvasPortfolio   data={SAMPLE_PORTFOLIO_DATA} accentColor={accent} />;
    case "portfolio-studio":      return <StudioPortfolio   data={SAMPLE_PORTFOLIO_DATA} accentColor={accent} />;
    case "portfolio-forge":       return <ForgePortfolio    data={SAMPLE_PORTFOLIO_DATA} accentColor={accent} />;
    case "portfolio-spectrum":    return <SpectrumPortfolio data={SAMPLE_PORTFOLIO_DATA} accentColor={accent} />;
    case "portfolio-blueprint":   return <BlueprintPortfolio data={SAMPLE_PORTFOLIO_DATA} accentColor={accent} />;
    case "business-marquee":      return <MarqueeBusiness  data={SAMPLE_BUSINESS_DATA as BusinessAdData} accentColor={accent} />;
    case "business-district":     return <DistrictBusiness data={SAMPLE_BUSINESS_DATA as BusinessAdData} accentColor={accent} />;
    case "business-empire":       return <EmpireBusiness   data={SAMPLE_BUSINESS_DATA as BusinessAdData} accentColor={accent} />;
    case "business-neon":         return <NeonBusiness     data={SAMPLE_BUSINESS_DATA as BusinessAdData} accentColor={accent} />;
    case "business-vault":        return <VaultBusiness    data={SAMPLE_BUSINESS_DATA as BusinessAdData} accentColor={accent} />;
    case "wedding-eternal":       return <EternalWedding   data={SAMPLE_WEDDING_DATA} accentColor={accent} />;
    case "wedding-blossom":       return <BlossomWedding   data={SAMPLE_WEDDING_DATA} accentColor={accent} />;
    case "wedding-noir":          return <NoirWedding      data={SAMPLE_WEDDING_DATA} accentColor={accent} />;
    case "wedding-celestial":     return <CelestialWedding data={SAMPLE_WEDDING_DATA} accentColor={accent} />;
    case "wedding-rustic":        return <RusticWedding    data={SAMPLE_WEDDING_DATA} accentColor={accent} />;
    default: return <div className="flex items-center justify-center min-h-screen text-neutral-500">Template not found</div>;
  }
}
