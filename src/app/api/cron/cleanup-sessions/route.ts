// src/app/api/cron/cleanup-sessions/route.ts
// Deletes expired sessions + email tokens. Protect with CRON_SECRET Bearer token.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit";

function authorize(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return Boolean(bearer && bearer === expected);
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const [sessions, tokens] = await Promise.all([
    prisma.session.deleteMany({ where: { expires: { lt: now } } }),
    prisma.emailToken.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  await writeAuditLog({
    action: "cron.cleanup_sessions",
    meta: {
      sessionsDeleted: sessions.count,
      tokensDeleted: tokens.count,
    },
  });

  return NextResponse.json({
    success: true,
    sessionsDeleted: sessions.count,
    tokensDeleted: tokens.count,
  });
}
