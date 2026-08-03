// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/hash";
import { consumeEmailToken } from "@/lib/auth/email-tokens";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const Schema = z.object({
  token: z.string().min(20).max(128),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const limited = rateLimit(`auth:reset:${ip}`, 10, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid token or password (min 8 characters)." },
        { status: 400 }
      );
    }

    const consumed = await consumeEmailToken(
      parsed.data.token,
      "RESET_PASSWORD"
    );
    if (!consumed) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(parsed.data.password);
    await prisma.user.update({
      where: { id: consumed.userId },
      data: { hashedPassword },
    });

    // Invalidate all existing sessions
    await prisma.session.deleteMany({ where: { userId: consumed.userId } });

    await writeAuditLog({
      actorId: consumed.userId,
      action: "auth.password_reset",
      targetType: "User",
      targetId: consumed.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Password updated. You can sign in now.",
    });
  } catch (error) {
    console.error("[Auth/Reset]", error);
    return NextResponse.json(
      { message: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
