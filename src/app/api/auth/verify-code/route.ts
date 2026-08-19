import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { verifyCode } from "@/lib/auth/verification-codes";
import { randomBytes } from "crypto";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { rejectIfMaintenance } from "@/lib/security/maintenance";

const Schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(["register", "login"]).default("register"),
  remember: z.boolean().default(true),
});

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_SHORT_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const blocked = rejectIfMaintenance(request.nextUrl.pathname);
  if (blocked) return blocked;
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const ipLimit = rateLimit(`auth:verify-code:${ip}`, 8, 15 * 60 * 1000);
    if (!ipLimit.ok) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSec) },
        }
      );
    }

    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email or code format." },
        { status: 400 }
      );
    }

    const { email, code, purpose, remember } = parsed.data;
    const emailLimit = rateLimit(`auth:verify-code:${email}`, 8, 15 * 60 * 1000);
    if (!emailLimit.ok) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, status: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid code or email." },
        { status: 400 }
      );
    }

    const effectivePurpose =
      user.status === "ACTIVE" ? "login" :
      user.status === "PENDING_VERIFICATION" ? "register" :
      purpose;

    const result = await verifyCode(code, effectivePurpose, user.id);

    if (!result) {
      return NextResponse.json(
        { message: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    if (effectivePurpose === "register") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionToken = randomBytes(32).toString("hex");
    const sessionDuration = remember ? SESSION_DURATION_MS : SESSION_SHORT_MS;
    const expires = new Date(Date.now() + sessionDuration);

    await prisma.session.create({
      data: { userId: user.id, sessionToken, expires },
    });

    const response = NextResponse.json(
      { success: true, message: "Email verified successfully.", role: user.role },
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
    console.error("[Auth/VerifyCode]", error);
    return NextResponse.json(
      { message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
