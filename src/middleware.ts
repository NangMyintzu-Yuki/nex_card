// src/middleware.ts
// Maintenance-mode gate + route protection
//
// MAINTENANCE_MODE=true in .env:
//   - All page routes redirect to /maintenance
//   - /dev prefix bypass: /dev/X rewrites to /X (URL stays /dev/X)
//   - /maintenance passes through
//   - Static assets & _next pass through
//   - API routes pass through (needed for bypassed pages to function)
//
// MAINTENANCE_MODE=false:
//   - Normal session guard for protected routes

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const BYPASS_PREFIX = "dev";

const EXEMPT_PREFIXES = [
  "/maintenance",
  "/_next/",
  "/brand/",
  "/icons/",
  "/uploads/",
  "/favicon",
  "/sw.js",
  "/manifest",
  "/robots",
  "/sitemap",
];

function isExemptPath(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
}

function isStaticAsset(pathname: string): boolean {
  return /\.\w{2,4}$/.test(pathname);
}

function maintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const maintOn = maintenanceMode();

  // ── Maintenance mode ────────────────────────────────────────────────────
  if (maintOn) {
    // a. /dev prefix → rewrite to inner path (URL stays /dev/X)
    if (pathname === `/${BYPASS_PREFIX}` || pathname.startsWith(`/${BYPASS_PREFIX}/`)) {
      const innerPath = pathname.slice(BYPASS_PREFIX.length + 1) || "/";
      const res = NextResponse.rewrite(new URL(innerPath, request.url));
      res.headers.set("x-maintenance-bypass", "1");
      return res;
    }

    // b. Exempt paths (maintenance page, static assets) → pass through
    if (pathname.startsWith("/maintenance") || isStaticAsset(pathname) || isExemptPath(pathname)) {
      return NextResponse.next();
    }

    // c. API routes → pass through (needed for bypassed pages to call APIs)
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // d. Everything else → redirect to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // ── Normal mode — session guard ─────────────────────────────────────────

  const sessionToken = request.cookies.get("session_token")?.value;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    const safe =
      pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
        ? pathname
        : "/dashboard";
    loginUrl.searchParams.set("callbackUrl", safe);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
