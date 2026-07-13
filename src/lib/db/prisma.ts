// src/lib/db/prisma.ts
// Robust file-based database fallback for preview environments.
// Detects if DATABASE_URL is present. If so, uses the real Prisma Client.
// If not, uses a local JSON file in-memory DB to support fully persistent login, signup, onboarding, profile updates, and analytics.

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const isRealDB = !!process.env.DATABASE_URL;

let realPrisma: PrismaClient | undefined;

if (isRealDB) {
  try {
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    realPrisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = realPrisma;
    }
  } catch (err) {
    console.warn("Prisma Client initialization failed, falling back to mock database", err);
  }
}

// ── MOCK DATABASE IMPLEMENTATION ──────────────────────────────────────────────

const DB_FILE = path.join(process.cwd(), "src/lib/db/mock-db.json");

function sha256(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

const initialCategories = [
  {
    id: "cat-1",
    name: "Digital Name Card",
    slug: "digital-name-card",
    description: "A sleek, shareable digital business card to replace paper cards forever.",
    iconName: "CreditCard",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Portfolio",
    slug: "portfolio",
    description: "Showcase your projects, experience, and skills in a stunning personal portfolio.",
    iconName: "Briefcase",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Business Advertisement",
    slug: "business-ad",
    description: "A high-converting digital page for your business, services, and brand.",
    iconName: "Building2",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Wedding Invitation",
    slug: "wedding-invitation",
    description: "A beautiful, interactive wedding invitation with your love story and event details.",
    iconName: "Heart",
    sortOrder: 4,
    isActive: true,
  },
];

const PH = (w: number, h: number, text: string, bg: string) =>
  `https://placehold.co/${w}x${h}/${bg}/ffffff?text=${encodeURIComponent(text)}&font=montserrat`;

const initialTemplates = [
  // Digital Name Card
  { id: "tmpl-aurora", categoryId: "cat-1", codeIdentifier: "digital-card-aurora", name: "Aurora", description: "Glassmorphism floating card with aurora gradient orbs. Ethereal and modern.", thumbnailUrl: PH(600, 340, "Aurora", "6366f1"), accentColor: "#6366f1", isPremium: false, isActive: true, sortOrder: 1 },
  { id: "tmpl-obsidian", categoryId: "cat-1", codeIdentifier: "digital-card-obsidian", name: "Obsidian", description: "Pure black brutalist precision with editorial typography. Bold and striking.", thumbnailUrl: PH(600, 340, "Obsidian", "18181b"), accentColor: "#f59e0b", isPremium: false, isActive: true, sortOrder: 2 },
  { id: "tmpl-prism", categoryId: "cat-1", codeIdentifier: "digital-card-prism", name: "Prism", description: "Multi-color spectrum gradients with skills-first layout and progress bars.", thumbnailUrl: PH(600, 340, "Prism", "a855f7"), accentColor: "#a855f7", isPremium: true, isActive: true, sortOrder: 3 },
  { id: "tmpl-coral", categoryId: "cat-1", codeIdentifier: "digital-card-coral", name: "Coral", description: "Warm gradient with organic shapes and quote-forward layout. Inviting and personal.", thumbnailUrl: PH(600, 340, "Coral", "f97316"), accentColor: "#f97316", isPremium: true, isActive: true, sortOrder: 4 },
  { id: "tmpl-titanium", categoryId: "cat-1", codeIdentifier: "digital-card-titanium", name: "Titanium", description: "Metallic silver with industrial precision and data-dense contact layout.", thumbnailUrl: PH(600, 340, "Titanium", "64748b"), accentColor: "#94a3b8", isPremium: true, isActive: true, sortOrder: 5 },

  // Portfolio
  { id: "tmpl-canvas", categoryId: "cat-2", codeIdentifier: "portfolio-canvas", name: "Canvas", description: "Light creative studio layout, project-grid-first with warm whites and clean typography.", thumbnailUrl: PH(600, 340, "Canvas", "0ea5e9"), accentColor: "#0ea5e9", isPremium: false, isActive: true, sortOrder: 1 },
  { id: "tmpl-studio", categoryId: "cat-2", codeIdentifier: "portfolio-studio", name: "Studio", description: "Dark creative agency aesthetic with large type and dramatic full-bleed sections.", thumbnailUrl: PH(600, 340, "Studio", "ec4899"), accentColor: "#ec4899", isPremium: false, isActive: true, sortOrder: 2 },
  { id: "tmpl-forge", categoryId: "cat-2", codeIdentifier: "portfolio-forge", name: "Forge", description: "Terminal and code aesthetic for developers — monospace fonts, JSON-style contacts.", thumbnailUrl: PH(600, 340, "Forge", "22c55e"), accentColor: "#22c55e", isPremium: true, isActive: true, sortOrder: 3 },
  { id: "tmpl-spectrum", categoryId: "cat-2", codeIdentifier: "portfolio-spectrum", name: "Spectrum", description: "Bold color blocks with masonry gallery. Perfect for designers and creative directors.", thumbnailUrl: PH(600, 340, "Spectrum", "f59e0b"), accentColor: "#f59e0b", isPremium: true, isActive: true, sortOrder: 4 },
  { id: "tmpl-blueprint", categoryId: "cat-2", codeIdentifier: "portfolio-blueprint", name: "Blueprint", description: "Technical grid-line aesthetic for architects, engineers, and structured thinkers.", thumbnailUrl: PH(600, 340, "Blueprint", "3b82f6"), accentColor: "#3b82f6", isPremium: true, isActive: true, sortOrder: 5 },

  // Business Ad
  { id: "tmpl-marquee", categoryId: "cat-3", codeIdentifier: "business-marquee", name: "Marquee", description: "Bold headline-first with scrolling ticker, hero image, and high-energy dark layout.", thumbnailUrl: PH(600, 340, "Marquee", "ef4444"), accentColor: "#ef4444", isPremium: false, isActive: true, sortOrder: 1 },
  { id: "tmpl-district", categoryId: "cat-3", codeIdentifier: "business-district", name: "District", description: "Warm and trustworthy local-business layout with hours, FAQ, and review sections.", thumbnailUrl: PH(600, 340, "District", "0284c7"), accentColor: "#0284c7", isPremium: false, isActive: true, sortOrder: 2 },
  { id: "tmpl-empire", categoryId: "cat-3", codeIdentifier: "business-empire", name: "Empire", description: "Corporate premium feel for large enterprises. Fixed header, dramatic hero, dark testimonials.", thumbnailUrl: PH(600, 340, "Empire", "7c3aed"), accentColor: "#7c3aed", isPremium: true, isActive: true, sortOrder: 3 },
  { id: "tmpl-neon", categoryId: "cat-3", codeIdentifier: "business-neon", name: "Neon", description: "Cyberpunk nightlife aesthetic in pure black with neon accents. For bars, clubs, and events.", thumbnailUrl: PH(600, 340, "Neon", "a3e635"), accentColor: "#a3e635", isPremium: true, isActive: true, sortOrder: 4 },
  { id: "tmpl-vault", categoryId: "cat-3", codeIdentifier: "business-vault", name: "Vault", description: "Understated luxury for financial, legal, and consultancy firms. Roman numerals, gold tones.", thumbnailUrl: PH(600, 340, "Vault", "d4af37"), accentColor: "#d4af37", isPremium: true, isActive: true, sortOrder: 5 },

  // Wedding Invitation
  { id: "tmpl-eternal", categoryId: "cat-4", codeIdentifier: "wedding-eternal", name: "Eternal", description: "Timeless elegance with serif typography and soft golds. Full love-history timeline.", thumbnailUrl: PH(600, 340, "Eternal", "c9a96e"), accentColor: "#c9a96e", isPremium: false, isActive: true, sortOrder: 1 },
  { id: "tmpl-blossom", categoryId: "cat-4", codeIdentifier: "wedding-blossom", name: "Blossom", description: "Soft floral pastel pinks with organic shapes and a romantic spring aesthetic.", thumbnailUrl: PH(600, 340, "Blossom", "f472b6"), accentColor: "#f472b6", isPremium: false, isActive: true, sortOrder: 2 },
  { id: "tmpl-noir", categoryId: "cat-4", codeIdentifier: "wedding-noir", name: "Noir", description: "Dramatic cinematic black-and-white for sophisticated couples. Grayscale gallery.", thumbnailUrl: PH(600, 340, "Noir", "27272a"), accentColor: "#ffffff", isPremium: true, isActive: true, sortOrder: 3 },
  { id: "tmpl-celestial", categoryId: "cat-4", codeIdentifier: "wedding-celestial", name: "Celestial", description: "Stars and cosmos theme on midnight blue. Star-field background, constellation timeline.", thumbnailUrl: PH(600, 340, "Celestial", "1e0050"), accentColor: "#a78bfa", isPremium: true, isActive: true, sortOrder: 4 },
  { id: "tmpl-rustic", categoryId: "cat-4", codeIdentifier: "wedding-rustic", name: "Rustic", description: "Warm wood and greenery boho outdoor wedding. Dashed borders, earth tones, petal overlays.", thumbnailUrl: PH(600, 340, "Rustic", "65a30d"), accentColor: "#65a30d", isPremium: true, isActive: true, sortOrder: 5 },
];

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
  featuredQuote: "Great design is invisible — it removes friction and creates delight without asking for attention.",
  ctaLabel: "Book a Discovery Call",
  ctaUrl: "https://cal.com/alexrivera",
  accentColor: "#6366f1",
  backgroundStyle: "mesh",
};

