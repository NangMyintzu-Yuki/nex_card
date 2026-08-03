// src/lib/auth/email-tokens.ts
import { randomBytes } from "crypto";
import prisma from "@/lib/db/prisma";
import type { EmailTokenType } from "@prisma/client";

export async function createEmailToken(
  userId: string,
  type: EmailTokenType,
  ttlMs: number
): Promise<string | null> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);

  try {
    // Invalidate prior unused tokens of same type
    await prisma.emailToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.emailToken.create({
      data: { userId, token, type, expiresAt },
    });

    return token;
  } catch (err) {
    console.error("[email-tokens] create failed", err);
    return null;
  }
}

export async function consumeEmailToken(
  token: string,
  type: EmailTokenType
): Promise<{ userId: string } | null> {
  try {
    const row = await prisma.emailToken.findFirst({
      where: {
        token,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    });

    if (!row) return null;

    await prisma.emailToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });

    return { userId: row.userId };
  } catch (err) {
    console.error("[email-tokens] consume failed", err);
    return null;
  }
}
