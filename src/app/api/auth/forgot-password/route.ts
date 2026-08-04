// src/app/api/auth/forgot-password/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { createEmailToken } from "@/lib/auth/email-tokens";
import { sendMail, isMailConfigured } from "@/lib/mail/mailer";
import { resetPasswordHtml } from "@/lib/mail/templates";

const Schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIp(request);
    const limited = rateLimit(`auth:forgot:${ip}`, 5, 60 * 60 * 1000);
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
      return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    }

    // Always return success to avoid email enumeration
    const okMessage = {
      success: true,
      message: "If that email exists, a reset link has been sent.",
    };

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, name: true, email: true, status: true },
    });

    if (!user || user.status === "SUSPENDED") {
      return NextResponse.json(okMessage);
    }

    const token = await createEmailToken(
      user.id,
      "RESET_PASSWORD",
      60 * 60 * 1000
    );

    if (token && isMailConfigured()) {
      await sendMail({
        to: user.email,
        subject: "Reset your NEX CARD password",
        html: resetPasswordHtml(user.name, token),
      });
    } else if (token) {
      console.warn(
        "[Auth/Forgot] SMTP not configured — reset token created for",
        user.email
      );
    }

    return NextResponse.json(okMessage);
  } catch (error) {
    console.error("[Auth/Forgot]", error);
    return NextResponse.json(
      { message: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
