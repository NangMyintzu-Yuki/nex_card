// src/lib/validators/template-schemas.ts
// Zod runtime validators — parse untrusted DB JSON safely at the edge

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const SocialLinkSchema = z.object({
  platform: z.enum([
    "linkedin", "github", "twitter", "instagram", "facebook",
    "youtube", "tiktok", "website", "whatsapp", "telegram",
    "viber", "snapchat", "discord", "twitch", "pinterest",
    "behance", "dribbble", "medium", "devto", "stackoverflow",
  ]),
  // Preprocess: auto-add https:// if missing so bare URLs like "linkedin.com/in/alex" pass
  url: z.preprocess(
    (val) => {
      if (typeof val !== "string" || val.trim() === "") return val;
      const v = val.trim();
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      return `https://${v}`;
    },
    z.string().url("Must be a valid URL (e.g. https://linkedin.com/in/yourname)")
  ),
  label: z.string().optional(),
});

const GalleryImageSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
});

const ContactFieldSchema = z.object({
  type: z.enum(["email", "phone", "address", "website", "whatsapp", "viber", "telegram", "skype"]),
  // Allow values like "example.com" without https://
  value: z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;
      return val.trim();
    },
    z.string().min(1)
  ),
  label: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// DIGITAL NAME CARD SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const DigitalNameCardSchema = z.object({
  fullName: z.string().min(1).max(120),
  jobTitle: z.string().min(1).max(120),
  company: z.string().min(1).max(120),
  companyLogoUrl: z.string().url().optional().or(z.literal("")),
  tagline: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  contacts: z.array(ContactFieldSchema).min(0).max(8),
  socialLinks: z.array(SocialLinkSchema).min(0).max(12),
  skills: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        level: z.number().min(1).max(100).optional(),
        category: z.string().max(60).optional(),
      })
    )
    .max(20)
    .optional(),
  featuredQuote: z.string().max(300).optional(),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
  backgroundStyle: z
    .enum(["gradient", "solid", "mesh", "noise"])
    .optional(),
});

export type DigitalNameCardData = z.infer<typeof DigitalNameCardSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const PortfolioProjectSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(120),
  description: z.string().max(600),
  tags: z.array(z.string().max(30)).max(8),
  coverImageUrl: z.string().url(),
  liveUrl: z.preprocess((v) => { if (typeof v !== "string" || v.trim() === "") return ""; const s = v.trim(); return s.startsWith("http") ? s : `https://${s}`; }, z.string().url().optional().or(z.literal(""))),
  repoUrl: z.preprocess((v) => { if (typeof v !== "string" || v.trim() === "") return ""; const s = v.trim(); return s.startsWith("http") ? s : `https://${s}`; }, z.string().url().optional().or(z.literal(""))),
  year: z.number().int().min(1990).max(2100).optional(),
  caseStudyUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().optional(),
});

const PortfolioExperienceSchema = z.object({
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}$/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}$/)).optional(),
  description: z.string().max(800),
  logoUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
});

export const PortfolioSchema = z.object({
  fullName: z.string().min(1).max(120),
  headline: z.string().min(1).max(200),
  bio: z.string().max(2000),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  contacts: z.array(ContactFieldSchema).max(6),
  socialLinks: z.array(SocialLinkSchema).max(12),
  projects: z.array(PortfolioProjectSchema).max(30),
  experience: z.array(PortfolioExperienceSchema).max(20),
  skills: z.array(
    z.object({
      category: z.string().min(1).max(60),
      items: z.array(z.string().max(40)).max(20),
    })
  ).max(10),
  services: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        description: z.string().max(300),
        iconName: z.string().max(40).optional(),
      })
    )
    .max(8)
    .optional(),
  gallery: z.array(GalleryImageSchema).max(20).optional(),
  testimonials: z
    .array(
      z.object({
        author: z.string().min(1).max(80),
        role: z.string().max(80),
        company: z.string().max(80),
        text: z.string().max(600),
        avatarUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .max(10)
    .optional(),
  availability: z.enum(["available", "limited", "unavailable"]).optional(),
  availabilityNote: z.string().max(200).optional(),
});

export type PortfolioData = z.infer<typeof PortfolioSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS ADVERTISEMENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const BusinessServiceSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(400),
  price: z.string().max(40).optional(),
  priceNote: z.string().max(100).optional(),
  iconName: z.string().max(40).optional(),
  features: z.array(z.string().max(100)).max(10).optional(),
  highlighted: z.boolean().optional(),
});

const BusinessHoursSchema = z.object({
  day: z.enum(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]),
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean().optional(),
});

