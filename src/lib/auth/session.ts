// src/lib/auth/session.ts
// Minimal session helper — replace with NextAuth or Lucia in production

import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  avatarUrl: string | null;
  totpEnabled: boolean;
}

export interface Session {
  user: SessionUser;
}

/** Remove stale session cookie (e.g. after DB reset or expired session). */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

/**
 * Gets the current user session from the session cookie.
 * Clears the cookie when the token is missing, expired, or no longer in the DB.
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
          totpEnabled: true,
        },
      },
    },
  });

  if (!session || new Date(session.expires) < new Date() || session.user.status !== "ACTIVE") {
    await clearSessionCookie();
    return null;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
      totpEnabled: session.user.totpEnabled,
    },
  };
}