// src/app/api/auth/2fa/setup/route.ts — Admin-only TOTP setup
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  generateTotpSecret,
  totpOtpauthUrl,
  verifyTotp,
} from "@/lib/auth/totp";
import { writeAuditLog } from "@/lib/audit";
import {
  clientIp,
  maybeCleanupRateLimits,
  rateLimit,
} from "@/lib/security/rate-limit";
import { sendMail, isMailConfigured } from "@/lib/mail/mailer";
import { twoFactorEnabledHtml } from "@/lib/mail/templates";

const CodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

function tooMany(req: Request) {
  maybeCleanupRateLimits();
  const ip = clientIp(req);
  return rateLimit(`auth:2fa:${ip}`, 10, 15 * 60 * 1000);
}

/** GET — create/return pending secret + otpauth URL (does not enable yet) */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
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
  const limited = tooMany(req);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true, email: true, name: true },
  });
  if (!user?.totpSecret || !verifyTotp(user.totpSecret, parsed.data.code)) {
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

  // Send email notification when 2FA is enabled
  if (isMailConfigured() && user.email) {
    sendMail({
      to: user.email,
      subject: "Two-factor authentication enabled on your NEX CARD account",
      html: twoFactorEnabledHtml(user.name ?? "User"),
    }).catch((err) => {
      console.error("[2fa] Failed to send 2FA enabled notification:", err);
    });
  }

  return NextResponse.json({ success: true, enabled: true });
}

/** DELETE — admins cannot disable 2FA once enabled */
export async function DELETE() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Admin two-factor authentication cannot be disabled." },
    { status: 403 }
  );
}
