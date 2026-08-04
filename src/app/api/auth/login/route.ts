// src/app/api/auth/login/route.ts
// POST /api/auth/login — validates credentials, creates a session cookie

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/hash";
import { randomBytes } from "crypto";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().regex(/^\d{6}$/).optional(),
});

// Session expires in 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const limited = rateLimit(`auth:login:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email or password format." },
        { status: 400 }
      );
    }

    const { email, password, totpCode } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        hashedPassword: true,
        status: true,
        role: true,
        totpEnabled: true,
        totpSecret: true,
      },
    });

    const invalidMessage = "Invalid email or password.";

    if (!user) {
      return NextResponse.json({ message: invalidMessage }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { message: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    if (user.status === "PENDING_VERIFICATION") {
      return NextResponse.json(
        {
          message:
            "Please verify your email before signing in. Check your inbox for the link.",
        },
        { status: 403 }
      );
    }

    const passwordValid = await verifyPassword(password, user.hashedPassword);
    if (!passwordValid) {
      return NextResponse.json({ message: invalidMessage }, { status: 401 });
    }

    if (user.totpEnabled && user.totpSecret) {
      const { verifyTotp } = await import("@/lib/auth/totp");
      if (!totpCode) {
        return NextResponse.json(
          {
            message: "Two-factor code required.",
            requires2fa: true,
          },
          { status: 403 }
        );
      }
      if (!verifyTotp(user.totpSecret, totpCode)) {
        return NextResponse.json(
          { message: "Invalid two-factor code." },
          { status: 401 }
        );
      }
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expires,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth/Login]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
