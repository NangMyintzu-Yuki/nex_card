# NEX CARD — Digital Name Card Platform

**Multi-Template Multi-Tenant Digital Presence Platform**
Next.js 15 (App Router) · React 19 · TypeScript · Prisma ORM · MySQL · Tailwind CSS

---

## Overview

NEX CARD is a platform where users create shareable digital identity pages using premium templates, share them via unique URLs, and generate QR codes. Premium templates require a one-time payment (in MMK) with a screenshot-proof workflow reviewed by an admin.

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in DATABASE_URL, NEXT_PUBLIC_APP_URL, REVALIDATION_SECRET, STORAGE_DRIVER (see .env.example)

# 3. Database
npm run db:generate     # generate Prisma client
npm run db:migrate:prod # apply migrations (production) / npm run db:migrate (dev)
npm run db:seed         # seed categories, templates, demo users

# 4. Dev server
npm run dev             # → http://localhost:3000
```

**Demo credentials** (after `npm run db:seed`)
- Admin: `admin@www.nexcard.wetechmm.com` / `admin-change-me-in-prod`
- User:  `demo@www.nexcard.wetechmm.com`  / `demo-password-123`

> Change all passwords before production deployment.

**Full setup guide:** see [DEPLOYMENT_AND_OPERATIONS.md](./DEPLOYMENT_AND_OPERATIONS.md) for local dev, server deploy, CI/CD, file storage, NFC, and production checklist.

---

## Project Details — End-to-End Flow

### 1. Authentication
- Cookie-based sessions (`session_token`), HttpOnly + Secure + SameSite=Lax.
- Login redirects `ADMIN` → `/admin`; `USER` → `/dashboard`.
- Middleware guards `/dashboard` and `/admin` at the edge; admin pages are double-gated (middleware + layout).

### 2. Onboarding (premium templates)
```
Register → /dashboard/onboarding
  1. Category selection      (Digital Name Card / Portfolio / Business Ad / Wedding)
  2. Template selection      (premium templates show pricing tiers)
  3. Pricing tier selection  (QR Only / NFC Only / NFC + QR)
  4. Payment upload          (upload screenshot of bank/Viber transfer in MMK)
  5. Confirm slug            (claims public URL, locks template)
```
Free templates skip steps 3–4.

### 3. Payment Tiers & Pricing
Pricing is per-template (configurable by admin) in MMK:

| Tier | `Template` column | Description |
|------|-------------------|-------------|
| **QR_ONLY** | `priceQrOnly` | QR code only |
| **NFC_CARD** | `priceNfcCard` | NFC card (device-dependent; requires NFC-capable phone) |
| **PHYSICAL_CARD** | `priceNfcQr` | NFC + QR combo with QR fallback |

### 4. Payment Submission & Review Flow
```
User selects template + tier → uploads screenshot
  → POST /api/upload (returns path, e.g. /uploads/payments/..)
  → submitPaymentAction():
       • validates profile ownership + premium template
       • verifies submitted amount matches template price for tier
       • creates Payment (status=PENDING) + sets UserProfile.paymentStatus=PENDING
       • (Real DB) wrapped in $transaction; (Mock DB) sequential writes

Admin → /admin/payments (filter: Pending / Approved / Rejected)
  → Approve  → Payment.status=APPROVED, UserProfile.paymentStatus=APPROVED
               → user may now edit profile content
  → Reject   → Payment.status=REJECTED (+ optional adminNote),
               UserProfile.paymentStatus=REJECTED
               → user sees "Resubmit Payment" on dashboard

User dashboard:
  • paymentStatus=PENDING   → "Pending Approval"
  • paymentStatus=APPROVED  → profile editable
  • paymentStatus=REJECTED  → "Resubmit Payment" (re-uploads + resubmits)
