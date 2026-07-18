// src/tests/validators.test.ts
import { describe, it, expect } from "vitest";
import {
  DigitalNameCardSchema,
  PortfolioSchema,
  BusinessAdSchema,
  WeddingInvitationSchema,
  parseTemplateData,
  safeParseTemplateData,
} from "@/lib/validators/template-schemas";

// ─────────────────────────────────────────────────────────────────────────────
// DIGITAL NAME CARD
// ─────────────────────────────────────────────────────────────────────────────

describe("DigitalNameCardSchema", () => {
  const validCard = {
    fullName: "Alex Rivera",
    jobTitle: "Product Designer",
    company: "Horizon Labs",
    contacts: [{ type: "email", value: "alex@test.com" }],
    socialLinks: [{ platform: "linkedin", url: "https://linkedin.com/in/alex" }],
  };

  it("accepts valid name card data", () => {
    const result = DigitalNameCardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = DigitalNameCardSchema.safeParse({ fullName: "Alex" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid accent color hex", () => {
    const result = DigitalNameCardSchema.safeParse({
      ...validCard,
      accentColor: "not-a-hex",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid 3-char hex color", () => {
    const result = DigitalNameCardSchema.safeParse({
      ...validCard,
      accentColor: "#abc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects fullName exceeding 120 chars", () => {
    const result = DigitalNameCardSchema.safeParse({
      ...validCard,
      fullName: "a".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid social platform", () => {
    const result = DigitalNameCardSchema.safeParse({
      ...validCard,
      socialLinks: [{ platform: "myspace", url: "https://myspace.com/alex" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields as undefined", () => {
    const result = DigitalNameCardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bio).toBeUndefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────────────────────────────────────

describe("PortfolioSchema", () => {
  const validPortfolio = {
    fullName: "Alex Rivera",
    headline: "Full-Stack Developer",
    bio: "I build things.",
    contacts: [],
    socialLinks: [],
    projects: [],
    experience: [],
    skills: [],
  };

  it("accepts valid portfolio data", () => {
    expect(PortfolioSchema.safeParse(validPortfolio).success).toBe(true);
  });

  it("rejects missing bio", () => {
    const { bio: _bio, ...rest } = validPortfolio;
    expect(PortfolioSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts availability enum values", () => {
    expect(PortfolioSchema.safeParse({ ...validPortfolio, availability: "available" }).success).toBe(true);
    expect(PortfolioSchema.safeParse({ ...validPortfolio, availability: "limited" }).success).toBe(true);
    expect(PortfolioSchema.safeParse({ ...validPortfolio, availability: "invalid" }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS AD
// ─────────────────────────────────────────────────────────────────────────────

describe("BusinessAdSchema", () => {
  const validBiz = {
    businessName: "Acme Corp",
    tagline: "We make widgets",
    description: "A full description.",
    contacts: [],
    socialLinks: [],
    services: [{ title: "Widget Making", description: "We make widgets." }],
    primaryCtaLabel: "Contact Us",
    primaryCtaUrl: "https://acme.com/contact",
  };

  it("accepts valid business data", () => {
    expect(BusinessAdSchema.safeParse(validBiz).success).toBe(true);
  });

  it("requires at least one service", () => {
    const result = BusinessAdSchema.safeParse({ ...validBiz, services: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid primaryCtaUrl", () => {
    const result = BusinessAdSchema.safeParse({ ...validBiz, primaryCtaUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("validates business hours format", () => {
    const withHours = {
      ...validBiz,
      businessHours: [{ day: "Monday", open: "09:00", close: "18:00" }],
    };
    expect(BusinessAdSchema.safeParse(withHours).success).toBe(true);
  });

  it("rejects invalid business hours time format", () => {
    const withBadHours = {
      ...validBiz,
      businessHours: [{ day: "Monday", open: "9am", close: "6pm" }],
    };
    expect(BusinessAdSchema.safeParse(withBadHours).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WEDDING INVITATION
// ─────────────────────────────────────────────────────────────────────────────

describe("WeddingInvitationSchema", () => {
  const validWedding = {
    partner1: { name: "Alex" },
    partner2: { name: "Jordan" },
    weddingDate: "2025-11-15T14:00:00+08:00",
    loveHistory: [
      { date: "2020-01", title: "First Meeting", story: "We met at a coffee shop." },
    ],
    events: [
      {
        name: "Ceremony",
        date: "2025-11-15T14:00:00+08:00",
        venue: "Grand Ballroom",
        address: "123 Wedding Lane",
      },
    ],
    gallery: [],
  };

  it("accepts valid wedding data", () => {
    expect(WeddingInvitationSchema.safeParse(validWedding).success).toBe(true);
  });

  it("requires at least one love history milestone", () => {
    const result = WeddingInvitationSchema.safeParse({
      ...validWedding,
      loveHistory: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one event", () => {
    const result = WeddingInvitationSchema.safeParse({
      ...validWedding,
      events: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates colorPalette as hex strings", () => {
    const withPalette = { ...validWedding, colorPalette: ["#ffd700", "#c9a96e"] };
    expect(WeddingInvitationSchema.safeParse(withPalette).success).toBe(true);
  });

  it("rejects invalid colorPalette hex", () => {
    const withBadPalette = { ...validWedding, colorPalette: ["gold"] };
    expect(WeddingInvitationSchema.safeParse(withBadPalette).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseTemplateData
// ─────────────────────────────────────────────────────────────────────────────

describe("parseTemplateData", () => {
  it("parses valid data for digital-name-card", () => {
    const data = {
      fullName: "Alex",
      jobTitle: "Designer",
      company: "Labs",
      contacts: [],
      socialLinks: [],
    };
    expect(() => parseTemplateData("digital-name-card", data)).not.toThrow();
  });

  it("throws ZodError for invalid data", () => {
    expect(() => parseTemplateData("digital-name-card", {})).toThrow();
  });

  it("throws for unknown category slug", () => {
    expect(() =>
      parseTemplateData("unknown-category" as never, {})
    ).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// safeParseTemplateData
// ─────────────────────────────────────────────────────────────────────────────

describe("safeParseTemplateData", () => {
  it("returns success:true for valid data", () => {
    const data = {
      fullName: "Alex",
      jobTitle: "Designer",
      company: "Labs",
      contacts: [],
      socialLinks: [],
    };
    const result = safeParseTemplateData("digital-name-card", data);
    expect(result.success).toBe(true);
  });

  it("returns success:false with ZodError for invalid data", () => {
    const result = safeParseTemplateData("portfolio", { fullName: "Alex" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});
