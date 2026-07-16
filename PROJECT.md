# NexCard — Digital Name Card Platform

## Overview
NexCard is a multi-template, multi-tenant digital name card platform. Users create professional profiles using premium templates, share them via unique URLs, and generate QR codes. The platform supports a full payment and approval workflow for premium templates.

## Tech Stack
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript
- **Database:** MySQL via Prisma ORM
- **Styling:** Tailwind CSS + CSS custom properties (theme system)
- **Auth:** Custom session-based (cookie `session_token`)
- **Deployment:** Vercel-compatible

## Architecture

### Dual-Mode Database
The app runs in two modes:
- **Real DB:** When `DATABASE_URL` is set, uses Prisma Client directly against MySQL
- **Mock DB:** When `DATABASE_URL` is absent, uses a JSON file-based in-memory database (`src/lib/db/mock-db.json`) via a Prisma-compatible Proxy

### Theme System
- Two themes: `.nc-dark` (gold/black) and `.nc-light` (navy blue/white)
- Managed by `ThemeProvider` in `src/lib/theme/theme-context.tsx`
- All colors defined as CSS variables under `.nc-dark` and `.nc-light` in `globals.css`
- Utility classes: `.nc-input`, `.nc-card`, `.nc-btn-brand`, `.nc-btn-ghost`

### Key Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Auth pages |
| `/{slug}` | Public | Profile render engine (template-specific) |
| `/p/{slug}` | Public | QR-scanned profile landing |
| `/dashboard` | Protected | User workspace — profile listing |
| `/dashboard/onboarding` | Protected | 5-step onboarding wizard |
| `/dashboard/edit/{slug}` | Protected | Profile content editor |
| `/dashboard/qr/{slug}` | Protected | QR code manager |
| `/dashboard/analytics` | Protected | Profile analytics |
| `/admin` | Admin | Overview dashboard |
| `/admin/payments` | Admin | Payment approvals |
| `/admin/users` | Admin | User management |
| `/admin/templates` | Admin | Template catalogue + pricing |
| `/admin/settings` | Admin | Platform settings |

## Database Schema

### Models
1. **User** — `id, email, name, role (ADMIN/USER), status, hashedPassword`
2. **Session** — `id, userId, sessionToken, expires`
3. **Category** — `id, name, slug, description, sortOrder, isActive`
4. **Template** — `id, categoryId, codeIdentifier, name, thumbnailUrl, isPremium, priceQrOnly, priceNfcCard, priceNfcQr`
5. **UserProfile** — `id, userId, categoryId, templateId, slug, isPublished, paymentStatus, dynamicJsonData (JSON), viewCount, qrScanCount`
6. **Payment** — `id, userId, userProfileId, tier (QR_ONLY/NFC_CARD/PHYSICAL_CARD), amount, screenshotUrl, status (PENDING/APPROVED/REJECTED), adminNote`

### Enums
- `UserRole`: ADMIN, USER
- `UserStatus`: ACTIVE, SUSPENDED, PENDING_VERIFICATION
- `PaymentTier`: QR_ONLY, NFC_CARD, PHYSICAL_CARD
- `PaymentStatus`: PENDING, APPROVED, REJECTED

## Features

### Onboarding Flow (5 steps for premium, 3 for free)
1. **Category Selection** — Digital Name Card, Portfolio, Business Ad, Wedding
2. **Template Selection** — Browse and preview templates per category
3. **Pricing Tier** (premium only) — QR Only, NFC Card, Physical Card + QR
4. **Payment Upload** (premium only) — Upload payment screenshot (MMK)
5. **Confirm Slug** — Claim public URL and lock template

### Payment Workflow
1. User selects premium template → sees pricing tiers (MMK)
2. User pays via Viber/bank transfer → uploads screenshot
3. Payment status: **PENDING** → user sees "Pending Approval" on dashboard
4. Admin reviews in `/admin/payments` → Approves or Rejects
5. On **APPROVED**: user can edit profile content
6. On **REJECTED**: user can reupload and resubmit

### Template Locking
- Template selection is **permanent** once confirmed
- `templateLocked: true` prevents template changes
- Content (name, bio, contacts, images) can always be edited
- Category + template locked after payment submission

### Admin Features
- **Payment Approvals** — Review pending payments with screenshot preview
- **Price Management** — Set QR Only, NFC Card, and Physical Card prices per template
- **User Management** — Paginated, searchable user table with status filters
- **Template Catalogue** — View all templates with usage counts

### New Templates (User Level)
Added 6 templates to Digital Name Card category:
| Template | User Level | Style | Price Range |
|----------|-----------|-------|-------------|
| Portfolio | Designers | Visual-first, project thumbnails | 12K-45K MMK |
| Minimal | Normal Users | Clean, simple contact card | Free |
| Terminal | Developers | Monospace, code aesthetic | 10K-40K MMK |
| Enterprise | SMEs | Corporate, team-focused | 15K-50K MMK |
| Executive | Businessmen | Polished networking | 15K-50K MMK |
| Founder | CEOs | Bold leadership-forward | 20K-60K MMK |

### Responsive Design
- Mobile sidebar: FAB trigger + overlay drawer (breakpoint: `lg:`)
- Onboarding: Grid columns adapt (`sm:`, `lg:`)
- Profile editor: Array field editors stack vertically on mobile
- Dashboard: 2-column grid collapses on mobile
- Admin: Pages use responsive layouts

## File Structure

```
src/
├── app/
│   ├── [slug]/page.tsx              # Public profile renderer
│   ├── p/[slug]/page.tsx            # QR landing page
│   ├── admin/
│   │   ├── page.tsx                 # Admin overview
│   │   ├── payments/page.tsx        # Payment approvals
│   │   ├── users/page.tsx           # User management
│   │   ├── templates/page.tsx       # Template catalogue
│   │   └── settings/page.tsx        # Settings
│   ├── dashboard/
│   │   ├── page.tsx                 # User workspace
│   │   ├── onboarding/page.tsx      # Onboarding wizard
│   │   ├── edit/[slug]/page.tsx     # Profile editor
│   │   ├── qr/[slug]/page.tsx       # QR manager
│   │   └── analytics/page.tsx       # Analytics
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── slug/check/route.ts
│   │   └── upload/route.ts          # File upload handler
│   └── layout.tsx
├── components/
│   ├── layout/template-shell.tsx
│   └── ui/nex-card-logo.tsx
├── lib/
│   ├── actions/
│   │   ├── profile-actions.ts       # Profile CRUD
│   │   ├── payment-actions.ts       # Payment submission
│   │   └── admin-actions.ts         # Admin approve/reject/prices
│   ├── auth/session.ts
│   ├── cache/profile-cache.ts
│   ├── db/prisma.ts                 # Dual-mode DB proxy
│   └── theme/theme-context.tsx
└── prisma/schema.prisma
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | MySQL connection string. If absent, uses mock DB |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (e.g., `http://localhost:3000`) |

## Default Accounts (Mock DB)
- **Admin:** `admin@presencecard.io` / `admin-change-me-in-prod`
- **Demo:** `demo@presencecard.io` / `demo-password-123`

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate
```
