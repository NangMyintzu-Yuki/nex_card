# NEX CARD — Local & Server Operations Guide

Complete checklist for running NEX CARD on your **local machine** and **production server**, including CI/CD, database, storage, NFC, testing, and deployment.

> **Related docs:** [README.md](./README.md) (overview) · [SERVER_SETUP.md](./SERVER_SETUP.md) (payment workflow detail) · [USER_GUIDE.md](./USER_GUIDE.md) (end-user guide)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup & Migrations](#4-database-setup--migrations)
5. [Running the App Locally](#5-running-the-app-locally)
6. [Testing (Local)](#6-testing-local)
7. [CI/CD — GitHub Actions](#7-cicd--github-actions)
8. [Production Server Setup](#8-production-server-setup)
9. [File Storage (Uploads)](#9-file-storage-uploads)
10. [NFC Module](#10-nfc-module)
11. [Domain, SSL & DNS](#11-domain-ssl--dns)
12. [Production Deploy Checklist](#12-production-deploy-checklist)
13. [Ongoing Maintenance](#13-ongoing-maintenance)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ (22 recommended) | Runtime |
| npm | 10+ | Package manager |
| MySQL | 8.0+ | Production database |
| Git | Latest | Version control |
| (Optional) Cloudflare account | — | R2 image storage |
| (Optional) GitHub account | — | CI/CD |

---

## 2. Local Development Setup

### Step 1 — Clone & install

```bash
git clone <your-repo-url> nex_card
cd nex_card
npm install
```

### Step 2 — Create environment file

```bash
cp .env.example .env.local
```

Edit `.env.local` (see [Section 3](#3-environment-variables)).

### Step 3 — Database (choose one)

**Option A — Real MySQL (recommended)**

```bash
# Create database locally
mysql -u root -p -e "CREATE DATABASE nexcard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Set in .env.local:
# DATABASE_URL="mysql://root:password@localhost:3306/nexcard"
```

**Option B — No database (mock mode only)**

Leave `DATABASE_URL` unset. The app uses a JSON file mock DB at `src/lib/db/mock-db.json`.

> Mock mode is for quick UI testing only. **Never use in production.**

### Step 4 — Initialize database

```bash
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Apply migrations (dev)
npm run db:seed            # Seed categories, templates, demo users
```

### Step 5 — Start dev server

```bash
npm run dev
# → http://localhost:3000
```

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@www.nexcard.wetechmm.com` | `admin-change-me-in-prod` |
| User | `demo@www.nexcard.wetechmm.com` | `demo-password-123` |

> Demo credentials only appear on the login page in `NODE_ENV=development`.

---

## 3. Environment Variables

Copy `.env.example` → `.env.local` (local) or set in your hosting panel (production).

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes (prod)** | MySQL connection string |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public URL, e.g. `https://www.nexcard.wetechmm.com` |
| `REVALIDATION_SECRET` | **Yes** | Secret for `/api/revalidate` webhook (≥32 chars) |
| `CRON_SECRET` | **Yes (prod)** | Bearer token for `/api/cron/cleanup-sessions` (≥32 chars) |
| `STORAGE_DRIVER` | No (default: `local`) | Laptop: `local`. Server: `r2` |
| `R2_*` | If `STORAGE_DRIVER=r2` | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` |
| `R2_PRIVATE_BUCKET` | Recommended with R2 | Separate bucket with **no** custom domain for payment proofs |
| `ALLOW_LOCAL_STORAGE` | Local / Docker only | Required if production `NODE_ENV` uses `STORAGE_DRIVER=local` |
| `CLOUDINARY_*` | If `STORAGE_DRIVER=cloudinary` | Cloudinary cloud name, API key, secret |
| `SUPABASE_*` | If `STORAGE_DRIVER=supabase` | Supabase URL, service role key, bucket |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `SMTP_USER` | **Yes (launch)** | Required so registration verification emails send. Without SMTP, new users cannot log in. |
| `NODE_ENV` | Auto | `development` / `production` / `test` |

### Generate secrets

```bash
# REVALIDATION_SECRET (Linux/macOS/Git Bash)
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Example `.env.local`

```env
DATABASE_URL="mysql://root:password@localhost:3306/nexcard"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
REVALIDATION_SECRET="your-local-dev-secret-change-in-prod"
NODE_ENV="development"
```

---

## 4. Database Setup & Migrations

### Schema location

- `prisma/schema.prisma` — source of truth
- `prisma/migrations/` — SQL migration files

### Migration history

| Migration | Description |
|-----------|-------------|
| `0001_initial_schema` | Core tables |
| `0002_rename_price_physical_to_nfcqr` | Rename price column |
| `0003_add_nfc_fields` | Add `nfcWriteCount`, `nfcProgrammedAt` |

### Commands

```bash
# Development — create + apply new migration
npm run db:migrate

# Production — apply existing migrations only
npm run db:migrate:prod

# Regenerate Prisma client after schema changes
npm run db:generate

# Seed data (first deploy or reset)
npm run db:seed

# Visual DB browser
npm run db:studio
```

### After pulling new code

```bash
npm install
npm run db:generate
npm run db:migrate:prod   # production
# or
npm run db:migrate        # local dev
```

---

## 5. Running the App Locally

```bash
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build test
npm run start        # Run production build locally
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

### Useful local URLs

| URL | Purpose |
|-----|---------|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | User workspace |
| `/dashboard/onboarding` | Create profile |
| `/dashboard/nfc` | NFC setup hub |
| `/admin` | Admin panel |
| `/demo-slug` | Public profile (after seed) |

---

## 6. Testing (Local)

### Unit + API tests (Vitest)

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run ci            # type-check + lint + test (same as CI quality job)
```

**Current coverage (90 tests):**
- Validators, utils, hash
- API routes: auth, slug, revalidate, upload, export, QR
- Server actions: profile publish gate, NFC programming

### E2E tests (Playwright)

```bash
# First time only — install browser
npx playwright install chromium

# Run E2E (starts dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

E2E tests live in `e2e/smoke.spec.ts` (landing, login, register, robots, sitemap, slug API).

---

## 7. CI/CD — GitHub Actions

### What is configured

File: `.github/workflows/ci.yml`

**Triggers:** Push/PR to `main`, `master`, `develop`

**Job 1 — Quality** (runs on every push):
1. `npm ci`
2. `prisma generate`
3. `npm run type-check`
4. `npm run lint`
5. `npm test`

**Job 2 — Build** (after quality passes):
1. Starts MySQL 8 service container
2. `npm run db:migrate:prod`
3. `npm run build`

### Setup CI on GitHub (one-time)

1. Push this repo to GitHub
2. Go to **Settings → Secrets and variables → Actions**
3. No secrets required for basic CI (test env vars are in workflow file)
4. Push to `main` — CI runs automatically

### Optional: Add production secrets for deploy workflow

If you add a deploy job later, store these as GitHub Secrets:

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | Production MySQL URL |
| `NEXT_PUBLIC_APP_URL` | `https://www.nexcard.wetechmm.com` |
| `REVALIDATION_SECRET` | Production secret |
| `R2_*` | R2 credentials |

### Run CI checks locally before pushing

```bash
npm run ci
npm run build   # optional full build test
```

---

## 8. Production Server Setup

### Option A — VPS (Ubuntu, DigitalOcean, AWS EC2, etc.)

#### 1. Server preparation

```bash
# Install Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs mysql-client git

# Clone repo
git clone <repo-url> /var/www/nexcard
cd /var/www/nexcard
```

#### 2. Environment

```bash
cp .env.example .env.local
nano .env.local   # fill all production values
```

#### 3. Build & migrate

```bash
npm ci --omit=dev          # production deps only (or npm ci for full)
npm run db:generate
npm run db:migrate:prod
npm run db:seed            # FIRST DEPLOY ONLY
npm run build
```

#### 4. Run with PM2 (recommended)

```bash
sudo npm install -g pm2
pm2 start npm --name "nexcard" -- start
pm2 save
pm2 startup                # auto-start on reboot
```

#### 5. Reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name www.nexcard.wetechmm.com www.www.nexcard.wetechmm.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Rate limits in this app are in-memory. If you run **more than one Node process**, add Nginx `limit_req` (auth is the hot path):

```nginx
limit_req_zone $binary_remote_addr zone=nexcard_auth:10m rate=10r/m;

location /api/auth/ {
    limit_req zone=nexcard_auth burst=5 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Cron (Bearer only — query `?secret=` is not accepted):

```bash
curl -X POST https://www.nexcard.wetechmm.com/api/cron/cleanup-sessions \
  -H "Authorization: Bearer $CRON_SECRET"
```

Admins must enable TOTP at `/admin/security` before other admin pages work.

```bash
sudo certbot --nginx -d www.nexcard.wetechmm.com -d www.www.nexcard.wetechmm.com
```

### Option B — Docker (standalone output)

`next.config.ts` uses `output: "standalone"`.

```dockerfile
# Example Dockerfile (create at project root if needed)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Option C — Vercel

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Use external MySQL (PlanetScale, Railway, RDS)
4. **Note:** Payment screenshot uploads to local disk won't persist — use R2 for all uploads on Vercel

### Deploy updates (VPS)

```bash
cd /var/www/nexcard
git pull
npm ci
npm run db:generate
npm run db:migrate:prod
npm run build
pm2 restart nexcard
```

---

## 9. File Storage (Uploads)

**Laptop:** `STORAGE_DRIVER=local` — gallery/avatars/logos stay in `public/uploads/`. Payment proofs go to `data/private-uploads/` (not served as static files).

**Server:** `STORAGE_DRIVER=r2` — gallery/avatars stay on the public CDN (`R2_PUBLIC_URL`). Payment proofs are **never** given a public URL; the app streams them via `GET /api/payments/proof/{paymentId}` (owner or ADMIN, `Cache-Control: private, no-store`).

A custom domain on the R2 bucket usually makes the **whole bucket** world-readable. Putting proofs under `uploads/{userId}/payments/` on that same public bucket is not enough.

### Local storage (`STORAGE_DRIVER=local`)

```env
STORAGE_DRIVER=local
ALLOW_LOCAL_STORAGE=true
NEXT_PUBLIC_APP_URL=https://www.nexcard.wetechmm.com
```

| Path | Purpose | Public? |
|------|---------|---------|
| `public/uploads/avatars/` | Profile avatars | Yes |
| `public/uploads/gallery/` | Gallery images | Yes |
| `public/uploads/logos/` | Business logos | Yes |
| `public/uploads/og-images/` | Custom OG images | Yes |
| `data/private-uploads/payments/` | Payment screenshot proofs | No — streamed via proof API |

If you still have leftover files in `public/uploads/payments/`, move them into `data/private-uploads/payments/` and update `Payment.screenshotUrl` to the new storage key.

**Backup:** Include both `public/uploads/` and `data/private-uploads/` in your server backup routine.

---

### Cloudflare R2 (production server)

```env
STORAGE_DRIVER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=nexcard-uploads
R2_PUBLIC_URL=https://cdn.www.nexcard.wetechmm.com
# Recommended: second bucket with no custom domain
R2_PRIVATE_BUCKET=nexcard-private
```

- Gallery/avatars: `PutObject` to the public bucket; DB stores `${R2_PUBLIC_URL}/{key}`.
- Payment proofs: key `private/payments/{userId}/{uuid}.ext`. DB stores the **object key** (or `r2://…`), never a CDN URL.
- If `R2_PRIVATE_BUCKET` is unset, proofs fall back to the main bucket + `private/` prefix. Add a Cloudflare Transform Rule / WAF to **deny public GET on `private/*`**.
- Keep `STORAGE_R2_USE_PRESIGNED` off. Never presign `folder=payments`.

Existing public R2 payment URLs in the DB still work for **ADMIN** until you copy those objects to `private/payments/…` and update rows.

---

### Cloudinary (no VPN issues in most regions)

```env
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=nexcard
```

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy **Cloud name**, **API Key**, and **API Secret** from the dashboard
3. Uploads are signed server-side — no client SDK required

---

### Supabase Storage

```env
STORAGE_DRIVER=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=nexcard-uploads
```

1. Create a project at [supabase.com](https://supabase.com)
2. Storage → create bucket `nexcard-uploads` → set to **Public**
3. Use the **service role** key (server-side only — never expose to the browser)

---

### Stripping unused providers

Only set `STORAGE_DRIVER` and the env block for your chosen provider. Unused provider files live in `src/lib/storage/providers/` — delete any you don't need (e.g. remove `r2.ts` if you only use local).

| Driver | Required env vars |
|--------|-------------------|
| `local` | `ALLOW_LOCAL_STORAGE=true` in production |
| `r2` | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`; optional `R2_PRIVATE_BUCKET` |
| `cloudinary` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `supabase` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` |

If `STORAGE_DRIVER` points to a driver that isn't fully configured, the app **falls back to local** and logs a warning.

---

### Upload API reference

| Endpoint | Request | Response |
|----------|---------|----------|
| **Upload** (all drivers) | `POST /api/upload` FormData: `file`, `folder` | `{ url, publicUrl, filename?, key?, driver }` — `folder=payments` returns a storage key, not a CDN URL |
| **Config** | `GET /api/upload` (session required) | `{ driver, maxFileSizeMb, maxPaymentFileSizeMb, allowedTypes }` |
| **Proof** | `GET /api/payments/proof/{id}` (owner or ADMIN) | Binary image, `Cache-Control: private, no-store` |
| **R2 presigned** (optional) | `POST /api/upload` JSON when `STORAGE_R2_USE_PRESIGNED=true` | `{ uploadUrl, publicUrl, key }` — never for `folder=payments` |

### Legacy R2-only section (reference)

<details>
<summary>Cloudflare R2 setup (click to expand — only if you can access Cloudflare without VPN)</summary>

1. Cloudflare Dashboard → **R2** → Create bucket `nexcard-uploads`
2. **Manage R2 API Tokens** → Create token with Object Read & Write
3. Set CORS on bucket:

```json
[
  {
    "AllowedOrigins": ["https://www.nexcard.wetechmm.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Connect custom domain `cdn.www.nexcard.wetechmm.com` to bucket (optional but recommended)
5. Add all `R2_*` vars to `.env.local` / server env

</details>

---

## 10. NFC Module

NFC is **included** — not removed. Users on NFC tiers can program physical tags.

### Database fields (`user_profiles`)

| Column | Type | Purpose |
|--------|------|---------|
| `nfcWriteCount` | BigInt | Times tag was marked programmed |
| `nfcProgrammedAt` | DateTime? | Last programming timestamp |

### User flow

1. User selects **NFC Only** or **NFC + QR** tier during onboarding
2. Payment approved by admin
3. User goes to **Dashboard → NFC Setup** (`/dashboard/nfc`)
4. Follows steps to write URL `https://www.nexcard.wetechmm.com/p/{slug}` to NFC tag
5. Clicks **Mark NFC Tag as Programmed**
6. Analytics shows NFC write count

### Routes

| Route | Description |
|-------|-------------|
| `/dashboard/nfc` | NFC hub — lists NFC-eligible profiles |
| `/dashboard/nfc/[slug]` | Programming guide + mark button |

### Apply NFC migration

```bash
npm run db:migrate:prod
```

---

## 11. Domain, SSL & DNS

| Record | Type | Value |
|--------|------|-------|
| `@` | A | Your server IP |
| `www` | CNAME | `www.nexcard.wetechmm.com` |
| `cdn` | CNAME | R2 public bucket domain |

Set `NEXT_PUBLIC_APP_URL=https://www.nexcard.wetechmm.com` in production env.

---

## 12. Production Deploy Checklist

Print this and check off before go-live:

```
LOCAL / PRE-DEPLOY
□ npm install completes without errors
□ npm run ci passes (type-check + lint + test)
□ npm run build succeeds
□ All migrations applied locally against staging DB

ENVIRONMENT
□ DATABASE_URL set and tested (MySQL reachable)
□ NEXT_PUBLIC_APP_URL matches production domain
□ REVALIDATION_SECRET is unique (32+ random chars)
□ CRON_SECRET is unique (32+ random chars); cron uses Authorization: Bearer only
□ STORAGE_DRIVER=r2 on the server (R2_* set); STORAGE_DRIVER=local on laptops
□ R2_PRIVATE_BUCKET set, or a Cloudflare rule denies public GET on private/*
□ KBZPay / WavePay / AYA Pay numbers set in Admin → Settings (not 09-000000000)
□ SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_USER set — register always requires email verify
□ Admin 2FA enabled at /admin/security
□ Seed admin password changed; demo user disabled or deleted
□ Pre-order mode: leave ON until template prices are final (Admin → Settings)
□ NODE_ENV=production

DATABASE
□ npm run db:migrate:prod executed on production DB
□ npm run db:seed executed (first deploy only)
□ Admin password changed from seed default
□ Demo accounts removed or disabled

SECURITY
□ HTTPS enabled (SSL certificate)
□ Demo credentials hidden on login page (auto in production)
□ Rate limiting on /api/auth (in-app; add Nginx limit_req if more than one Node process)
□ Backup strategy for MySQL defined

CI/CD
□ GitHub repo connected
□ CI workflow passes on main branch
□ Deploy process documented for your team

POST-DEPLOY SMOKE TEST
□ Landing page loads
□ Register + login works
□ Onboarding flow completes (pre-order reservation or paid screenshot)
□ Payment upload + admin approval works (after pre-order mode is off)
□ Profile publishes at /{slug}
□ QR code generates
□ NFC setup page accessible for NFC tiers
□ Admin panel accessible
```

### Pre-order mode (prices not final)

Admin → Settings → **Pre-order mode** (default on).

- Users pick QR / NFC / NFC+QR, claim a slug, and reserve a profile. No MMK and no screenshot.
- Premium edit / QR / NFC stay locked until they pay after you publish prices.
- **When prices are ready:** set amounts on Admin → Templates, then turn **Pre-order mode** off. Existing reserved profiles (`paymentStatus` empty) pay on Dashboard → Submit Payment.
- Set real KBZPay / WavePay / AYA Pay numbers before turning pre-order off.
- SMTP is required for launch even in pre-order mode (email verification).
- Change the seed admin password, enable TOTP at `/admin/security`, and disable the demo user.

---

## 13. Ongoing Maintenance

### Weekly

- Check error logs (`pm2 logs nexcard` or hosting dashboard)
- Review pending payments in `/admin/payments`

### Monthly

- `npm audit` — review security advisories
- MySQL backup verification
- Review analytics / disk usage for uploads

### After each release

```bash
git pull
npm ci
npm run db:migrate:prod
npm run build
pm2 restart nexcard   # or your deploy method
```

### Purge ISR cache manually

```bash
curl -X POST https://www.nexcard.wetechmm.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_REVALIDATION_SECRET","type":"slug","value":"user-slug"}'
```

---

## 14. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `DATABASE_URL is required in production` | Missing DB URL | Set `DATABASE_URL` in env |
| `npm run build` EPERM (Windows) | Node locking Prisma engine | `taskkill /F /IM node.exe`, rebuild |
| Profile image upload fails | R2 not configured | Set all `R2_*` env vars |
| Payment upload works but profile images don't | Two upload modes | Payment = FormData; images = JSON presigned |
| CI build fails on migrate | MySQL not ready | CI waits for health check; retry push |
| NFC count always 0 | Migration not applied | Run `npm run db:migrate:prod` |
| Lint fails CI | ESLint errors | Run `npm run lint` locally, fix errors |
| 404 after profile save | ISR cache | Save triggers `revalidateTag`; check logs |
| Cross-user dashboard data | Cache bug (fixed) | Ensure latest code deployed |

---

## Quick Reference — All npm Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Start production server
npm run type-check       # TypeScript check
npm run lint             # ESLint
npm run test             # Vitest unit + API tests
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E
npm run ci               # Full quality gate (local)
npm run db:generate      # Prisma client
npm run db:migrate       # Dev migrations
npm run db:migrate:prod  # Production migrations
npm run db:seed          # Seed data
npm run db:studio        # Prisma Studio GUI
npm run format           # Prettier format
```

---

**NEX CARD** — Production operations guide v1.0
