// src/app/api/admin/users/[userId]/profiles/route.ts
// Returns profiles for a specific user (admin only)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  const profiles = await prisma.userProfile.findMany({
    where: { userId },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      template: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ profiles });
}