```

Key files:
- `src/lib/actions/payment-actions.ts` — `submitPaymentAction`, `getPaymentForProfile`
- `src/app/dashboard/_components/resubmit-payment.tsx` — submit/resubmit modal
- `src/app/admin/payments/page.tsx` + `_components/approve-reject-buttons.tsx`
- `src/lib/actions/admin-actions.ts` — `approvePaymentAction`, `rejectPaymentAction`

### 5. Template Locking
- `templateLocked: true` once onboarding is confirmed — template/category frozen.
- `qrLocked: true` after first QR generation.
- Profile **content** (name, bio, contacts, images) is always editable after approval.

### 6. QR & Sharing
- Public profile: `/{slug}` (ISR 3600s, `revalidateTag("profile:{slug}")`).
- QR route: `/p/{slug}` tracks `qrScanCount` independently.

---

## Database Schema

Six models: `User`, `Session`, `Category`, `Template`, `UserProfile`, `Payment`.

| Model | Key columns |
|-------|-------------|
| `User` | `email`, `role (ADMIN/USER)`, `status (ACTIVE/SUSPENDED/PENDING_VERIFICATION)`, `hashedPassword` |
| `Template` | `codeIdentifier`, `isPremium`, `priceQrOnly`, `priceNfcCard`, `priceNfcQr` |
| `UserProfile` | `slug` (unique), `templateLocked`, `qrLocked`, `paymentStatus`, `viewCount (BigInt)`, `dynamicJsonData (JSON)` |
| `Payment` | `userProfileId` (unique), `tier (QR_ONLY/NFC_CARD/PHYSICAL_CARD)`, `amount`, `screenshotUrl`, `status (PENDING/APPROVED/REJECTED)`, `adminNote`, `reviewedBy` |

**Enums**
- `PaymentTier`: `QR_ONLY`, `NFC_CARD`, `PHYSICAL_CARD`
- `PaymentStatus`: `PENDING`, `APPROVED`, `REJECTED`

**Design notes**
- `viewCount`/`qrScanCount` are `BigInt` (converted to `Number` before `unstable_cache` serialization).
- `UNIQUE(userId, categoryId)` — one profile per category per user.
- Migration `0002_rename_price_physical_to_nfcqr` renamed `pricePhysical` → `priceNfcQr`.

---

## Key Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Auth pages |
| `/{slug}` | Public | Profile render engine |
| `/p/{slug}` | Public | QR-scanned profile landing |
| `/dashboard` | Protected | User workspace — profile listing + payment status |
| `/dashboard/onboarding` | Protected | Category → template → tier → payment → slug |
| `/dashboard/edit/{slug}` | Protected | Profile content editor |
| `/dashboard/qr/{slug}` | Protected | QR code manager |
| `/dashboard/nfc` | Protected | NFC tag programming hub |
| `/dashboard/nfc/{slug}` | Protected | NFC programming guide per profile |
| `/admin` | Admin | Overview |
| `/admin/payments` | Admin | Payment approvals |
| `/admin/users` | Admin | User management |
| `/admin/templates` | Admin | Template catalogue + pricing |
| `/api/upload` | Session | Image uploads via FormData (all storage drivers) |
| `/api/slug/check` | Public | Slug availability |
| `/api/revalidate` | Secret | ISR cache purge (`REVALIDATION_SECRET`) |

---

## Scripts

```bash
npm run dev             # dev server (port 3000)
npm run build           # production build (prisma generate + next build)
npm run start           # start production server
npm run type-check      # tsc --noEmit
npm run lint            # eslint
npm run test            # vitest (unit + API)
npm run test:e2e        # playwright E2E smoke tests
npm run ci              # type-check + lint + test
npm run db:generate     # prisma generate
npm run db:migrate      # create + apply migration (dev)
npm run db:migrate:prod # apply migrations (production)
npm run db:seed         # seed data
```

---

## Branding

Logo lives in `src/components/ui/nex-card-logo.tsx` (exports `NexCardLogo`, `NexCardLogoStatic`, `NexCardLogoAuto`). Theme tokens: `.nc-dark` (gold/black) and `.nc-light` (navy/white) defined in `globals.css`.
