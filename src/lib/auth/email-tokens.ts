import { createHash, randomBytes } from "crypto";
import prisma from "@/lib/db/prisma";
import type { EmailTokenType } from "@prisma/client";

function sha256(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createEmailToken(
  userId: string,
  type: EmailTokenType,
  ttlMs: number
): Promise<string | null> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);

  try {
    await prisma.emailToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.emailToken.create({
      data: { userId, token: sha256(token), type, expiresAt },
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
    const hashed = sha256(token);
    const row = await prisma.emailToken.findFirst({
      where: {
        token: hashed,
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
