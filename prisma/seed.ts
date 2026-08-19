// prisma/seed.ts
// Seeds all categories, 5 templates per category, and a demo user + profile

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: "Digital Name Card",
    slug: "digital-name-card",
    description:
      "A sleek, shareable digital business card to replace paper cards forever.",
    iconName: "CreditCard",
    sortOrder: 1,
  },
  {
    name: "Portfolio",
    slug: "portfolio",
    description:
      "Showcase your projects, experience, and skills in a stunning personal portfolio.",
    iconName: "Briefcase",
    sortOrder: 2,
  },
  {
    name: "Business Advertisement",
    slug: "business-ad",
    description:
      "A high-converting digital page for your business, services, and brand.",
    iconName: "Building2",
    sortOrder: 3,
  },
  {
    name: "Wedding Invitation",
    slug: "wedding-invitation",
    description:
      "A beautiful, interactive wedding invitation with your love story and event details.",
    iconName: "Heart",
    sortOrder: 4,
  },
] as const;

// Local SVG thumbnails in /public/thumbnails (no external CDN)
const PH = (_w: number, _h: number, text: string, _bg: string) =>
  `/thumbnails/${text.toLowerCase()}.svg`;

const TEMPLATES_BY_CATEGORY: Record<
  string,
  Array<{
    codeIdentifier: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    accentColor: string;
    isPremium: boolean;
    sortOrder: number;
    priceQrOnly?: number;
    priceNfcQr?: number;
  }>
