// src/app/api/health/route.ts
// GET /api/health — liveness + DB readiness for uptime monitors

import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getStorageDriver } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  let db: "ok" | "error" = "ok";
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    // Mock DB may not support $queryRaw — treat findFirst as fallback
    try {
      await prisma.user.findFirst({ select: { id: true } });
    } catch (err2) {
      db = "error";
      dbError =
        err2 instanceof Error
          ? err2.message
          : err instanceof Error
            ? err.message
            : "db unreachable";
    }
  }

  let storageDriver = "unknown";
  try {
    storageDriver = getStorageDriver();
  } catch (err) {
    storageDriver = err instanceof Error ? err.message : "misconfigured";
  }

  const healthy = db === "ok";
  const body = {
    status: healthy ? "ok" : "degraded",
    uptimeMs: Math.round(process.uptime() * 1000),
    latencyMs: Date.now() - started,
    checks: {
      database: db,
      storageDriver,
    },
    ...(dbError && process.env.NODE_ENV !== "production"
      ? { dbError }
      : {}),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
