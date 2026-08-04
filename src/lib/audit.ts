// src/lib/audit.ts
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";

export async function writeAuditLog(input: {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("[audit]", input.action, input.targetType, input.targetId);
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write", err);
  }
}
