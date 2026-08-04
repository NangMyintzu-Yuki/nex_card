// src/lib/backup/sql-dump.ts — Generate SQL INSERT statements from all tables
import prisma from "@/lib/db/prisma";

function escapeVal(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace("T", " ")}'`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "\\'")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function rowValues(cols: string[], row: Record<string, unknown>) {
  return `(${cols.map((c) => escapeVal(row[c])).join(", ")})`;
}

export async function generateSqlDump(): Promise<string> {
  const lines: string[] = [];

  lines.push("-- NEX CARD Weekly Database Backup");
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push("--");
  lines.push("SET NAMES utf8mb4;");
  lines.push("SET FOREIGN_KEY_CHECKS = 0;");
  lines.push("");

  // ── Users ──
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const userCols = ["id", "email", "emailVerifiedAt", "hashedPassword", "name", "avatarUrl", "role", "status", "lastLoginAt", "createdAt", "updatedAt"];
  lines.push(`-- Table: users (${users.length} rows)`);
  lines.push(`INSERT INTO users (${userCols.join(", ")}) VALUES`);
  lines.push(users.map((r) => rowValues(userCols, r as unknown as Record<string, unknown>)).join(",\n") + ";");
  lines.push("");

  // ── Sessions — count only; never dump live session tokens ──
  const sessionCount = await prisma.session.count();
  lines.push(`-- Table: sessions (${sessionCount} active rows)`);
  lines.push("-- INTENTIONALLY OMITTED: sessionToken values must not leave the server.");
  lines.push("-- After restore, users will need to sign in again.");
  lines.push("");

  // ── Categories ──
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const catCols = ["id", "name", "slug", "description", "iconName", "sortOrder", "isActive", "createdAt", "updatedAt"];
  lines.push(`-- Table: categories (${categories.length} rows)`);
  if (categories.length) {
    lines.push(`INSERT INTO categories (${catCols.join(", ")}) VALUES`);
    lines.push(categories.map((r) => rowValues(catCols, r as unknown as Record<string, unknown>)).join(",\n") + ";");
  } else {
    lines.push("-- (no rows)");
  }
  lines.push("");

  // ── Templates ──
  const templates = await prisma.template.findMany({ orderBy: { name: "asc" } });
  const tmplCols = ["id", "categoryId", "codeIdentifier", "name", "description", "thumbnailUrl", "previewUrl", "accentColor", "isPremium", "isActive", "sortOrder", "priceQrOnly", "priceNfcCard", "priceNfcQr", "createdAt", "updatedAt"];
  lines.push(`-- Table: templates (${templates.length} rows)`);
  if (templates.length) {
    lines.push(`INSERT INTO templates (${tmplCols.join(", ")}) VALUES`);
    lines.push(templates.map((r) => rowValues(tmplCols, r as unknown as Record<string, unknown>)).join(",\n") + ";");
  } else {
    lines.push("-- (no rows)");
  }
  lines.push("");

  // ── User Profiles ──
  const profiles = await prisma.userProfile.findMany({ orderBy: { createdAt: "asc" } });
  const profileCols = ["id", "userId", "categoryId", "templateId", "templateLocked", "slug", "isPublished", "viewCount", "dynamicJsonData", "qrLocked", "qrGeneratedAt", "qrScanCount", "nfcWriteCount", "nfcProgrammedAt", "paymentStatus", "metaTitle", "metaDescription", "ogImageUrl", "createdAt", "updatedAt"];
  lines.push(`-- Table: user_profiles (${profiles.length} rows)`);
  if (profiles.length) {
    lines.push(`INSERT INTO user_profiles (${profileCols.join(", ")}) VALUES`);
    lines.push(profiles.map((r) => rowValues(profileCols, r as unknown as Record<string, unknown>)).join(",\n") + ";");
  } else {
    lines.push("-- (no rows)");
  }
  lines.push("");

  // ── Payments ──
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: "asc" } });
  const payCols = ["id", "userId", "userProfileId", "tier", "amount", "currency", "screenshotUrl", "status", "adminNote", "reviewedAt", "reviewedBy", "createdAt", "updatedAt"];
  lines.push(`-- Table: payments (${payments.length} rows)`);
  if (payments.length) {
    lines.push(`INSERT INTO payments (${payCols.join(", ")}) VALUES`);
    lines.push(payments.map((r) => rowValues(payCols, r as unknown as Record<string, unknown>)).join(",\n") + ";");
  } else {
    lines.push("-- (no rows)");
  }
  lines.push("");

  lines.push("SET FOREIGN_KEY_CHECKS = 1;");
  lines.push(
    `-- End of backup — ${users.length} users, ${sessionCount} sessions (omitted), ${categories.length} categories, ${templates.length} templates, ${profiles.length} profiles, ${payments.length} payments`
  );

  return lines.join("\n");
}
