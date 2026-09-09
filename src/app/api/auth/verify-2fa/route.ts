import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import prisma from "@/lib/db/prisma";
import { verifyTwoFactorToken } from "@/lib/auth/two-factor-token";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";

const VerifySchema = z.object({
  token: z.string().min(1),
  totpCode: z.string().regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const limited = rateLimit(`auth:2fa:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request format." },
        { status: 400 }
      );
    }

    const { token, totpCode } = parsed.data;

    const tokenResult = verifyTwoFactorToken(token);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { message: tokenResult.error },
        { status: 401 }
      );
    }

    const { userId, email } = tokenResult;

    const user = await prisma.user.findUnique({
      where: { id: userId, email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        totpEnabled: true,
        totpSecret: true,
      },
    });

    if (!user || user.status !== "ACTIVE" || !user.totpEnabled || !user.totpSecret) {
      return NextResponse.json(
        { message: "Invalid session. Please log in again." },
        { status: 401 }
      );
    }

    const { verifyTotp } = await import("@/lib/auth/totp");
    if (!verifyTotp(user.totpSecret, totpCode)) {
      return NextResponse.json(
        { message: "Invalid two-factor code." },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const remember = true;
    const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
    const SESSION_SHORT_MS = 24 * 60 * 60 * 1000;
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + (remember ? SESSION_DURATION_MS : SESSION_SHORT_MS));

    await prisma.session.create({
      data: { userId: user.id, sessionToken, expires },
    });

    const response = NextResponse.json(
      { success: true, message: "Logged in successfully.", role: user.role },
      { status: 200 }
    );

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth/Verify2FA]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
