import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { createVerificationCode } from "@/lib/auth/verification-codes";
import { createEmailToken } from "@/lib/auth/email-tokens";
import { sendMail, isMailConfigured } from "@/lib/mail/mailer";
import { verifyEmailHtml } from "@/lib/mail/templates";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { rejectIfMaintenance } from "@/lib/security/maintenance";

const Schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  purpose: z.enum(["register", "login"]).default("register"),
});

export async function POST(request: NextRequest) {
  const blocked = rejectIfMaintenance(request.nextUrl.pathname);
  if (blocked) return blocked;
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

    const { email, purpose: requestedPurpose } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, status: true },
    });

    const purpose =
      user?.status === "ACTIVE" ? "login" :
      user?.status === "PENDING_VERIFICATION" ? "register" :
      requestedPurpose;

    if (!user || (purpose === "register" && user.status !== "PENDING_VERIFICATION") ||
        (purpose === "login" && user.status !== "ACTIVE")) {
      return NextResponse.json(
        { message: "If this email is registered, a new code has been sent." },
        { status: 200 }
      );
    }

    const token = purpose === "register"
      ? await createEmailToken(user.id, "VERIFY_EMAIL", 24 * 60 * 60 * 1000)
      : null;
    const code = await createVerificationCode(user.id, purpose);

    if (isMailConfigured()) {
      const subject = purpose === "login"
        ? "Your NEX CARD login code"
        : "Your NEX CARD verification code";
      const html = verifyEmailHtml(user.name ?? "User", token ?? "", code);
      await sendMail({ to: email, subject, html });
    } else {
      console.warn("[Auth/ResendCode] SMTP not configured.");
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
