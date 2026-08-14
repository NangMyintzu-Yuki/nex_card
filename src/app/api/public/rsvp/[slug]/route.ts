// src/app/api/public/rsvp/[slug]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { rejectIfMaintenance } from "@/lib/security/maintenance";

const Schema = z.object({
  guestName: z.string().min(1).max(120).trim(),
  email: z.string().email().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  attending: z.boolean().default(true),
  guestCount: z.number().int().min(1).max(20).default(1),
  plusOneName: z.string().max(120).optional().or(z.literal("")),
  mealChoice: z.string().max(120).optional().or(z.literal("")),
  dietary: z.string().max(240).optional().or(z.literal("")),
  songRequest: z.string().max(120).optional().or(z.literal("")),
  mealNote: z.string().max(240).optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  maybeCleanupRateLimits();
  const ip = clientIp(request);
  const limited = rateLimit(`rsvp:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Too many RSVPs from this network." },
      { status: 429 }
    );
  }

  const blocked = rejectIfMaintenance("/api/public/rsvp");
  if (blocked) return blocked;

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid RSVP." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const row = await prisma.weddingRsvp.create({
    data: {
      profileId: profile.id,
      guestName: data.guestName,
      email: data.email || null,
      phone: data.phone || null,
      attending: data.attending,
      guestCount: data.guestCount,
      plusOneName: data.plusOneName || null,
      mealChoice: data.mealChoice || null,
      dietary: data.dietary || null,
      songRequest: data.songRequest || null,
      mealNote: data.mealNote || null,
      message: data.message || null,
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true, id: row.id }, { status: 201 });
}

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
      userId: true,
      category: { select: { slug: true } },
    },
  });

  if (!profile?.isPublished || profile.category.slug !== "wedding-invitation") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  // Public summary only (counts) — full list is owner/admin via dashboard
  const [attending, declined, totalGuests] = await Promise.all([
    prisma.weddingRsvp.count({
      where: { profileId: profile.id, attending: true },
    }),
    prisma.weddingRsvp.count({
      where: { profileId: profile.id, attending: false },
    }),
    prisma.weddingRsvp.aggregate({
      where: { profileId: profile.id, attending: true },
      _sum: { guestCount: true },
    }),
  ]);

  return NextResponse.json({
    attending,
    declined,
    totalGuests: totalGuests._sum.guestCount ?? 0,
  });
}
