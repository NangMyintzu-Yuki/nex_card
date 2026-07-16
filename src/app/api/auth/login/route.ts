// src/app/api/auth/login/route.ts
// POST /api/auth/login — validates credentials, creates a session cookie

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/hash";
import { randomBytes } from "crypto";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Session expires in 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email or password format." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        hashedPassword: true,
        status: true,
        role: true,
      },
    });

    // Generic message — don't reveal whether email exists
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

    const passwordValid = await verifyPassword(password, user.hashedPassword);
    if (!passwordValid) {
      return NextResponse.json({ message: invalidMessage }, { status: 401 });
    }

    // Create session
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expires,
      },
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set HttpOnly cookie
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