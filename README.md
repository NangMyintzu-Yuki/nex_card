# PresenceCard Platform

**Multi-Template Multi-Tenant Digital Presence Platform**  
Next.js 15 (App Router) · Tailwind CSS · MySQL (Prisma ORM) · TypeScript

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in DATABASE_URL, NEXT_PUBLIC_APP_URL, SESSION_SECRET

# 3. Database
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to DB
npm run db:seed       # seed categories, templates, demo users

# 4. Dev server
npm run dev           # → http://localhost:3000
```

**Demo credentials**
- Admin: `admin@presencecard.io` / `admin-change-me-in-prod`
- User:  `demo@presencecard.io`  / `demo-password-123`
- Live demo profile: `http://localhost:3000/alex-rivera`

---

## Architecture

```
presencecard-platform/
├── prisma/
│   ├── schema.prisma              # 6 models: User, Session, Category, Template, UserProfile
│   ├── seed.ts                    # Seeds 4 categories × 5 templates + demo data
│   └── migrations/                # Raw DDL migration for direct MySQL deploy
│
└── src/
    ├── middleware.ts               # Edge route protection (/dashboard, /admin)
    ├── types/templates.ts          # Master TS types + TEMPLATE_IDS constants
    │
    ├── lib/
    │   ├── db/prisma.ts           # Singleton Prisma client
    │   ├── auth/
    │   │   ├── session.ts         # Cookie-based session helper
    │   │   └── hash.ts            # bcrypt hash/verify
    │   ├── cache/profile-cache.ts # ISR + revalidateTag helpers
    │   ├── storage/r2-upload.ts   # Cloudflare R2 upload + presigned URLs
    │   ├── utils.ts               # cn(), toSlug(), formatNumber(), etc.
    │   ├── validators/
    │   │   └── template-schemas.ts  # Zod schemas for all 4 category shapes
    │   └── actions/
    │       ├── profile-actions.ts   # selectTemplate, updateProfile
    │       ├── qr-actions.ts        # generateQR, incrementQRScanCount
    │       ├── account-actions.ts   # changePassword, updateProfileInfo, deleteAccount
    │       └── admin-actions.ts     # toggleUserStatus, toggleTemplate
    │
    ├── app/
    │   ├── page.tsx                       # Marketing landing page
    │   ├── login/ register/               # Auth pages
    │   ├── [slug]/page.tsx                # Public profile render (ISR + OG)
    │   ├── p/[slug]/page.tsx              # QR-scan route (separate scan tracking)
    │   ├── dashboard/
    │   │   ├── page.tsx                   # Profile cards listing
    │   │   ├── analytics/page.tsx         # Per-profile view stats
    │   │   ├── settings/page.tsx          # Account, password, export, delete
    │   │   ├── edit/[slug]/               # Profile content editor
    │   │   ├── onboarding/                # 3-step category→template→slug flow
    │   │   └── qr/[slug]/                 # QR code generator + lock manager
    │   ├── admin/                         # Role-gated admin panel
    │   └── api/
    │       ├── auth/login|register|logout  # Cookie auth endpoints
    │       ├── og/                         # Dynamic OG image (ImageResponse)
    │       ├── qr/[slug]/                  # SVG/PNG QR generation (qrcode pkg)
    │       ├── slug/check/                 # Real-time slug availability
    │       ├── upload/                     # R2 presigned URL generator
    │       ├── export/data/                # JSON data export download
    │       └── revalidate/                 # Webhook ISR cache purge
    │
    └── components/
        ├── ui/                     # Button, Input, Badge, Card, Spinner, Avatar
        ├── layout/template-shell.tsx  # PresenceCard attribution wrapper
        └── templates/              # All 20 world-class templates (see below)
```

---

## 20 Templates — Design Research & Implementation

All templates were redesigned from scratch after researching industry leaders in each category.

### Digital Name Card (5 templates)

| Template | Design Inspiration | Key Features |
|----------|-------------------|--------------|
| **Aurora** | HiHello × Linear × Stripe | Glassmorphism mesh-gradient hero, full contact rows, skill tags, gradient CTA |
| **Obsidian** | Notion brutalism × Bloomberg | High-contrast pure black, editorial typography, contact table, social border chips |
| **Prism** | Vercel dashboard × Raycast | Multi-spectrum gradient, per-skill progress bars, colour-coded social grid |
| **Coral** | Linktree Premium × Beacons.ai | Warm bio-link layout, emoji contact pills, centred avatar, 2-col social grid |
| **Titanium** | Apple Metal × Porsche design | Metallic grid bg, precision data table for contacts, 2-col skill bars, monospace socials |

