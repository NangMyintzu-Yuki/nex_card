// src/app/api/public/guestbook/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";

const Schema = z.object({
  author: z.string().min(1).max(120).trim(),
  message: z.string().min(1).max(1000).trim(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profile = await prisma.userProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      isPublished: true,
      category: { select: { slug: true } },
    },
  });

  if (!profile?.isPublished || profile.category.slug !== "wedding-invitation") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const entries = await prisma.weddingGuestbook.findMany({
    where: { profileId: profile.id, isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      author: true,
      message: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ entries });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  maybeCleanupRateLimits();
  const ip = clientIp(request);
  const limited = rateLimit(`guestbook:${ip}`, 15, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Too many guestbook posts from this network." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const profile = await prisma.userProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      isPublished: true,
      category: { select: { slug: true } },
      dynamicJsonData: true,
    },
  });

  if (!profile?.isPublished || profile.category.slug !== "wedding-invitation") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const dataJson = profile.dynamicJsonData as { allowWishes?: boolean };
  if (dataJson.allowWishes === false) {
    return NextResponse.json(
      { message: "Guestbook is disabled for this invitation." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid entry." },
      { status: 400 }
    );
  }

  const row = await prisma.weddingGuestbook.create({
    data: {
      profileId: profile.id,
      author: parsed.data.author,
      message: parsed.data.message,
      isPublic: true,
    },
    select: { id: true, author: true, message: true, createdAt: true },
  });

  return NextResponse.json({ success: true, entry: row }, { status: 201 });
}
