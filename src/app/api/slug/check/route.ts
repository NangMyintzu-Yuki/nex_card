// src/app/api/slug/check/route.ts
// GET /api/slug/check?slug=alex-rivera — checks if a slug is available in real-time

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { isValidSlug } from "@/lib/utils";
import { isReservedSlug } from "@/lib/slugs/reserved";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  maybeCleanupRateLimits();
  const ip = clientIp(request);
  const limited = rateLimit(`slug:check:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { available: false, message: "Too many checks. Slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ available: false, message: "Slug is required." }, { status: 400 });
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({
      available: false,
      message: "Slug can only contain lowercase letters, numbers, and hyphens (3–60 chars).",
    });
  }

  if (isReservedSlug(slug)) {
    return NextResponse.json({ available: false, message: "That slug is reserved." });
  }

  const existing = await prisma.userProfile.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({
    available: !existing,
    message: existing ? "That slug is already taken." : "Available!",
  });
}