> = {
  "digital-name-card": [
    {
      codeIdentifier: "digital-card-aurora",
      name: "Aurora",
      description:
        "Glassmorphism floating card with aurora gradient orbs. Ethereal and modern.",
      thumbnailUrl: PH(600, 340, "Aurora", "6366f1"),
      accentColor: "#6366f1",
      isPremium: true,
      sortOrder: 1,
    },
    {
      codeIdentifier: "digital-card-obsidian",
      name: "Obsidian",
      description:
        "Pure black brutalist precision with editorial typography. Bold and striking.",
      thumbnailUrl: PH(600, 340, "Obsidian", "18181b"),
      accentColor: "#f59e0b",
      isPremium: true,
      sortOrder: 2,
    },
    {
      codeIdentifier: "digital-card-prism",
      name: "Prism",
      description:
        "Multi-color spectrum gradients with skills-first layout and progress bars.",
      thumbnailUrl: PH(600, 340, "Prism", "a855f7"),
      accentColor: "#a855f7",
      isPremium: true,
      sortOrder: 3,
    },
    {
      codeIdentifier: "digital-card-coral",
      name: "Coral",
      description:
        "Warm gradient with organic shapes and quote-forward layout. Inviting and personal.",
      thumbnailUrl: PH(600, 340, "Coral", "f97316"),
      accentColor: "#f97316",
      isPremium: true,
      sortOrder: 4,
    },
    {
      codeIdentifier: "digital-card-titanium",
      name: "Titanium",
      description:
        "Metallic silver with industrial precision and data-dense contact layout.",
      thumbnailUrl: PH(600, 340, "Titanium", "64748b"),
      accentColor: "#94a3b8",
      isPremium: true,
      sortOrder: 5,
    },
  ],

  "portfolio": [
    {
      codeIdentifier: "portfolio-canvas",
      name: "Canvas",
      description:
        "Light creative studio layout, project-grid-first with warm whites and clean typography.",
      thumbnailUrl: PH(600, 340, "Canvas", "0ea5e9"),
      accentColor: "#0ea5e9",
      isPremium: true,
      sortOrder: 1,
    },
    {
      codeIdentifier: "portfolio-studio",
      name: "Studio",
      description:
        "Dark creative agency aesthetic with large type and dramatic full-bleed sections.",
      thumbnailUrl: PH(600, 340, "Studio", "ec4899"),
      accentColor: "#ec4899",
      isPremium: true,
      sortOrder: 2,
    },
    {
      codeIdentifier: "portfolio-forge",
      name: "Forge",
      description:
        "Terminal and code aesthetic for developers — monospace fonts, JSON-style contacts.",
      thumbnailUrl: PH(600, 340, "Forge", "22c55e"),
      accentColor: "#22c55e",
      isPremium: true,
      sortOrder: 3,
    },
    {
      codeIdentifier: "portfolio-spectrum",
      name: "Spectrum",
      description:
        "Bold color blocks with masonry gallery. Perfect for designers and creative directors.",
      thumbnailUrl: PH(600, 340, "Spectrum", "f59e0b"),
      accentColor: "#f59e0b",
      isPremium: true,
      sortOrder: 4,
    },
    {
      codeIdentifier: "portfolio-blueprint",
      name: "Blueprint",
      description:
        "Technical grid-line aesthetic for architects, engineers, and structured thinkers.",
      thumbnailUrl: PH(600, 340, "Blueprint", "3b82f6"),
      accentColor: "#3b82f6",
      isPremium: true,
      sortOrder: 5,
    },
  ],

  "business-ad": [
    {
      codeIdentifier: "business-marquee",
      name: "Marquee",
      description:
        "Kinetic retail and events layout — full-bleed hero, continuous ticker, coral-accent high contrast.",
      thumbnailUrl: PH(600, 340, "Marquee", "f97316"),
      accentColor: "#f97316",
      isPremium: true,
      sortOrder: 1,
    },
    {
      codeIdentifier: "business-district",
      name: "District",
      description:
        "Coastal local commerce — white and deep teal, hours and address first, bold neighborhood trust.",
      thumbnailUrl: PH(600, 340, "District", "0f766e"),
      accentColor: "#0F766E",
      isPremium: true,
      sortOrder: 2,
    },
    {
      codeIdentifier: "business-empire",
      name: "Empire",
      description:
        "Quiet-luxury editorial for premium B2B — espresso and champagne, serif display, asymmetric manifesto.",
      thumbnailUrl: PH(600, 340, "Empire", "c4a574"),
      accentColor: "#c4a574",
      isPremium: true,
      sortOrder: 3,
    },
    {
      codeIdentifier: "business-neon",
      name: "Neon",
      description:
        "Velvet nightlife — immersive photo hero, deep navy with rose and amber, soft serif display.",
      thumbnailUrl: PH(600, 340, "Neon", "e8a87c"),
      accentColor: "#E8A87C",
      isPremium: true,
      sortOrder: 4,
    },
    {
      codeIdentifier: "business-vault",
      name: "Vault",
      description:
        "Institutional light theme for legal and finance — cool slate, certification stamps, tabular fees.",
      thumbnailUrl: PH(600, 340, "Vault", "3b5368"),
      accentColor: "#3b5368",
      isPremium: true,
      sortOrder: 5,
    },
  ],

  "wedding-invitation": [
    {
      codeIdentifier: "wedding-eternal",
      name: "Eternal",
      description:
        "Timeless elegance with serif typography and soft golds. Full love-history timeline.",
      thumbnailUrl: PH(600, 340, "Eternal", "c9a96e"),
      accentColor: "#c9a96e",
      isPremium: true,
      sortOrder: 1,
    },
    {
      codeIdentifier: "wedding-blossom",
      name: "Blossom",
      description:
        "Soft floral pastel pinks with organic shapes and a romantic spring aesthetic.",
      thumbnailUrl: PH(600, 340, "Blossom", "f472b6"),
      accentColor: "#f472b6",
      isPremium: true,
      sortOrder: 2,
    },
    {
      codeIdentifier: "wedding-noir",
      name: "Noir",
      description:
        "Dramatic cinematic black-and-white for sophisticated couples. Grayscale gallery.",
      thumbnailUrl: PH(600, 340, "Noir", "27272a"),
      accentColor: "#ffffff",
      isPremium: true,
      sortOrder: 3,
    },
    {
      codeIdentifier: "wedding-celestial",
      name: "Celestial",
      description:
        "Stars and cosmos theme on midnight blue. Star-field background, constellation timeline.",
      thumbnailUrl: PH(600, 340, "Celestial", "1e0050"),
      accentColor: "#a78bfa",
      isPremium: true,
      sortOrder: 4,
    },
    {
      codeIdentifier: "wedding-rustic",
      name: "Rustic",
      description:
        "Warm wood and greenery boho outdoor wedding. Dashed borders, earth tones, petal overlays.",
      thumbnailUrl: PH(600, 340, "Rustic", "65a30d"),
      accentColor: "#65a30d",
      isPremium: true,
      sortOrder: 5,
    },
  ],
};

