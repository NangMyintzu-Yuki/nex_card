// src/app/api/admin/backup/route.ts — Generate SQL backup, compress, and email
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { gzip } from "zlib";
import { promisify } from "util";
import { getServerSession } from "@/lib/auth/session";
import { generateSqlDump } from "@/lib/backup/sql-dump";
import { sendBackupEmail } from "@/lib/backup/email-sender";
import prisma from "@/lib/db/prisma";

const gzipAsync = promisify(gzip);

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

async function buildDump() {
  const sql = await generateSqlDump();
  const sizeRaw = Buffer.byteLength(sql, "utf-8");
  const compressed = await gzipAsync(Buffer.from(sql, "utf-8"), { level: 9 });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `nexcard-backup-${date}.sql.gz`;
  return { compressed, sizeRaw, filename };
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const download =
    req.nextUrl.searchParams.get("download") === "1" ||
    (req.headers.get("accept") ?? "").includes("application/gzip");

  try {
    const { compressed, sizeRaw, filename } = await buildDump();

    if (download) {
      return new Response(compressed, {
        headers: {
          "Content-Type": "application/gzip",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    const [users, sessions, categories, templates, profiles, payments] =
      await Promise.all([
        prisma.user.count(),
        prisma.session.count(),
        prisma.category.count(),
        prisma.template.count(),
        prisma.userProfile.count(),
        prisma.payment.count(),
      ]);

    const messageId = await sendBackupEmail({
      compressedSql: compressed,
      filename,
      stats: {
        users,
        sessions,
        categories,
        templates,
        profiles,
        payments,
        sizeRaw,
        sizeCompressed: compressed.length,
      },
    });

    return NextResponse.json({
      success: true,
      messageId,
      filename,
      stats: {
        rows: { users, sessions, categories, templates, profiles, payments },
        sizeRaw: `${(sizeRaw / 1024).toFixed(1)} KB`,
        sizeCompressed: `${(compressed.length / 1024).toFixed(1)} KB`,
        reduction: `${Math.round((1 - compressed.length / sizeRaw) * 100)}%`,
      },
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json(
      { error: "Backup generation or email failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