export const BusinessAdSchema = z.object({
  businessName: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  description: z.string().max(2000),
  logoUrl: z.string().url().optional().or(z.literal("")),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  contacts: z.array(ContactFieldSchema).max(8),
  address: z
    .object({
      street: z.string().max(200),
      city: z.string().max(100),
      zip: z.string().max(100),
      state: z.string().max(100),
      postalCode: z.string().max(20),
      country: z.string().max(100),
      googleMapsUrl: z.string().url().optional().or(z.literal("")),
      coordinates: z
        .object({ lat: z.number(), lng: z.number() })
        .optional(),
    })
    .optional(),
  socialLinks: z.array(SocialLinkSchema).max(12),
  industry: z.string().max(80).optional(),
  founded: z.number().int().min(1800).max(2100).optional(),
  employeeCount: z.string().max(20).optional(),
  certifications: z.array(z.string().max(100)).max(10).optional(),
  services: z.array(BusinessServiceSchema).min(1).max(20),
  gallery: z.array(GalleryImageSchema).max(24).optional(),
  businessHours: z.array(BusinessHoursSchema).max(7).optional(),
  testimonials: z
    .array(
      z.object({
        author: z.string().max(80),
        rating: z.number().min(1).max(5),
        text: z.string().max(600),
        date: z.string().optional(),
        platform: z.string().max(40).optional(),
        avatarUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .max(12)
    .optional(),
  faq: z
    .array(
      z.object({
        question: z.string().max(200),
        answer: z.string().max(800),
      })
    )
    .max(15)
    .optional(),
  primaryCtaLabel: z.string().min(1).max(60),
  primaryCtaUrl: z.string().url(),
  secondaryCtaLabel: z.string().max(60).optional(),
  secondaryCtaUrl: z.string().url().optional().or(z.literal("")),
  whatWeDo: z.array(
    z.object({
      title: z.string().max(100),
      description: z.string().max(400),
      iconName: z.string().max(10).optional(), // emoji
    })
  ).max(9).optional(),
  history: z.array(
    z.object({
      year: z.union([z.string().max(10), z.number().int()]),
      title: z.string().max(100),
      description: z.string().max(400),
    })
  ).max(20).optional(),
});

export type BusinessAdData = z.infer<typeof BusinessAdSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// WEDDING INVITATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const PartnerSchema = z.object({
  name: z.string().min(1).max(80),
  nickname: z.string().max(40).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(600).optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
});

const LoveHistoryMilestoneSchema = z.object({
  date: z.string().min(1).max(40),
  title: z.string().min(1).max(120),
  story: z.string().min(1).max(800),
  imageUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(120).optional(),
  emoji: z.string().max(4).optional(),
});

const WeddingEventSchema = z.object({
  name: z.string().min(1).max(80),
  date: z.string().datetime({ offset: true }),
  venue: z.string().min(1).max(200),
  address: z.string().min(1).max(400),
  dressCode: z.string().max(100).optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(400).optional(),
});

export const WeddingInvitationSchema = z.object({
  partner1: PartnerSchema,
  partner2: PartnerSchema,
  weddingDate: z.string().datetime({ offset: true }),
  headline: z.string().max(200).optional(),
  coupleMessage: z.string().max(1000).optional(),
  loveHistory: z.array(LoveHistoryMilestoneSchema).min(1).max(20),
  events: z.array(WeddingEventSchema).min(1).max(10),
  gallery: z.array(GalleryImageSchema).max(50),
  rsvp: z
    .object({
      deadline: z.string().datetime({ offset: true }).optional(),
      formUrl: z.string().url().optional().or(z.literal("")),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().max(30).optional(),
      maxGuestsPerInvite: z.number().int().min(1).max(10).optional(),
      note: z.string().max(400).optional(),
    })
    .optional(),
  hashtag: z.string().max(80).optional(),
  dressCodes: z
    .array(
      z.object({
        event: z.string().max(80),
        code: z.string().max(80),
        colorPalette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(6).optional(),
      })
    )
    .max(5)
    .optional(),
  giftRegistry: z
    .array(z.object({ store: z.string().max(80), url: z.string().url() }))
    .max(5)
    .optional(),
  allowWishes: z.boolean().optional(),
  wishesTitle: z.string().max(100).optional(),
  songTitle: z.string().max(120).optional(),
  songArtist: z.string().max(120).optional(),
  spotifyUrl: z.string().url().optional().or(z.literal("")),
  colorPalette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(6).optional(),
  flowerTheme: z.string().max(60).optional(),
});

export type WeddingInvitationData = z.infer<typeof WeddingInvitationSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// MASTER PARSE FUNCTION
// Returns typed data or throws with precise zod errors
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_SCHEMA_MAP = {
  "digital-name-card": DigitalNameCardSchema,
  "portfolio": PortfolioSchema,
  "business-ad": BusinessAdSchema,
  "wedding-invitation": WeddingInvitationSchema,
} as const;

export type CategorySlug = keyof typeof CATEGORY_SCHEMA_MAP;

export function parseTemplateData<T extends CategorySlug>(
  categorySlug: T,
  rawJson: unknown
): z.infer<(typeof CATEGORY_SCHEMA_MAP)[T]> {
  const schema = CATEGORY_SCHEMA_MAP[categorySlug];
  if (!schema) {
    throw new Error(`No schema registered for category slug: "${categorySlug}"`);
  }
  // Parse and throw descriptive ZodError on failure
  return schema.parse(rawJson) as z.infer<(typeof CATEGORY_SCHEMA_MAP)[T]>;
}

export function safeParseTemplateData<T extends CategorySlug>(
  categorySlug: T,
  rawJson: unknown
): { success: true; data: z.infer<(typeof CATEGORY_SCHEMA_MAP)[T]> } | { success: false; error: z.ZodError } {
  const schema = CATEGORY_SCHEMA_MAP[categorySlug];
  const result = schema.safeParse(rawJson);
  if (result.success) {
    return { success: true, data: result.data as z.infer<(typeof CATEGORY_SCHEMA_MAP)[T]> };
  }
  return { success: false, error: result.error };
}