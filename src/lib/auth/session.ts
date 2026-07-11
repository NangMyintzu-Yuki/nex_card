// src/lib/auth/session.ts
// Minimal session helper — replace with NextAuth or Lucia in production

import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatarUrl: string | null;
}

export interface Session {
  user: SessionUser;
}

/**
 * Gets the current user session from the session cookie.
 * In production, wire this to NextAuth's getServerSession() or Lucia's auth().
 */
export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      expires: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          status: true,
        },
      },
    },
  });

  if (!session) return null;
  if (new Date(session.expires) < new Date()) return null;
  if (session.user.status !== "ACTIVE") return null;

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
    },
  };
}