// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { consumeEmailToken } from "@/lib/auth/email-tokens";
import { writeAuditLog } from "@/lib/audit";

const Schema = z.object({
  token: z.string().min(20).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid token." }, { status: 400 });
    }

    const consumed = await consumeEmailToken(
      parsed.data.token,
      "VERIFY_EMAIL"
    );
    if (!consumed) {
      return NextResponse.json(
        { message: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: consumed.userId },
      data: {
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
      },
    });

    await writeAuditLog({
      actorId: consumed.userId,
      action: "auth.email_verified",
      targetType: "User",
      targetId: consumed.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified. You can sign in now.",
    });
  } catch (error) {
    console.error("[Auth/Verify]", error);
    return NextResponse.json(
      { message: "Unable to verify email. Please try again." },
      { status: 500 }
    );
  }
}

/** GET support for email clients that open the link directly */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=missing", request.url)
    );
  }

  const consumed = await consumeEmailToken(token, "VERIFY_EMAIL");
  if (!consumed) {
    return NextResponse.redirect(
      new URL("/verify-email?error=invalid", request.url)
    );
  }

  await prisma.user.update({
    where: { id: consumed.userId },
    data: {
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    },
  });

  await writeAuditLog({
    actorId: consumed.userId,
    action: "auth.email_verified",
    targetType: "User",
    targetId: consumed.userId,
  });

  return NextResponse.redirect(
    new URL("/login?verified=1", request.url)
  );
}
