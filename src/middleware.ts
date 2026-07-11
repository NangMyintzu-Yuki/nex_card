// src/middleware.ts
// Route protection middleware — guards /dashboard and /admin at the edge

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Routes that logged-in users should be redirected away from
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // ── Redirect unauthenticated users to login ─────────────────────────────
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect authenticated users away from login/register ───────────────
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Admin route — secondary role check happens in page.tsx ──────────────
  // We can't check role in middleware without a DB call (edge runtime).
  // The admin page.tsx does a full role check via getServerSession().

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files, _next internals, and API routes
  // that don't need auth checks
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
