// src/app/api/slug/check/route.ts
// GET /api/slug/check?slug=alex-rivera — checks if a slug is available in real-time

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { isValidSlug } from "@/lib/utils";

// Cache availability checks briefly to reduce DB load during typing
export const revalidate = 0; // Always fresh

export async function GET(request: NextRequest) {
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

  // Reserved slugs that should never be user-claimed
  const RESERVED = new Set([
    "admin", "dashboard", "login", "register", "logout",
    "api", "settings", "onboarding", "help", "about",
    "pricing", "contact", "terms", "privacy", "blog",
    "presencecard", "nexcard", "support", "404", "500", "sitemap",
  ]);

  if (RESERVED.has(slug)) {
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