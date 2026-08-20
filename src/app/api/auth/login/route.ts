// src/app/api/auth/login/route.ts
// POST /api/auth/login — validates credentials, creates a session cookie

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { verifyPassword, dummyPasswordCheck } from "@/lib/auth/hash";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { createVerificationCode } from "@/lib/auth/verification-codes";
import { sendMail, isMailConfigured } from "@/lib/mail/mailer";
import { verifyEmailHtml, twoFactorFailedLoginHtml } from "@/lib/mail/templates";
import { getSettings } from "@/lib/settings";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
  totpCode: z.string().regex(/^\d{6}$/).optional(),
  remember: z.boolean().optional(),
});

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
        emailVerifiedAt: true,
        lastLoginAt: true,
      },
    });

    const invalidMessage = "Invalid email or password.";

    if (!user) {
      await dummyPasswordCheck(password);
      return NextResponse.json({ message: invalidMessage }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { message: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const settings = await getSettings();

    if (user.status === "PENDING_VERIFICATION" && !settings.require_email_verify) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE", emailVerifiedAt: new Date() },
      });
      user.status = "ACTIVE";
      user.emailVerifiedAt = new Date();
    }

    if (user.status === "PENDING_VERIFICATION") {
      return NextResponse.json(
        {
          message:
            "Please verify your email before signing in. Check your inbox for the code.",
          requiresVerification: true,
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
        // Send email notification for failed 2FA attempt
        if (isMailConfigured() && user.email) {
          sendMail({
            to: user.email,
            subject: "Failed login attempt on your NEX CARD account",
            html: twoFactorFailedLoginHtml(user.name ?? "User", ip),
          }).catch((err) => {
            console.error("[Auth/Login] Failed to send 2FA failure notification:", err);
          });
        }
        return NextResponse.json(
          { message: "Invalid two-factor code." },
          { status: 401 }
        );
      }
    }

    // Returning user (already verified email & logged in before) — skip email verification
    if (user.emailVerifiedAt && user.lastLoginAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const { randomBytes } = await import("crypto");
      const remember = body.remember !== false;
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
    }

    // First-time user — require email verification (if setting enabled)
    if (!settings.require_email_verify) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE", emailVerifiedAt: new Date(), lastLoginAt: new Date() },
      });

      const { randomBytes } = await import("crypto");
      const remember = body.remember !== false;
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
    }

    const code = await createVerificationCode(user.id, "login");

    if (isMailConfigured() && user.email) {
      await sendMail({
        to: user.email,
        subject: "Your NEX CARD login code",
        html: verifyEmailHtml(user.name ?? "User", "", code),
      });
    }

    return NextResponse.json(
      {
        message: "Please verify your email to complete login.",
        requiresVerification: true,
        email: user.email,
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("[Auth/Login]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