const DEFAULT_PRICES = {
  priceQrOnly: 10_000,
  priceNfcQr: 40_000,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DEMO PROFILE DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_NAME_CARD_DATA = {
  fullName: "Alex Rivera",
  pronouns: "they/them",
  jobTitle: "Senior Product Designer",
  company: "Horizon Labs",
  tagline: "Designing systems that scale. Shipping products that matter.",
  bio: "I help early-stage startups translate complex ideas into intuitive, beautiful products. 8 years in product design across fintech, healthtech, and SaaS.",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
  contacts: [
    { type: "email", value: "alex@horizonlabs.io", label: "Work Email", isPrimary: true },
    { type: "phone", value: "+1 (555) 012-3456", label: "Mobile" },
    { type: "website", value: "https://alexrivera.design", label: "Portfolio" },
  ],
  socialLinks: [
    { platform: "linkedin", url: "https://linkedin.com/in/alexrivera", label: "LinkedIn" },
    { platform: "github", url: "https://github.com/alexrivera", label: "GitHub" },
    { platform: "twitter", url: "https://twitter.com/alexrivera", label: "Twitter" },
    { platform: "instagram", url: "https://instagram.com/alexrivera.design", label: "Instagram" },
  ],
  skills: [
    { name: "Figma", level: 95, category: "Design" },
    { name: "UX Research", level: 88, category: "Design" },
    { name: "Design Systems", level: 92, category: "Design" },
    { name: "React", level: 72, category: "Code" },
    { name: "Prototyping", level: 90, category: "Design" },
    { name: "Framer", level: 80, category: "Code" },
  ],
  featuredQuote:
    "Great design is invisible — it removes friction and creates delight without asking for attention.",
  ctaLabel: "Book a Discovery Call",
  ctaUrl: "https://cal.com/alexrivera",
  accentColor: "#6366f1",
  backgroundStyle: "mesh",
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding PresenceCard database…\n");

  // ── 1. Upsert categories ────────────────────────────────────────────────
  console.log("📂 Seeding categories…");
  const categoryRecords: Record<string, { id: string; slug: string }> = {};

  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {
        name: cat.name,
        description: cat.description,
        iconName: cat.iconName,
        sortOrder: cat.sortOrder,
      },
      select: { id: true, slug: true },
    });
    categoryRecords[cat.slug] = record;
    console.log(`  ✓ ${cat.name} (${record.id})`);
  }

  // ── 2. Upsert templates ─────────────────────────────────────────────────
  console.log("\n🎨 Seeding templates…");
  const templateRecords: Record<string, { id: string; codeIdentifier: string }> = {};

  for (const [categorySlug, templates] of Object.entries(TEMPLATES_BY_CATEGORY)) {
    const category = categoryRecords[categorySlug];
    if (!category) {
      console.warn(`  ⚠ Category "${categorySlug}" not found — skipping.`);
      continue;
    }

    for (const template of templates) {
      const prices = {
        priceQrOnly: template.priceQrOnly ?? DEFAULT_PRICES.priceQrOnly,
        priceNfcQr: template.priceNfcQr ?? DEFAULT_PRICES.priceNfcQr,
      };
      const record = await prisma.template.upsert({
        where: { codeIdentifier: template.codeIdentifier },
        create: {
          codeIdentifier: template.codeIdentifier,
          name: template.name,
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          accentColor: template.accentColor,
          isPremium: template.isPremium,
          sortOrder: template.sortOrder,
          ...prices,
          categoryId: category.id,
        },
        update: {
          name: template.name,
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          accentColor: template.accentColor,
          isPremium: template.isPremium,
          sortOrder: template.sortOrder,
          ...prices,
        },
        select: { id: true, codeIdentifier: true },
      });
      templateRecords[template.codeIdentifier] = record;
      console.log(`  ✓ ${template.name} → ${categorySlug}`);
    }
  }

  // ── 3. Admin user ───────────────────────────────────────────────────────
  // Password is set ONLY on create. Re-seeding must never reset production passwords.
  console.log("\n👤 Seeding admin user…");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "nangmyintzu89@gmail.com";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe-Admin-NexCard-2026!";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });
  const adminUser = existingAdmin
    ? await prisma.user.update({
        where: { email: adminEmail },
        data: {
          name: "Admin",
          role: "ADMIN",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
        select: { id: true },
      })
    : await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Admin",
          hashedPassword: hashPassword(adminPassword),
          role: "ADMIN",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
        select: { id: true },
      });
  console.log(`  ✓ ${adminEmail} (${adminUser.id})${existingAdmin ? " [password unchanged]" : " [created]"}`);

  // ── 4. Demo user ────────────────────────────────────────────────────────
  console.log("\n👤 Seeding demo user…");
  const demoEmail = process.env.SEED_DEMO_EMAIL ?? "user@gmail.com";
  const demoPassword =
    process.env.SEED_DEMO_PASSWORD ?? "ChangeMe-Demo-NexCard-2026!";
  const existingDemo = await prisma.user.findUnique({
    where: { email: demoEmail },
    select: { id: true },
  });
  const demoUser = existingDemo
    ? await prisma.user.update({
        where: { email: demoEmail },
        data: {
          name: "Alex Rivera",
          role: "USER",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          avatarUrl:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
        },
        select: { id: true },
      })
    : await prisma.user.create({
        data: {
          email: demoEmail,
          name: "Alex Rivera",
          hashedPassword: hashPassword(demoPassword),
          role: "USER",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          avatarUrl:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
        },
        select: { id: true },
      });
  console.log(`  ✓ ${demoEmail} (${demoUser.id})${existingDemo ? " [password unchanged]" : " [created]"}`);

  // ── 5. Demo profile (Aurora Name Card) ─────────────────────────────────
  console.log("\n📄 Seeding demo profile…");
  const auroraTemplate = templateRecords["digital-card-aurora"];
  const nameCardCategory = categoryRecords["digital-name-card"];

  if (auroraTemplate && nameCardCategory) {
    await prisma.userProfile.upsert({
      where: {
        userId_categoryId: {
          userId: demoUser.id,
          categoryId: nameCardCategory.id,
        },
      },
      create: {
        userId: demoUser.id,
        categoryId: nameCardCategory.id,
        templateId: auroraTemplate.id,
        templateLocked: true,
        slug: "alex-rivera",
        isPublished: true,
        dynamicJsonData: DEMO_NAME_CARD_DATA,
        metaTitle: "Alex Rivera — Senior Product Designer",
        metaDescription:
          "Product designer helping startups build intuitive, beautiful products. 8 years across fintech, healthtech, and SaaS.",
        ogImageUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=1200&h=630&q=80",
        viewCount: BigInt(1247),
      },
      update: {
        dynamicJsonData: DEMO_NAME_CARD_DATA,
        isPublished: true,
      },
    });
    console.log("  ✓ Demo profile: /alex-rivera (Aurora Name Card)");
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!\n");
  console.log("  Categories:  ", Object.keys(categoryRecords).length);
  console.log("  Templates:   ", Object.keys(templateRecords).length);
  console.log(`  Admin login: ${adminEmail}`);
  console.log(`  Demo login:  ${demoEmail}`);
  if (!existingAdmin || !existingDemo) {
    console.log(
      "  Passwords:   set via SEED_ADMIN_PASSWORD / SEED_DEMO_PASSWORD (defaults only apply on first create)"
    );
  }
  console.log("  Demo page:   http://localhost:3000/alex-rivera\n");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
