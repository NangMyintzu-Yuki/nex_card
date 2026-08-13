import prisma from "@/lib/db/prisma";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createVerificationCode(
  userId: string,
  purpose: string = "register"
): Promise<string> {
  await prisma.verificationCode.deleteMany({
    where: { userId, purpose, usedAt: null },
  });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.verificationCode.create({
    data: { userId, code, purpose, expiresAt },
  });

  return code;
}

export async function verifyCode(
  code: string,
  purpose: string = "register"
): Promise<{ userId: string } | null> {
  const record = await prisma.verificationCode.findFirst({
    where: { code, purpose, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}
