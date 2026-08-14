// src/app/api/auth/register/route.ts
// POST /api/auth/register — creates a pending user and emails a verification code

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/hash";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { getSettings } from "@/lib/settings";
import { createEmailToken } from "@/lib/auth/email-tokens";
import { createVerificationCode } from "@/lib/auth/verification-codes";
import { sendMail, isMailConfigured } from "@/lib/mail/mailer";
import { verifyEmailHtml } from "@/lib/mail/templates";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const limited = rateLimit(`auth:register:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const settings = await getSettings();
    if (settings.maintenance_mode) {
      return NextResponse.json(
        { message: "The site is under maintenance. Please try again later." },
        { status: 503 }
      );
    }
    if (!settings.allow_registration) {
      return NextResponse.json(
        { message: "Registration is currently closed." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstError?.message ?? "Validation failed." },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "USER",
        status: "PENDING_VERIFICATION",
        emailVerifiedAt: null,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    if (settings.notify_new_user && settings.notify_email) {
      void sendMail({
        to: settings.notify_email,
        subject: `[NEX CARD] New user: ${email}`,
        html: `<p>New registration: <strong>${name}</strong> &lt;${email}&gt;</p>`,
        text: `New registration: ${name} <${email}>`,
      }).catch((err) => console.error("[Auth/Register] notify failed", err));
    }

    const token = await createEmailToken(
      user.id,
      "VERIFY_EMAIL",
      24 * 60 * 60 * 1000
    );
    const code = await createVerificationCode(user.id, "register");

    if (isMailConfigured()) {
      await sendMail({
        to: email,
        subject: "Verify your NEX CARD email",
        html: verifyEmailHtml(name, token ?? "", code),
      });
    } else {
      console.warn(
        "[Auth/Register] SMTP is not configured — verification email was not sent."
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        message:
          "Account created. Check your email for a verification code before signing in.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Auth/Register]", error);
    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
