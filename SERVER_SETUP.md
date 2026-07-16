# NEX CARD — Server-Side Process & Deployment Guide

> **Full operations guide:** See [DEPLOYMENT_AND_OPERATIONS.md](./DEPLOYMENT_AND_OPERATIONS.md) for complete local + server setup, CI/CD, NFC, R2, testing, and production checklist.

This document covers everything required to run, deploy, and operate NEX CARD on the server side: environment, database, the payment approval process, and operations.

---

## 1. System Requirements

- Node.js 18.18+ (tested on Node 20+)
- MySQL 8.0+ (or compatible: PlanetScale, AWS RDS, DigitalOcean Managed MySQL)
- (Optional) Cloudflare R2 bucket for payment/profile image uploads
- Build tooling: `npm`

---

## 2. Environment Variables

Create `.env.local` (or set in your host's environment). Required in production:

```bash
# Database (REQUIRED in production — app fails to real DB mode only when set)
DATABASE_URL=mysql://user:password@host:3306/nexcard

# Public app URL (REQUIRED)
NEXT_PUBLIC_APP_URL=https://nexcard.io

# ISR revalidation webhook secret (REQUIRED)
REVALIDATION_SECRET=<random-32-byte-hex>

# Cloudflare R2 (only needed if using uploads)
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET_NAME=nexcard-uploads
R2_PUBLIC_URL=https://cdn.nexcard.io

NODE_ENV=production
```

> **Mock DB fallback:** If `DATABASE_URL` is unset, the app uses a JSON file mock DB. This must NOT be used in production — ensure `DATABASE_URL` is always set when `NODE_ENV=production`.

---

## 3. Database Setup & Migrations

```bash
# Generate Prisma client
npm run db:generate

# Apply existing migrations (production)
npm run db:migrate:prod

# First deploy only — seed categories, templates, demo accounts
npm run db:seed
```

### Schema & Migrations

- Schema: `prisma/schema.prisma` (6 models: `User`, `Session`, `Category`, `Template`, `UserProfile`, `Payment`).
- Migration `0002_rename_price_physical_to_nfcqr`: renames `pricePhysical` → `priceNfcQr` (data-preserving `ALTER` on MySQL).
- `Payment.tier` is an enum (`QR_ONLY`, `NFC_CARD`, `PHYSICAL_CARD`); `Payment.status` is (`PENDING`, `APPROVED`, `REJECTED`).
- `UserProfile.paymentStatus` mirrors the latest payment status and gates content editing.

> **Build note (Windows):** the Prisma engine rename can hit `EPERM` during `npm run build`. Kill stray Node processes first: `taskkill /F /IM node.exe`, then rebuild.

---

## 4. Build & Run

```bash
# Production build (runs prisma generate + next build)
npm run build

# Start server (standalone output supported for containers)
npm run start
```

Dev server: `npm run dev` (binds `0.0.0.0:3000`).

---

## 5. Payment Approval Process (Server Side)

This is the core server-side workflow.

### 5.1 Submission (`submitPaymentAction`)
File: `src/lib/actions/payment-actions.ts`

1. Validates session; rejects if not logged in.
2. Validates input via Zod:
   - `profileId`, `tier` (enum), `amount` (positive number), `screenshotUrl` (non-empty string — accepts the relative path returned by the upload route, e.g. `/uploads/payments/..`).
3. Confirms the profile belongs to the user and template is premium.
4. Rejects if already `APPROVED`, or if a `PENDING` payment already exists.
5. Verifies the submitted `amount` matches the template's price for the chosen tier (`priceQrOnly` / `priceNfcCard` / `priceNfcQr`), within a 0.01 tolerance.
6. Creates `Payment` (status `PENDING`) and sets `UserProfile.paymentStatus = PENDING` in a transaction (real DB) or sequential writes (mock DB).
7. `revalidatePath("/dashboard")` and `/dashboard/onboarding`.

### 5.2 Upload Route (`/api/upload`)
- Authenticated (session required).
- Accepts image (`image/jpeg`, `image/png`, `image/webp`), max 5MB.
- Returns a local relative path stored in `Payment.screenshotUrl`.

### 5.3 Admin Review (`/admin/payments`)
File: `src/app/admin/payments/page.tsx`, `src/lib/actions/admin-actions.ts`

- Admins view payments filtered by `?status=PENDING|APPROVED|REJECTED` (default PENDING).
- Each card shows the user, amount, tier label, template, category, slug, submission date, screenshot, and optional admin note.
- **Approve** → `approvePaymentAction`: sets `Payment.status=APPROVED`, `reviewedAt`, `reviewedBy`; sets `UserProfile.paymentStatus=APPROVED`. User may now edit.
- **Reject** → `rejectPaymentAction`: sets `Payment.status=REJECTED`, optional `adminNote`; sets `UserProfile.paymentStatus=REJECTED`. User may resubmit.
- Both admin actions revalidate `/admin/payments`, `/admin`, and `/dashboard`.

### 5.4 Resubmission (`ResubmitPayment`)
File: `src/app/dashboard/_components/resubmit-payment.tsx`

- When `paymentStatus=REJECTED`, the dashboard shows **"Resubmit Payment"**.
- Submitting deletes any existing `REJECTED` payment for the profile and creates a fresh `PENDING` payment with the new screenshot/tier.
- On `APPROVED`, the resubmit button is hidden and editing is enabled.

---

## 6. Authorization & Security (Server Side)

- **Middleware** guards `/dashboard` and `/admin` at the edge.
- **Admin double-gate:** middleware + per-page role check (`session.user.role !== "ADMIN"` → redirect).
- **Server Actions** verify session server-side (`getServerSession`).
- **Zod validation** on all action inputs.
- Session cookie: `HttpOnly`, `Secure` (prod), `SameSite=Lax`.

### Recommended hardening (pre-launch)
- Add rate limiting on `/api/auth/login` and `/api/auth/register`.
- Add a `Content-Security-Policy` header in `next.config.ts`.
- Enforce HTTPS redirect in middleware for production.
- Fail startup hard if `DATABASE_URL` is missing in production.
- Add session cleanup cron for expired `sessions` rows.

---

## 7. Caching & ISR

- Public profiles: `revalidate = 3600` (1 hour).
- `revalidateTag("profile:{slug}")` on every profile save.
- `revalidateTag("user-profiles:{userId}")` for dashboard lists.
- `/api/revalidate` webhook purges cache, protected by `REVALIDATION_SECRET`.
- `getCachedUserProfiles` / `fetchProfileBySync` convert `BigInt viewCount` to `Number` to avoid serialization errors in `unstable_cache`.

---

## 8. Operations & Maintenance

### Pre-deploy checklist
```
□ DATABASE_URL set and tested
□ NEXT_PUBLIC_APP_URL matches production domain
□ REVALIDATION_SECRET is unique and secure
□ R2 bucket created with CORS (if uploads used)
□ npm run db:migrate:prod executed
□ npm run db:seed executed (first deploy only)
□ npm run build succeeds
□ npm run type-check passes
□ Admin password changed from seed default
□ Demo accounts removed or disabled
□ SSL certificate configured; DNS pointed at host
□ Backup strategy for MySQL defined
```

### Useful commands
```bash
npm run db:studio        # Prisma Studio GUI
npm run db:migrate       # dev migration
npm run test             # vitest
npm run lint             # eslint
```

### Monitoring recommendations
- Error tracking: Sentry.
- Uptime: Better Uptime / Pingdom.
- CI/CD: GitHub Actions (lint → type-check → test → build).

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npm run build` fails with `EPERM` on Prisma engine | Stray node processes lock engine file | `taskkill /F /IM node.exe` then rebuild |
| Payment submit returns "Invalid payment data" | `screenshotUrl` rejected as non-URL | Use `z.string().min(1)` (already applied) |
| Admin sees user dashboard UI | Missing role redirect | Ensure login + dashboard redirect ADMIN → `/admin` |
| `viewCount` serialization error | BigInt not serializable in cache | Convert to `Number` (already applied) |
| Profile 404 after save | ISR cache not purged | Confirm `revalidateTag` called on save |
