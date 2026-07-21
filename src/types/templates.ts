// src/types/templates.ts
// Exhaustive type system for all template dynamic JSON data shapes

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

export interface SocialLink {
  platform: "linkedin" | "github" | "twitter" | "instagram" | "facebook" | "youtube" | "tiktok" | "website" | "whatsapp" | "telegram";
  url: string;
  label?: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface ContactField {
  type: "email" | "phone" | "address" | "website";
  value: string;
  label?: string;
  isPrimary?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY: DIGITAL NAME CARD
// 5 Templates: aurora, obsidian, prism, coral, titanium
// ─────────────────────────────────────────────────────────────────────────────

export interface DigitalNameCardData {
  // Core identity
  fullName: string;
  pronouns?: string;
  jobTitle: string;
  company: string;
  companyLogoUrl?: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;

  // Contact
  contacts: ContactField[];

  // Social
  socialLinks: SocialLink[];

  // Skills (for prism / titanium templates)
  skills?: Array<{
    name: string;
    level?: number; // 1–100
    category?: string;
  }>;

  // Testimonial / quote (obsidian, coral)
  featuredQuote?: string;

  // Theme overrides (user-configurable per template)
  accentColor?: string;
  backgroundStyle?: "gradient" | "solid" | "mesh" | "noise";
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY: PORTFOLIO
// 5 Templates: canvas, studio, forge, spectrum, blueprint
// ─────────────────────────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverImageUrl: string;
  liveUrl?: string;
  repoUrl?: string;
  year?: number;
  featured?: boolean;
}

export interface PortfolioExperience {
  company: string;
  role: string;
  startDate: string; // ISO date string
  endDate?: string;  // null = present
  description: string;
  logoUrl?: string;
  location?: string;
}

export interface PortfolioData {
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  resumeUrl?: string;

  // Contact & social
  contacts: ContactField[];
  socialLinks: SocialLink[];

  // Portfolio content
  projects: PortfolioProject[];
  experience: PortfolioExperience[];

  skills: Array<{
    category: string;
    items: string[];
  }>;

  services?: Array<{
    title: string;
    description: string;
    iconName?: string;
  }>;

  // Gallery (for studio / spectrum templates)
  gallery?: GalleryImage[];

  // Testimonials
  testimonials?: Array<{
    author: string;
    role: string;
    company: string;
    text: string;
    avatarUrl?: string;
  }>;

  availability?: "available" | "limited" | "unavailable";
  availabilityNote?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY: BUSINESS ADVERTISEMENT
// 5 Templates: marquee, district, empire, neon, vault
// ─────────────────────────────────────────────────────────────────────────────

export interface BusinessService {
  title: string;
  description: string;
  price?: string;
  priceNote?: string;
  iconName?: string;
  features?: string[];
  highlighted?: boolean;
}

export interface BusinessHours {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  open: string;  // "09:00"
  close: string; // "18:00"
  isClosed?: boolean;
}

export interface BusinessAdData {
  businessName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  heroImageUrl?: string;

  // Contact & location
  contacts: ContactField[];
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    googleMapsUrl?: string;
    coordinates?: { lat: number; lng: number };
  };

  socialLinks: SocialLink[];

  // Business details
  industry?: string;
  founded?: number;
  employeeCount?: string; // "1-10", "11-50", etc.
  certifications?: string[];

  // Services / products
  services: BusinessService[];

  // Gallery
  gallery?: GalleryImage[];

  // Hours
  businessHours?: BusinessHours[];

  // Testimonials / reviews
  testimonials?: Array<{
    author: string;
    rating: number; // 1-5
    text: string;
    date?: string;
    platform?: string;
    avatarUrl?: string;
  }>;

  // FAQ (vault, district templates)
  faq?: Array<{
    question: string;
    answer: string;
  }>;

  // CTA
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY: WEDDING INVITATION
// 5 Templates: eternal, blossom, noir, celestial, rustic
// ─────────────────────────────────────────────────────────────────────────────

export interface LoveHistoryMilestone {
  date: string;        // ISO date or "Spring 2019"
  title: string;
  story: string;
  imageUrl?: string;
  location?: string;
  emoji?: string;
}

export interface WeddingEvent {
  name: string;        // "Ceremony", "Reception", "After Party"
  date: string;        // ISO datetime
  venue: string;
  address: string;
  dressCode?: string;
  googleMapsUrl?: string;
  notes?: string;
}

export interface WeddingInvitationData {
  // The couple
  partner1: {
    name: string;
    nickname?: string;
    photoUrl?: string;
    bio?: string;
    instagramUrl?: string;
  };
  partner2: {
    name: string;
    nickname?: string;
    photoUrl?: string;
    bio?: string;
    instagramUrl?: string;
  };

  // Core info
  weddingDate: string;  // ISO datetime
  headline?: string;    // "Together at last" etc.
  coupleMessage?: string;

  // Love story timeline
  loveHistory: LoveHistoryMilestone[];

  // Events
  events: WeddingEvent[];

  // Gallery
  gallery: GalleryImage[];

  // RSVP
  rsvp?: {
    deadline?: string;
    formUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    maxGuestsPerInvite?: number;
    note?: string;
  };

  // Details
  hashtag?: string;
  dressCodes?: Array<{ event: string; code: string; colorPalette?: string[] }>;
  giftRegistry?: Array<{ store: string; url: string }>;

  // Wishes / guestbook
  allowWishes?: boolean;
  wishesTitle?: string;

  // Music
  songTitle?: string;
  songArtist?: string;
  spotifyUrl?: string;

  // Design
  colorPalette?: string[];  // Array of hex colors for template theming
  flowerTheme?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCRIMINATED UNION — The master type
// ─────────────────────────────────────────────────────────────────────────────

export type TemplateDynamicData =
  | { categorySlug: "digital-name-card"; data: DigitalNameCardData }
  | { categorySlug: "portfolio"; data: PortfolioData }
  | { categorySlug: "business-ad"; data: BusinessAdData }
  | { categorySlug: "wedding-invitation"; data: WeddingInvitationData };

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE CODE IDENTIFIERS (exact strings stored in DB)
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATE_IDS = {
  DIGITAL_NAME_CARD: {
    AURORA: "digital-card-aurora",
    OBSIDIAN: "digital-card-obsidian",
    PRISM: "digital-card-prism",
    CORAL: "digital-card-coral",
    TITANIUM: "digital-card-titanium",
  },
  PORTFOLIO: {
    CANVAS: "portfolio-canvas",
    STUDIO: "portfolio-studio",
    FORGE: "portfolio-forge",
    SPECTRUM: "portfolio-spectrum",
    BLUEPRINT: "portfolio-blueprint",
  },
  BUSINESS_AD: {
    MARQUEE: "business-marquee",
    DISTRICT: "business-district",
    EMPIRE: "business-empire",
    NEON: "business-neon",
    VAULT: "business-vault",
  },
  WEDDING: {
    ETERNAL: "wedding-eternal",
    BLOSSOM: "wedding-blossom",
    NOIR: "wedding-noir",
    CELESTIAL: "wedding-celestial",
    RUSTIC: "wedding-rustic",
  },
} as const;

export type TemplateCodeIdentifier =
  | (typeof TEMPLATE_IDS.DIGITAL_NAME_CARD)[keyof typeof TEMPLATE_IDS.DIGITAL_NAME_CARD]
  | (typeof TEMPLATE_IDS.PORTFOLIO)[keyof typeof TEMPLATE_IDS.PORTFOLIO]
  | (typeof TEMPLATE_IDS.BUSINESS_AD)[keyof typeof TEMPLATE_IDS.BUSINESS_AD]
  | (typeof TEMPLATE_IDS.WEDDING)[keyof typeof TEMPLATE_IDS.WEDDING];

// ─────────────────────────────────────────────────────────────────────────────
// ENRICHED PROFILE TYPE (DB join result — used in rendering)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResolvedProfile {
  id: string;
  slug: string;
  isPublished: boolean;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  templateLocked: boolean;
  qrLocked: boolean;
  dynamicJsonData: unknown;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  template: {
    id: string;
    codeIdentifier: string;
    name: string;
    thumbnailUrl: string;
    accentColor: string | null;
  };
}
