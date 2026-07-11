// src/app/api/auth/register/route.ts
// POST /api/auth/register — creates a new user and auto-logs them in

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/hash";
import { randomBytes } from "crypto";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
});

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
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

    // Check for existing account
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

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "USER",
        status: "ACTIVE",    // Skip email verification for MVP — add later
        emailVerifiedAt: new Date(),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Auto-login: create session immediately
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expires,
      },
    });

    const response = NextResponse.json(
      { success: true, user },
      { status: 201 }
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
    console.error("[Auth/Register]", error);
    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
