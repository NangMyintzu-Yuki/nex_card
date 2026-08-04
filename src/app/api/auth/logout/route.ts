// src/app/api/auth/logout/route.ts
// POST /api/auth/logout — destroys the session and clears the cookie

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function destroySession(request: NextRequest): Promise<NextResponse> {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (sessionToken) {
    await prisma.session
      .deleteMany({ where: { sessionToken } })
      .catch(() => {});
  }

  const wantsJson =
    request.headers.get("accept")?.includes("application/json") ||
    request.headers.get("content-type")?.includes("application/json");

  const response = wantsJson
    ? NextResponse.json({ success: true })
    : NextResponse.redirect(new URL("/", APP_URL));

  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}

export async function POST(request: NextRequest) {
  return destroySession(request);
}

/** GET logout is disabled — use POST to prevent CSRF via img/link prefetch. */
export async function GET() {
  return NextResponse.json(
    { message: "Use POST /api/auth/logout to sign out." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
