// src/app/api/auth/2fa/setup/route.ts — Admin-only TOTP setup
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  generateTotpSecret,
  totpOtpauthUrl,
  verifyTotp,
} from "@/lib/auth/totp";
import { writeAuditLog } from "@/lib/audit";

/** GET — create/return pending secret + otpauth URL (does not enable yet) */
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, totpEnabled: true, totpSecret: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.totpEnabled) {
    return NextResponse.json({ enabled: true });
  }

  const secret = user.totpSecret || generateTotpSecret();
  if (!user.totpSecret) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totpSecret: secret },
    });
  }

  return NextResponse.json({
    enabled: false,
    secret,
    otpauthUrl: totpOtpauthUrl({ secret, email: user.email }),
  });
}

/** POST { code } — verify first code and enable 2FA */
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true },
  });
  if (!user?.totpSecret || !verifyTotp(user.totpSecret, code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: true },
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "auth.2fa_enabled",
    targetType: "User",
    targetId: session.user.id,
  });

  return NextResponse.json({ success: true, enabled: true });
}

/** DELETE — disable 2FA (requires current code) */
export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true, totpEnabled: true },
  });
  if (!user?.totpEnabled || !user.totpSecret || !verifyTotp(user.totpSecret, code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: false, totpSecret: null },
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "auth.2fa_disabled",
    targetType: "User",
    targetId: session.user.id,
  });

  return NextResponse.json({ success: true, enabled: false });
}