**All digital name card templates include:** phone, email, WhatsApp, LinkedIn, GitHub, Twitter/X, Instagram, TikTok, Telegram, website — displayed visibly with accessible tap targets.

### Portfolio (5 templates)

| Template | Target User | Design Inspiration |
|----------|-------------|-------------------|
| **Canvas** | Designers, SMEs, creatives | Awwwards editorial white — sticky nav, featured project grid, testimonials |
| **Studio** | Photographers, filmmakers, agencies | Full-bleed cinematic dark — project images as hero, grayscale hover |
| **Forge** | Developers, open source | Terminal monospace — JSON contacts block, project list with #hashtag tags |
| **Spectrum** | Creative directors, brand designers | Bold bento grid — oversized typography, masonry gallery, colour-coded skill cards |
| **Blueprint** | Architects, consultants, engineers | Technical grid background — constellation timeline, code-monospace typography |

### Business Advertisement (5 templates)

| Template | Target Business | Design Inspiration |
|----------|----------------|-------------------|
| **Marquee** | SaaS startups, tech companies | Stripe × Linear × Vercel — scrolling ticker, bold hero, pricing cards |
| **District** | Local businesses, F&B, retail | Square × Toast POS — warm whites, review stars, hours table, maps link |
| **Empire** | Corporate, professional services | McKinsey × Deloitte — fixed nav, dark testimonial strip, enterprise polish |
| **Neon** | Nightlife, events, entertainment | Spotify × Resident Advisor — full-bleed masonry gallery, minimal typography |
| **Vault** | Finance, legal, luxury goods | Hermès × Goldman Sachs — Roman numeral services, pull-quote testimonials, gold palette |

### Wedding Invitation (5 templates)

| Template | Style | Design Inspiration |
|----------|-------|-------------------|
| **Eternal** | Timeless luxury | Riley & Grey × Zola — full love-story timeline, countdown, gallery masonry |
| **Blossom** | Soft floral bohemian | Minted botanical — organic blob avatars, petal decorations, pastel palette |
| **Noir** | Cinematic black & white | Wong Kar-wai × Kubrick — film-grain overlay, grayscale photos with colour hover |
| **Celestial** | Deep space romantic | NASA aesthetic × Zola cosmic — CSS star-particle SVG field, nebula glow blobs |
| **Rustic** | Botanical outdoor | Junebug Weddings × boho — dashed border frames, botanical emoji corners, earth tones |

---

## Database Schema

Six models, `cuid()` primary keys:

```
User → Session (auth)
Category → Template (catalogue)  
User + Category + Template → UserProfile (core entity)
```

**Key design decisions:**
- `dynamicJsonData JSON` — all template-specific content in one column, validated by Zod at app layer
- `templateLocked BOOLEAN` — set on onboarding confirm; enforced server-side in every action
- `qrLocked BOOLEAN` — set on first QR generation; freezes template + category permanently  
- `qrScanCount BIGINT` — separate from `viewCount` to distinguish QR vs organic traffic
- `UNIQUE(userId, categoryId)` — one profile per category per user, enforced at DB level
- `viewCount BIGINT` — prevents overflow for viral profiles

---

## QR Code System

```
User publishes profile → navigates to /dashboard/qr/[slug]
→ Clicks "Generate QR" → amber lock warning shown
→ Confirms → generateQRAction():
    • Sets qrLocked=true, templateLocked=true, qrGeneratedAt=now
    • Purges ISR cache for that slug
→ QR displayed — download SVG (vector) or PNG (128/256/512/1024px)
→ QR points to /p/[slug] (separate route):
    • Increments qrScanCount independently
    • Shows QRScanBadge (auto-dismisses after 6s)
    • Renders full template identically
→ After lock: template + category permanently frozen; content editable forever
```

---

## ISR + Cache Strategy

- All public profiles: `revalidate = 3600` (1 hour CDN edge cache)
- `revalidateTag("profile:{slug}")` called immediately on every profile save
- `revalidateTag("user-profiles:{userId}")` for dashboard list
- `/api/revalidate` webhook for external purges (protected by `REVALIDATION_SECRET`)

---

## Scripts

```bash
npm run dev           # Turbopack dev server
npm run build         # Production build
npm run type-check    # TypeScript check (no emit)
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Vitest unit tests
npm run db:generate   # Generate Prisma client after schema changes
npm run db:push       # Push schema changes to DB (dev)
npm run db:migrate    # Create + apply migration (dev)
npm run db:migrate:prod  # Apply existing migrations (production)
npm run db:studio     # Open Prisma Studio GUI
npm run db:seed       # Seed categories, templates, demo data
```