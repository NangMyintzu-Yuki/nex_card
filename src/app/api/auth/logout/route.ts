// src/app/api/auth/logout/route.ts
// GET /api/auth/logout — destroys the session and clears the cookie

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (sessionToken) {
    // Delete session from DB — ignore errors (already expired, etc.)
    await prisma.session
      .deleteMany({ where: { sessionToken } })
      .catch(() => {});
  }

  const response = NextResponse.redirect(new URL("/", request.url));

  // Clear the cookie
  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}

// Also support POST for programmatic logout
export async function POST(request: NextRequest) {
  return GET(request);
}
