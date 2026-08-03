// src/app/api/admin/audit/route.ts — recent audit log entries (admin only)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const take = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50))
  );

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json({ logs });
}
