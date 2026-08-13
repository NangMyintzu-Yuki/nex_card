import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { createVerificationCode } from "@/lib/auth/verification-codes";
import { sendMail, isMailConfigured } from "@/lib/mail/mailer";
import { verifyEmailHtml } from "@/lib/mail/templates";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

const Schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`auth:resend-code:${ip}`, 3, 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, status: true },
    });

    if (!user || user.status !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { message: "If this email is registered, a new code has been sent." },
        { status: 200 }
      );
    }

    const code = await createVerificationCode(user.id, "register");

    if (isMailConfigured()) {
      await sendMail({
        to: email,
        subject: "Your NEX CARD verification code",
        html: verifyEmailHtml(user.name, "", code),
      });
    } else {
      console.warn("[Auth/ResendCode] SMTP not configured. Code:", code, "for", email);
    }

    return NextResponse.json(
      { success: true, message: "Verification code sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Auth/ResendCode]", error);
    return NextResponse.json(
      { message: "Failed to resend code. Please try again." },
      { status: 500 }
    );
  }
}
