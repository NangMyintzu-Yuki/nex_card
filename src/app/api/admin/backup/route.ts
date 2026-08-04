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

export async function POST(_req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Generate SQL dump
    const sql = await generateSqlDump();
    const sizeRaw = Buffer.byteLength(sql, "utf-8");

    // 2. Compress with gzip
    const compressed = await gzipAsync(Buffer.from(sql, "utf-8"), { level: 9 });
    const sizeCompressed = compressed.length;

    // 3. Build filename
    const date = new Date().toISOString().slice(0, 10);
    const filename = `nexcard-backup-${date}.sql.gz`;

    // 4. Get row counts for email stats
    const [users, sessions, categories, templates, profiles, payments] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.category.count(),
      prisma.template.count(),
      prisma.userProfile.count(),
      prisma.payment.count(),
    ]);

    // 5. Send email
    const messageId = await sendBackupEmail({
      compressedSql: compressed,
      filename,
      stats: { users, sessions, categories, templates, profiles, payments, sizeRaw, sizeCompressed },
    });

    return NextResponse.json({
      success: true,
      messageId,
      filename,
      stats: {
        rows: { users, sessions, categories, templates, profiles, payments },
        sizeRaw: `${(sizeRaw / 1024).toFixed(1)} KB`,
        sizeCompressed: `${(sizeCompressed / 1024).toFixed(1)} KB`,
        reduction: `${Math.round((1 - sizeCompressed / sizeRaw) * 100)}%`,
      },
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json(
      { error: "Backup generation or email failed", details: String(err) },
      { status: 500 }
    );
  }
}

// GET — just generate and download (no email)
export async function GET(_req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = await generateSqlDump();
    const compressed = await gzipAsync(Buffer.from(sql, "utf-8"), { level: 9 });
    const date = new Date().toISOString().slice(0, 10);

    return new Response(compressed, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="nexcard-backup-${date}.sql.gz"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Backup failed", details: String(err) }, { status: 500 });
  }
}