interface DBData {
  users: any[];
  sessions: any[];
  categories: any[];
  templates: any[];
  profiles: any[];
}

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to load mock DB:", err);
  }

  const data: DBData = {
    users: [
      {
        id: "user-admin",
        email: "admin@presencecard.io",
        name: "Admin",
        hashedPassword: sha256("admin-change-me-in-prod"),
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "user-demo",
        email: "demo@presencecard.io",
        name: "Alex Rivera",
        hashedPassword: sha256("demo-password-123"),
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    sessions: [],
    categories: initialCategories,
    templates: initialTemplates,
    profiles: [
      {
        id: "profile-demo",
        userId: "user-demo",
        categoryId: "cat-1",
        templateId: "tmpl-aurora",
        templateLocked: true,
        slug: "alex-rivera",
        isPublished: true,
        dynamicJsonData: DEMO_NAME_CARD_DATA,
        metaTitle: "Alex Rivera — Senior Product Designer",
        metaDescription: "Product designer helping startups build intuitive, beautiful products. 8 years across fintech, healthtech, and SaaS.",
        ogImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=1200&h=630&q=80",
        viewCount: 1247,
        qrScanCount: 45,
        qrLocked: true,
        qrGeneratedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
  };

  saveDB(data);
  return data;
}

function saveDB(data: DBData) {
  try {
    const parentDir = path.dirname(DB_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save mock DB:", err);
  }
}

function matches(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const val = where[key];
    if (val && typeof val === "object" && "contains" in val) {
      const search = val.contains?.toLowerCase();
      if (!search) continue;
      const fieldVal = item[key]?.toString().toLowerCase() || "";
      if (!fieldVal.includes(search)) return false;
    } else if (val && typeof val === "object" && "OR" in val) {
      const orArray = val.OR;
      let orMatches = false;
      for (const orWhere of orArray) {
        if (matches(item, orWhere)) {
          orMatches = true;
          break;
        }
      }
      if (!orMatches) return false;
    } else if (key === "OR") {
      let orMatches = false;
      for (const orWhere of val) {
        if (matches(item, orWhere)) {
          orMatches = true;
          break;
        }
      }
      if (!orMatches) return false;
    } else if (key === "userId_categoryId") {
      if (item.userId !== val.userId || item.categoryId !== val.categoryId) {
        return false;
      }
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

function sortItems(items: any[], orderBy: any): any[] {
  if (!orderBy) return items;
  return [...items].sort((a, b) => {
    for (const key of Object.keys(orderBy)) {
      const order = orderBy[key];
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) continue;
      if (order === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    }
    return 0;
  });
}

function resolveJoins(item: any, db: DBData): any {
  if (!item) return item;
  const result = { ...item };
  
  if (result.viewCount !== undefined) {
    try {
      result.viewCount = BigInt(result.viewCount);
    } catch {
      result.viewCount = 0n;
    }
  }
  if (result.qrScanCount !== undefined) {
    try {
      result.qrScanCount = BigInt(result.qrScanCount);
    } catch {
      result.qrScanCount = 0n;
    }
  }

  if (result.userId) {
    const userObj = db.users.find(u => u.id === result.userId);
    if (userObj) {
      result.user = { ...userObj };
    }
  }
  if (result.categoryId) {
    const catObj = db.categories.find(c => c.id === result.categoryId);
    if (catObj) {
      result.category = { ...catObj };
    }
  }
  if (result.templateId) {
    const tmplObj = db.templates.find(t => t.id === result.templateId);
    if (tmplObj) {
      result.template = { ...tmplObj };
    }
  }
  if (result.templates === undefined && db.templates) {
    result.templates = db.templates
      .filter(t => t.categoryId === result.id)
      .map(t => resolveJoins(t, db));
  }
  return result;
}

// ── BUILD MOCK API INTERFACE ───────────────────────────────────────────────

const noOpHandler = {
  get(target: any, prop: string) {
    if (prop === "then") return undefined;
    return (...args: any[]) => {
      const db = loadDB();
      const collectionName = target._collectionName;
      const collection = db[collectionName as keyof DBData] || [];

      if (prop === "findMany") {
        const query = args[0] || {};
        const filtered = collection
          .filter(item => matches(item, query.where))
          .map(item => resolveJoins(item, db));
        const sorted = sortItems(filtered, query.orderBy);
        const sliced = sorted.slice(query.skip || 0, query.skip ? (query.skip + (query.take || sorted.length)) : (query.take || sorted.length));
        return Promise.resolve(sliced);
      }

      if (prop === "findFirst" || prop === "findUnique") {
        const query = args[0] || {};
        const found = collection.find(item => matches(item, query.where));
        return Promise.resolve(found ? resolveJoins(found, db) : null);
      }

      if (prop === "count") {
        const query = args[0] || {};
        const count = collection.filter(item => matches(item, query.where)).length;
        return Promise.resolve(count);
      }

      if (prop === "aggregate") {
        let qrScanCount = 0n;
        let viewCount = 0n;
        for (const p of db.profiles) {
          qrScanCount += BigInt(p.qrScanCount || 0);
          viewCount += BigInt(p.viewCount || 0);
        }
        return Promise.resolve({
          _sum: {
            qrScanCount,
            viewCount,
          },
        });
      }

      if (prop === "create") {
        const query = args[0] || {};
        const newRecord = {
          id: query.data.id || Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...query.data,
        };
        collection.push(newRecord);
        saveDB(db);
        return Promise.resolve(resolveJoins(newRecord, db));
      }

      if (prop === "update") {
        const query = args[0] || {};
        const index = collection.findIndex(item => matches(item, query.where));
        if (index === -1) {
          return Promise.reject(new Error(`Record not found for update in ${collectionName}`));
        }
        const updatedRecord = {
          ...collection[index],
          ...query.data,
          updatedAt: new Date().toISOString(),
        };
        // Safely handle special field increments/conversions
        if (query.data.viewCount && typeof query.data.viewCount === "object" && "increment" in query.data.viewCount) {
          updatedRecord.viewCount = Number(collection[index].viewCount || 0) + Number(query.data.viewCount.increment || 1);
        }
        if (query.data.qrScanCount && typeof query.data.qrScanCount === "object" && "increment" in query.data.qrScanCount) {
          updatedRecord.qrScanCount = Number(collection[index].qrScanCount || 0) + Number(query.data.qrScanCount.increment || 1);
        }
        collection[index] = updatedRecord;
        saveDB(db);
        return Promise.resolve(resolveJoins(updatedRecord, db));
      }

      if (prop === "upsert") {
        const query = args[0] || {};
        const index = collection.findIndex(item => matches(item, query.where));
        if (index === -1) {
          // create
          const newRecord = {
            id: query.create.id || Math.random().toString(36).substring(2, 11),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...query.create,
          };
          collection.push(newRecord);
          saveDB(db);
          return Promise.resolve(resolveJoins(newRecord, db));
        } else {
          // update
          const updatedRecord = {
            ...collection[index],
            ...query.update,
            updatedAt: new Date().toISOString(),
          };
          collection[index] = updatedRecord;
          saveDB(db);
          return Promise.resolve(resolveJoins(updatedRecord, db));
        }
      }

      if (prop === "delete") {
        const query = args[0] || {};
        const index = collection.findIndex(item => matches(item, query.where));
        if (index === -1) {
          return Promise.reject(new Error(`Record not found for delete in ${collectionName}`));
        }
        const deleted = collection.splice(index, 1)[0];
        saveDB(db);
        return Promise.resolve(resolveJoins(deleted, db));
      }

      return Promise.resolve({});
    };
  }
};

const makeMockModel = (collectionName: string) => {
  return new Proxy({ _collectionName: collectionName }, noOpHandler);
};

const mockPrisma = new Proxy({}, {
  get(target, prop) {
    if (prop === "$connect" || prop === "$disconnect") {
      return () => Promise.resolve();
    }
    if (prop === "user") return makeMockModel("users");
    if (prop === "session") return makeMockModel("sessions");
    if (prop === "category") return makeMockModel("categories");
    if (prop === "template") return makeMockModel("templates");
    if (prop === "userProfile") return makeMockModel("profiles");
    return makeMockModel(prop as string);
  }
}) as unknown as PrismaClient;

export const prisma = realPrisma || mockPrisma;

export default prisma;
