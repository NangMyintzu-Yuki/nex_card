// src/middleware.ts
// Route protection middleware — guards /dashboard and /admin at the edge

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // ── Protected routes require a session cookie (full validation in layouts) ─
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Do NOT redirect /login → /dashboard based on cookie alone.
  // A stale cookie after DB reset causes an infinite redirect loop:
  //   middleware sends login → dashboard, layout sends dashboard → login.
  // Logged-in users are redirected client-side via /api/auth/me on auth pages.

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files, _next internals, and API routes
  // that don't need auth checks
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
