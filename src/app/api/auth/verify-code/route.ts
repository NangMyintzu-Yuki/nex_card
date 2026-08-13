import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { verifyCode } from "@/lib/auth/verification-codes";
import { randomBytes } from "crypto";

const Schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  code: z.string().length(6),
});

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email or code format." },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid code or email." },
        { status: 400 }
      );
    }

    if (user.status !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { message: "Account is already verified or suspended." },
        { status: 400 }
      );
    }

    const result = await verifyCode(code, "register");

    if (!result || result.userId !== user.id) {
      return NextResponse.json(
        { message: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.create({
      data: { userId: user.id, sessionToken, expires },
    });

    const response = NextResponse.json(
      { success: true, message: "Email verified successfully." },
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
