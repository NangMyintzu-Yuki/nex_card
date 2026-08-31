# NEX CARD — Production Readiness Review & Roadmap

**Project:** NexCard (NEX CARD Platform)  
**Review Date:** July 14, 2026  
**Stack:** Next.js 15 · React 19 · TypeScript · Prisma · MySQL · Tailwind CSS  
**Scope:** Full codebase audit — bugs, performance, SEO, security, testing, and production roadmap

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What This Project Does](#2-what-this-project-does)
3. [Architecture Overview](#3-architecture-overview)
4. [Bugs Found & Fixed (This Review)](#4-bugs-found--fixed-this-review)
5. [Remaining Issues & Risks](#5-remaining-issues--risks)
6. [Module-by-Module Review](#6-module-by-module-review)
7. [Performance Analysis & Recommendations](#7-performance-analysis--recommendations)
8. [SEO Analysis & Recommendations](#8-seo-analysis--recommendations)
9. [Security Audit](#9-security-audit)
10. [Testing Gaps](#10-testing-gaps)
11. [Production Roadmap](#11-production-roadmap)
12. [Environment & Deployment Checklist](#12-environment--deployment-checklist)
13. [Priority Action Matrix](#13-priority-action-matrix)

---

## 1. Executive Summary

NEX CARD is a **well-structured, production-oriented** multi-tenant digital presence platform. It supports 20 premium templates across 4 categories (digital name cards, portfolios, business pages, wedding invitations), with QR code generation, ISR caching, admin panel, and Cloudflare R2 image uploads.

### Overall Grade: **B+ (Good foundation, needs hardening before launch)**

| Area | Score | Status |
|------|-------|--------|
| Architecture | A- | Clean App Router structure, good separation of concerns |
| Code Quality | B+ | TypeScript + Zod validation; some `any` casts remain |
| Security | C+ | Critical auth bug fixed; session management needs hardening |
| Performance | B | ISR in place; bundle size and caching need optimization |
| SEO | B- | Metadata exists; sitemap/robots added; missing structured data |
| Testing | C | Only validators/utils tested; no E2E or API tests |
| DevOps | D+ | No CI/CD, Docker, or monitoring configured |
| Feature Completeness | B- | NFC advertised but not implemented |

### Critical Fixes Applied in This Review

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Wedding templates rendered Business Ad components on `/[slug]` | **CRITICAL** | ✅ Fixed |
| 2 | `verifyPassword()` used SHA-256 instead of bcrypt | **CRITICAL** | ✅ Fixed |
| 3 | Passwords logged to console in login API | **HIGH** | ✅ Fixed |
| 4 | Draft profiles returned 404 instead of draft UI | **HIGH** | ✅ Fixed |
| 5 | Profile cache bypassed entirely (no ISR benefit) | **MEDIUM** | ✅ Fixed |
| 6 | Missing `robots.txt` and `sitemap.xml` | **MEDIUM** | ✅ Added |
| 7 | Duplicate dead auth route files in `lib/auth/` | **LOW** | ✅ Removed |
| 8 | Seed used SHA-256 instead of bcrypt | **MEDIUM** | ✅ Fixed |
| 9 | Missing `.env.example` | **LOW** | ✅ Added |
| 10 | Inconsistent branding (NEX CARD) in SEO | **LOW** | ✅ Partially fixed |

---

## 2. What This Project Does

### Core Product
A SaaS platform where users create **shareable digital identity pages** with:
- **20 templates** across 4 categories
- **Custom URL slugs** (`www.nexcard.wetechmm.com/your-name`)
- **QR code generation** with permanent template lock
- **Separate QR route** (`/p/slug`) for scan analytics
- **Profile editor** with category-specific Zod validation
- **Admin panel** for user/template management
- **Image uploads** via Cloudflare R2 presigned URLs
- **Dynamic OG images** for social sharing

### User Flows
```
Register → Onboarding (category → template → slug) → Editor → Publish → Share (link/QR)
```

### Tech Decisions (Good Choices)
- **Next.js App Router** with Server Components for profile rendering
- **ISR (3600s)** with tag-based `revalidateTag` on profile saves
- **Polymorphic JSON** (`dynamicJsonData`) typed at application layer via Zod
- **Cookie-based sessions** with HttpOnly, Secure, SameSite flags
- **Standalone output** for container deployment

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  Marketing │ Auth │ Dashboard │ Admin │ Public Profiles │ QR    │
└──────┬──────────┬──────────┬─────────┬───────────┬─────────────┘
       │          │          │         │           │
┌──────▼──────────▼──────────▼─────────▼───────────▼─────────────┐
│                    Next.js 15 App Router                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Middleware  │  │ Server       │  │ API Routes             │ │
│  │ (edge auth) │  │ Actions      │  │ auth, upload, og, qr   │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Profile Render Engine — 20 template components              ││
│  │ ISR cache (3600s) + revalidateTag on save                   ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Prisma ORM → MySQL    │
              │   (6 models)            │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Cloudflare R2 (CDN)   │
              │   Image uploads         │
              └─────────────────────────┘
```

### Database Models
| Model | Purpose |
|-------|---------|
| `User` | Accounts with role (ADMIN/USER) and status |
| `Session` | 30-day cookie sessions |
| `Category` | 4 template categories |
| `Template` | 20 design templates |
| `UserProfile` | Polymorphic profile with JSON data, SEO, QR lock |

### Key Constraints
- One profile per user per category (`@@unique([userId, categoryId])`)
- Template locked after onboarding save
- QR permanently locks template/category after first generation

---

## 4. Bugs Found & Fixed (This Review)

### 4.1 CRITICAL: Wedding Template Switch Bug

**File:** `src/app/[slug]/page.tsx` — `WeddingSwitch` component

**Problem:** The wedding invitation category was rendering **Business Advertisement** templates (Marquee, District, Empire, Neon, Vault) instead of wedding templates (Eternal, Blossom, Noir, Celestial, Rustic). This was a copy-paste error.

**Impact:** 100% of wedding invitation profiles on the main public route showed completely wrong templates.

**Fix:** Replaced `TEMPLATE_IDS.BUSINESS_AD.*` with `TEMPLATE_IDS.WEDDING.*` and correct wedding component imports.

> Note: The QR route (`/p/[slug]/page.tsx`) had the correct wedding switch — only the main route was broken.

---

### 4.2 CRITICAL: Password Verification Mismatch

**File:** `src/lib/auth/hash.ts`

**Problem:** `hashPassword()` used bcrypt, but `verifyPassword()` compared SHA-256 hashes. New registrations (bcrypt) could never log in.

**Fix:** `verifyPassword()` now uses `bcrypt.compare()` for bcrypt hashes, with backward-compatible SHA-256 fallback for legacy seed data.

---

### 4.3 HIGH: Password Logging in Production

**File:** `src/app/api/auth/login/route.ts`

**Problem:** `console.log` statements logged user objects, plaintext passwords, and password hashes.

**Fix:** All debug logging removed.

---

### 4.4 HIGH: Draft Profiles Showed 404

**File:** `src/lib/cache/profile-cache.ts`

**Problem:** `getProfileBySlug()` filtered `isPublished: true`, so draft profiles returned `null` → 404 instead of the intended "Profile is a Draft" UI.

**Fix:** Fetch all profiles by slug; cache only published profiles via `unstable_cache` with per-slug tags.

---

### 4.5 MEDIUM: ISR Cache Not Working

**File:** `src/lib/cache/profile-cache.ts`

**Problem:** `getCachedProfileBySlug` was defined with `unstable_cache` but `getProfileBySlug` bypassed it with a direct Prisma query on every request.

**Fix:** Published profiles now use `unstable_cache` with slug-specific keys and `revalidateTag` support.

---

## 5. Remaining Issues & Risks

### 5.1 High Priority (Fix Before Launch)

| Issue | Location | Risk |
|-------|----------|------|
| **NFC feature advertised but not implemented** | Landing page, analytics UI | False advertising; user trust |
| **No session cleanup/expiry cron** | `sessions` table | DB bloat; stale sessions |
| **No rate limiting on auth APIs** | `/api/auth/login`, `/api/auth/register` | Brute force attacks |
| **No email verification** | Register flow | Spam accounts |
| **Missing `public/` folder** | Favicon, OG default image | Broken icons in browser/tab |
| **Branding inconsistency** | 50+ files reference "NexCard" | SEO confusion, brand dilution |
| **No Content-Security-Policy header** | `next.config.ts` | XSS vulnerability surface |
| **`fileSize` validated but not enforced on upload** | `/api/upload` | Storage abuse via direct R2 PUT |
| **Admin has no audit log** | Admin actions | No accountability trail |
| **No ESLint in devDependencies** | `package.json` | `npm run lint` fails |

### 5.2 Medium Priority

| Issue | Location | Risk |
|-------|----------|------|
| All 20 templates bundled in profile page | `[slug]/page.tsx` imports | Large JS bundle per request |
| `viewCount` uses BigInt | Prisma schema | Serialization issues in JSON APIs |
| Mock DB mode in production risk | `lib/db/prisma.ts` | Data loss if `DATABASE_URL` unset |
| No image deletion on account delete | `account-actions.ts` | Orphaned R2 objects |
| QR route `/p/` disallowed in robots.txt | `robots.ts` | May be intentional for duplicate content |
| No `loading.tsx` for marketing page | `app/page.tsx` | Layout shift on slow connections |
| Wedding templates use `as any` in business switch | Type safety gaps | Runtime errors |

### 5.3 Low Priority

| Issue | Location |
|-------|----------|
| Useless redirect `/admin` → `/admin` | `next.config.ts` |
| `metadata.json` references Gemini API (unused) | Root |
| `src/app/data.ts` is commented legacy code | Dead code |
| No `prettier` in CI format check | DevOps |
| Session has no CSRF protection on server actions | Security |

---

## 6. Module-by-Module Review

### 6.1 Authentication (`src/lib/auth/`, `src/app/api/auth/`)

| Aspect | Assessment |
|--------|------------|
| Password hashing | ✅ bcrypt (12 rounds) after fix |
| Session management | ⚠️ Custom cookies; no rotation, no device tracking |
| Middleware protection | ✅ Dashboard/admin guarded at edge |
| Admin role check | ✅ Double-gated (middleware + layout) |
| Logout | ✅ Clears cookie + deletes session row |

**Recommendations:**
- Migrate to NextAuth.js v5 or Lucia for production auth
- Add rate limiting (e.g., `@upstash/ratelimit`)
- Implement session expiry cleanup job
- Add CSRF tokens for state-changing operations
- Force password re-hash on login for legacy SHA-256 users

---

### 6.2 Profile Rendering (`src/app/[slug]/`, `src/app/p/[slug]/`)

| Aspect | Assessment |
|--------|------------|
| ISR caching | ✅ 3600s revalidate + tag purge |
| Template switching | ✅ Fixed wedding bug; type-safe switches |
| Metadata/OG | ✅ Per-profile SEO fields |
| View counting | ✅ Fire-and-forget (non-blocking) |
| Error handling | ⚠️ Zod parse failure → 500 (acceptable) |
| Bundle size | ⚠️ All 20 templates statically imported |

**Recommendations:**
- Use `next/dynamic()` for template components (category-level splitting)
- Add JSON-LD structured data per profile type
- Add `generateStaticParams` fallback for DB connection failures at build time

---

### 6.3 Dashboard & Editor (`src/app/dashboard/`)

| Aspect | Assessment |
|--------|------------|
| Onboarding flow | ✅ Category → template → slug |
| Profile editor | ✅ Zod-validated JSON save |
| QR manager | ✅ Lock mechanism works |
| Analytics | ⚠️ Shows NFC count (not implemented) |
| Settings | ✅ Password change, export, delete |

**Recommendations:**
- Add autosave with debounce in editor
- Add profile preview iframe before publish
- Remove or implement NFC analytics metric

---

### 6.4 Admin Panel (`src/app/admin/`)

| Aspect | Assessment |
|--------|------------|
| Role gating | ✅ ADMIN only |
| User management | ✅ Suspend/activate toggle |
| Template management | ✅ Enable/disable toggle |
| Stats dashboard | ✅ Basic counts |

**Recommendations:**
- Add audit log table for admin actions
- Add pagination for user list (will break at scale)
- Add bulk operations (suspend multiple users)

---

### 6.5 API Routes (`src/app/api/`)

| Route | Auth | Validation | Notes |
|-------|------|------------|-------|
| `POST /api/auth/login` | Public | Zod ✅ | Fixed password logging |
| `POST /api/auth/register` | Public | Zod ✅ | No email verification |
| `POST /api/auth/logout` | Cookie | ✅ | Clean |
| `GET /api/slug/check` | Public | ✅ | Reserved slug list |
| `POST /api/upload` | Session | Zod ✅ | No post-upload size verify |
| `GET /api/qr/[slug]` | Public | ✅ | SVG/PNG generation |
| `GET /api/og` | Public | ✅ | Dynamic OG images |
| `GET /api/export/data` | Session | ✅ | JSON export |
| `POST /api/revalidate` | Secret | Zod ✅ | ISR webhook |

---

### 6.6 Templates (`src/components/templates/`)

| Category | Templates | Quality |
|----------|-----------|---------|
| Digital Name Card | Aurora, Obsidian, Prism, Coral, Titanium | ✅ Polished |
| Portfolio | Canvas, Studio, Forge, Spectrum, Blueprint | ✅ Polished |
| Business Ad | Marquee, District, Empire, Neon, Vault | ✅ Polished |
| Wedding | Eternal, Blossom, Noir, Celestial, Rustic | ✅ Polished (now reachable) |

**Recommendations:**
- Audit all templates for accessibility (ARIA labels, contrast ratios)
- Add `loading="lazy"` on all gallery images
- Ensure all external links use `rel="noopener noreferrer"`

---

### 6.7 Database (`prisma/`)

| Aspect | Assessment |
|--------|------------|
| Schema design | ✅ Well-indexed, proper relations |
| Migrations | ⚠️ One raw SQL migration; use Prisma migrate in prod |
| Seed data | ✅ Comprehensive (4 categories × 5 templates) |
| JSON column | ✅ Typed via Zod at app layer |

**Recommendations:**
- Add `nfcWriteCount` column if NFC is planned
- Add `AuditLog` model for admin actions
- Add `EmailVerificationToken` model
- Consider read replicas for profile page queries at scale

---

### 6.8 Storage (`src/lib/storage/r2-upload.ts`)

| Aspect | Assessment |
|--------|------------|
| Presigned URLs | ✅ 5-minute expiry |
| Folder structure | ✅ Per-user paths |
| Content type validation | ✅ Image types only |

**Recommendations:**
- Add post-upload verification (HEAD request to check size)
- Implement image deletion on profile/account delete
- Add image optimization pipeline (resize, WebP conversion)

---

## 7. Performance Analysis & Recommendations

### Current Performance Features ✅
- ISR with 3600s revalidation on public profiles
- Tag-based cache invalidation on profile save
- Fire-and-forget view count (non-blocking TTFB)
- Image optimization via Next.js (`avif`, `webp` formats)
- Static asset caching (31536000s immutable)
- `compress: true` in Next.js config
- Google Fonts with `display: swap`

### Performance Issues ⚠️

| Issue | Impact | Fix |
|-------|--------|-----|
| 20 templates statically imported in `[slug]/page.tsx` | ~500KB+ server bundle per profile route | Dynamic imports per category |
| No `loading.tsx` skeleton on all routes | CLS on navigation | Add loading states |
| `generateStaticParams` hits DB at build | Build fails without DB | Add try/catch fallback |
| Profile page double DB fetch (metadata + render) | 2 queries per page view | Combine or use React `cache()` |
| No CDN for API routes (OG, QR) | Server load on every share | Cache OG images in R2 |
| BigInt serialization in export API | Potential JSON errors | Convert to Number in API response |

### Performance Roadmap

```
Phase 1 (Now):
  ├── Dynamic import templates by category (4 chunks instead of 20)
  ├── Add React cache() wrapper for getProfileBySlug
  └── Add generateStaticParams try/catch

Phase 2 (Pre-launch):
  ├── Pre-generate and cache OG images in R2 on profile save
  ├── Add Redis/Upstash for session + rate limit caching
  └── Lighthouse audit all 20 templates (target 90+ score)

Phase 3 (Post-launch):
  ├── Edge middleware for geo-routing
  ├── Database connection pooling (PgBouncer equivalent for MySQL)
  └── CDN cache headers on public profile HTML
```

---

## 8. SEO Analysis & Recommendations

### Current SEO Features ✅
- Per-profile `metaTitle`, `metaDescription`, `ogImageUrl`
- `generateMetadata()` on public profile routes
- Dynamic OG image generation (`/api/og`)
- `robots.txt` (added in this review)
- `sitemap.xml` with all published profiles (added in this review)
- Canonical URLs on profile pages
- `robots: { index: isPublished }` — drafts not indexed
- Root layout metadata with keywords

### SEO Issues ⚠️

| Issue | Impact | Priority |
|-------|--------|----------|
| No JSON-LD structured data | Missing rich snippets in Google | HIGH |
| No `hreflang` for i18n | Limits international reach | LOW (if English-only) |
| `/p/[slug]` creates duplicate content with `/[slug]` | SEO cannibalization | MEDIUM |
| Missing favicon files (`public/` folder empty) | Broken tab icons | HIGH |
| Inconsistent brand in metadata (NexCard remnants) | Brand confusion | MEDIUM |
| No blog/content pages | No organic traffic funnel | MEDIUM (long-term) |
| Landing page has no structured data (Organization) | Missing knowledge panel | MEDIUM |

### SEO Roadmap

```
Phase 1 (Now — Done):
  ✅ robots.ts
  ✅ sitemap.ts
  ✅ Fix metadata branding on profile pages

Phase 2 (Pre-launch):
  ├── Add JSON-LD per profile type:
  │     • Person schema (name card, portfolio)
  │     • LocalBusiness schema (business ad)
  │     • Event schema (wedding invitation)
  ├── Add Organization + WebSite schema on landing page
  ├── Create public/ folder with favicon, apple-touch-icon, default-og.png
  ├── Set canonical on /p/[slug] → /[slug] (QR route points to main)
  └── Add <link rel="preconnect"> for R2 CDN domain

Phase 3 (Post-launch):
  ├── Google Search Console integration
  ├── Template gallery page (indexable, targets "digital business card" keywords)
  ├── Blog with SEO content ("how to create digital name card", etc.)
  └── Per-template landing pages for long-tail SEO
```

### Recommended JSON-LD Example (Digital Name Card)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alex Rivera",
  "jobTitle": "Senior Product Designer",
  "worksFor": { "@type": "Organization", "name": "Rivera Design Co." },
  "url": "https://www.nexcard.wetechmm.com/alex-rivera",
  "image": "https://cdn.www.nexcard.wetechmm.com/avatars/alex.jpg",
  "sameAs": ["https://linkedin.com/in/alexrivera"]
}
```

---

## 9. Security Audit

### Passed ✅
- HttpOnly session cookies
- Secure flag in production
- SameSite=Lax on cookies
- Password hashing with bcrypt (12 rounds)
- Zod validation on all API inputs
- Admin role double-gated
- Revalidation webhook secret-protected
- Reserved slug list prevents route hijacking
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `poweredByHeader: false`

### Failed / Needs Attention ❌

| Vulnerability | Severity | Recommendation |
|---------------|----------|----------------|
| No rate limiting on login/register | HIGH | Add Upstash rate limit (5 attempts/min) |
| No CSRF protection | MEDIUM | Next.js Server Actions have built-in protection; verify API routes |
| No Content-Security-Policy | MEDIUM | Add CSP header in `next.config.ts` |
| Session tokens never rotated | MEDIUM | Rotate on privilege change |
| No input sanitization on JSON profile data | MEDIUM | Sanitize HTML in bio/description fields |
| `fileSize` not enforced post-upload | MEDIUM | Verify Content-Length on R2 object |
| Mock DB fallback in production | HIGH | Fail hard if `DATABASE_URL` missing in prod |
| No HTTPS enforcement | HIGH | Add redirect in middleware for production |
| Debug `console.log` was in login (fixed) | HIGH | ✅ Fixed |
| No SQL injection risk (Prisma ORM) | N/A | ✅ Safe |

### Security Roadmap

```
Immediate:
  ├── Add rate limiting to /api/auth/*
  ├── Fail startup if DATABASE_URL missing in NODE_ENV=production
  └── Add CSP header

Pre-launch:
  ├── Penetration test auth flow
  ├── Add helmet-style security headers (HSTS, etc.)
  ├── Implement account lockout after N failed logins
  └── Add request logging (without PII)

Post-launch:
  ├── SOC 2 compliance assessment
  ├── Bug bounty program
  └── Regular dependency audits (npm audit, Snyk)
```

---

## 10. Testing Gaps

### Current Coverage
| Area | Tests | Status |
|------|-------|--------|
| Zod validators (4 categories) | 25 tests | ✅ Passing |
| Utility functions | 37 tests | ✅ Passing |
| Password hash/verify | 2 tests | ✅ Added |
| **Total** | **64 tests** | ✅ All passing |

### Not Tested ❌
| Area | Risk | Recommended Tool |
|------|------|------------------|
| API routes (auth, upload, QR) | HIGH | Vitest + supertest |
| Server Actions | HIGH | Vitest integration tests |
| Template rendering | MEDIUM | React Testing Library |
| Middleware auth flow | HIGH | Vitest |
| E2E user flows | HIGH | Playwright |
| Profile page ISR/cache | MEDIUM | Vitest with mocked cache |
| Admin role enforcement | HIGH | Integration test |

### Testing Roadmap

```
Phase 1: Unit tests for auth, session, profile-cache
Phase 2: API integration tests (login, register, slug check)
Phase 3: Playwright E2E (register → onboard → publish → view)
Phase 4: Visual regression tests for all 20 templates
Phase 5: Load testing (k6) — 1000 concurrent profile views
```

---

## 11. Production Roadmap

### Phase 0: Critical Fixes (Week 1) — ✅ COMPLETE
- [x] Fix wedding template switch bug
- [x] Fix password verification (bcrypt)
- [x] Remove password logging
- [x] Fix profile cache / draft profile handling
- [x] Add robots.txt and sitemap.xml
- [x] Add .env.example
- [x] Fix seed bcrypt hashing
- [x] Remove duplicate auth routes

### Phase 1: Pre-Launch Hardening (Weeks 2–3)

**Security**
- [ ] Add rate limiting on auth endpoints
- [ ] Add CSP and HSTS headers
- [ ] Fail hard without DATABASE_URL in production
- [ ] Install ESLint and fix all lint errors
- [ ] Run `npm audit` and patch vulnerabilities

**SEO**
- [ ] Create `public/` folder with favicons and default OG image
- [ ] Add JSON-LD structured data to profile pages
- [ ] Unify branding to "NEX CARD" across all files
- [ ] Set canonical from `/p/[slug]` → `/[slug]`

**Performance**
- [ ] Dynamic import templates by category
- [ ] Add React `cache()` for deduplicated profile fetches
- [ ] Lighthouse audit — target 90+ on all templates

**Testing**
- [ ] Auth flow integration tests
- [ ] Playwright E2E: full user journey
- [ ] Admin role enforcement tests

### Phase 2: Launch Ready (Weeks 4–5)

**DevOps**
- [ ] Dockerfile + docker-compose for local/staging
- [ ] GitHub Actions CI (lint → type-check → test → build)
- [ ] Staging environment with MySQL + R2
- [ ] Error monitoring (Sentry)
- [ ] Uptime monitoring (Better Uptime / Pingdom)

**Features**
- [ ] Email verification flow
- [ ] Password reset via email
- [ ] Session cleanup cron job
- [ ] Remove NFC references OR implement NFC write tracking

**Content**
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent banner (GDPR)

### Phase 3: Growth (Months 2–3)

- [ ] Custom domain support (CNAME → user profiles)
- [ ] Premium template paywall (Stripe integration)
- [ ] Analytics dashboard v2 (charts, date ranges, export)
- [ ] Template gallery public page (SEO landing)
- [ ] Blog/content marketing pages
- [ ] i18n support (Myanmar, Thai, etc.)
- [ ] Mobile app (React Native) or PWA
- [ ] vCard download button on name card templates
- [ ] Webhook notifications on profile views

### Phase 4: Scale (Months 4–6)

- [ ] Multi-region deployment
- [ ] Read replicas for profile queries
- [ ] Redis cache layer
- [ ] Image optimization pipeline
- [ ] Team/organization accounts
- [ ] API for third-party integrations
- [ ] White-label reseller program

---

## 12. Environment & Deployment Checklist

### Required Environment Variables

```bash
DATABASE_URL=mysql://user:pass@host:3306/nexcard     # REQUIRED in prod
NEXT_PUBLIC_APP_URL=https://www.nexcard.wetechmm.com                # REQUIRED
REVALIDATION_SECRET=<random-32-byte-hex>              # REQUIRED
R2_ACCOUNT_ID=<cloudflare-account-id>                 # For uploads
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET_NAME=nexcard-uploads
R2_PUBLIC_URL=https://cdn.www.nexcard.wetechmm.com
NODE_ENV=production
```

### Pre-Deploy Checklist

```
□ DATABASE_URL set and tested
□ NEXT_PUBLIC_APP_URL matches production domain
□ REVALIDATION_SECRET is unique and secure
□ R2 bucket created with CORS configured
□ R2 public URL points to CDN
□ npm run db:migrate:prod executed
□ npm run db:seed executed (first deploy only)
□ npm run build succeeds without errors
□ npm test passes (64+ tests)
□ npm run type-check passes
□ SSL certificate configured
□ DNS pointing to deployment server
□ Admin password changed from seed default
□ Demo accounts removed or disabled
□ Sentry/monitoring configured
□ Backup strategy for MySQL defined
```

### Recommended Deployment Stack

| Component | Recommendation |
|-----------|----------------|
| Hosting | Vercel (easiest) or Docker on VPS/Cloud |
| Database | PlanetScale, AWS RDS MySQL, or DigitalOcean Managed MySQL |
| Storage | Cloudflare R2 (already integrated) |
| CDN | Cloudflare (in front of app + R2) |
| DNS | Cloudflare |
| Monitoring | Sentry + Better Uptime |
| CI/CD | GitHub Actions |

---

## 13. Priority Action Matrix

```
                        IMPACT
                 Low    Medium    High
              ┌────────┬─────────┬──────────┐
        High  │ ESLint │ Branding│ Auth rate│
              │ fix    │ unify   │ limiting │
              ├────────┼─────────┼──────────┤
EFFORT Medium │ Dead   │ JSON-LD │ Dynamic  │
              │ code   │ schema  │ imports  │
              │ cleanup│         │          │
              ├────────┼─────────┼──────────┤
        Low   │ metadata│ Favicon│ CI/CD    │
              │ .json  │ public/ │ pipeline │
              └────────┴─────────┴──────────┘

Legend:
  🔴 Do immediately (top-right)
  🟡 Do before launch (middle)
  🟢 Do post-launch (bottom-left)
```

### Top 10 Actions (Ordered by Priority)

1. **Re-seed database** with bcrypt passwords (`npm run db:seed`)
2. **Add rate limiting** to `/api/auth/login` and `/api/auth/register`
3. **Create `public/` folder** with favicon, apple-touch-icon, default-og.png
4. **Unify branding** — global find/replace PresenceCard → NEX CARD
5. **Add JSON-LD** structured data to profile pages
6. **Dynamic import** template components by category
7. **Set up CI/CD** — GitHub Actions with lint, test, build
8. **Add Playwright E2E** tests for critical user flows
9. **Remove or implement NFC** feature references
10. **Add email verification** before allowing profile creation

---

## Appendix A: File Inventory

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/app/` | 45+ | Pages, layouts, API routes |
| `src/components/templates/` | 21 | 20 templates + QR badge |
| `src/components/ui/` | 9 | Shared UI primitives |
| `src/lib/actions/` | 4 | Server Actions |
| `src/lib/auth/` | 2 | Session + hash (routes removed) |
| `src/lib/cache/` | 1 | ISR cache layer |
| `src/lib/validators/` | 1 | Zod schemas |
| `src/tests/` | 4 | Unit tests |
| `prisma/` | 3 | Schema, seed, migration |

**Total source files:** ~113

---

## Appendix B: Demo Credentials

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nexcard.wetechmm.com` | `admin-change-me-in-prod` |
| User | `demo@nexcard.wetechmm.com` | `demo-password-123` |
| Demo Profile | — | `http://localhost:3000/alex-rivera` |

> ⚠️ Change all passwords before production deployment.

---

*This document was generated as part of a comprehensive production readiness review. Re-run after each major release to keep it current.*
