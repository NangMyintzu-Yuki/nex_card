// src/app/api/export/data/route.ts
// GET /api/export/data — exports the authenticated user's complete profile data as JSON

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { rejectIfMaintenance } from "@/lib/security/maintenance";

export async function GET(_request: NextRequest) {
  const blocked = rejectIfMaintenance("/api/export/data");
  if (blocked) return blocked;
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  // Fetch all user data
  const [user, profiles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    }),
    prisma.userProfile.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        templateLocked: true,
        viewCount: true,
        dynamicJsonData: true,
        metaTitle: true,
        metaDescription: true,
        ogImageUrl: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        template: { select: { name: true, codeIdentifier: true } },
      },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    platform: "NEX CARD",
    version: "1.0",
    user,
    profiles: profiles.map((p) => ({
      ...p,
      // Convert BigInt to string for JSON serialization
      viewCount: p.viewCount.toString(),
    })),
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nexcard-export-${new Date().toISOString().split("T")[0]}.json"`,
      "Cache-Control": "no-store",
    },
  });
}