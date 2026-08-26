// src/app/api/admin/export-card/[profileId]/route.ts
// Generates a print-ready PDF for an NFC card (front + back)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { APP_URL } from "@/lib/env";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

// Card dimensions in mm (CR80 standard)
const CARD_W = 85;
const CARD_H = 54;

// PDF page dimensions (A4 landscape) in mm
const PAGE_W = 297;
const PAGE_H = 210;

// Theme colours
const THEMES = {
  dark: {
    bg: [0, 0, 0] as [number, number, number],
    qr: [212, 175, 55] as [number, number, number],
    text: [212, 175, 55] as [number, number, number],
    accent: [212, 175, 55] as [number, number, number],
  },
  light: {
    bg: [255, 255, 255] as [number, number, number],
    qr: [30, 60, 110] as [number, number, number],
    text: [30, 60, 110] as [number, number, number],
    accent: [30, 60, 110] as [number, number, number],
  },
} as const;

type ThemeKey = keyof typeof THEMES;

function drawBackSide(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: ThemeKey
) {
  if (theme === "dark") {
    // Black background
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(x, y, w, h, 3, 3, "F");

    // Gold wavy lines
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.15);
    for (let i = 0; i < 25; i++) {
      const points: number[][] = [];
      const baseY = y + h * 0.45 + i * 1.2;
      let prevX = x;
      let prevY = baseY;
      for (let sx = 0; sx <= 40; sx++) {
        const px = x + (w * sx) / 40;
        const py = baseY + Math.sin(sx * 0.3 + i * 0.2) * (3 + i * 0.3);
        points.push([px - prevX, py - prevY]);
        prevX = px;
        prevY = py;
      }
      doc.lines(points, x, baseY, [1, 1], "S", false);
    }

    // "www.wetechmm.com" top right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(212, 175, 55);
    doc.text("www.wetechmm.com", x + w - 1, y + 4, { align: "right" });
  } else {
    // White background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, w, h, 3, 3, "F");

    // Dark gray wavy lines
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.15);
    for (let i = 0; i < 25; i++) {
      const points: number[][] = [];
      const baseY = y + h * 0.45 + i * 1.2;
      let prevX = x;
      let prevY = baseY;
      for (let sx = 0; sx <= 40; sx++) {
        const px = x + (w * sx) / 40;
        const py = baseY + Math.sin(sx * 0.3 + i * 0.2) * (3 + i * 0.3);
        points.push([px - prevX, py - prevY]);
        prevX = px;
        prevY = py;
      }
      doc.lines(points, x, baseY, [1, 1], "S", false);
    }

    // "www.wetechmm.com" top right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 60, 110);
    doc.text("www.wetechmm.com", x + w - 1, y + 4, { align: "right" });
  }
}

function drawNfcWaves(
  doc: jsPDF,
  cx: number,
  cy: number,
  color: [number, number, number],
  scale: number
) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3 * scale);

  for (let i = 1; i <= 3; i++) {
    const r = (4 + i * 2.5) * scale;

    // Left WiFi arcs — draw as line segments via doc.lines()
    const leftPoints: number[][] = [];
    const lStart = (70 * Math.PI) / 180;
    const lEnd = (290 * Math.PI) / 180;
    const lStep = (lEnd - lStart) / 20;
    let prevX = cx - 5 * scale + r * Math.cos(lStart);
    let prevY = cy + r * Math.sin(lStart);
    for (let s = 1; s <= 20; s++) {
      const angle = lStart + lStep * s;
      const nx = cx - 5 * scale + r * Math.cos(angle);
      const ny = cy + r * Math.sin(angle);
      leftPoints.push([nx - prevX, ny - prevY]);
      prevX = nx;
      prevY = ny;
    }
    doc.lines(leftPoints, cx - 5 * scale + r * Math.cos(lStart), cy + r * Math.sin(lStart), [1, 1], "S", false);

    // Right WiFi arcs
    const rightPoints: number[][] = [];
    const rStart = (110 * Math.PI) / 180;
    const rEnd = (250 * Math.PI) / 180;
    const rStep = (rEnd - rStart) / 20;
    prevX = cx + 5 * scale + r * Math.cos(rStart);
    prevY = cy + r * Math.sin(rStart);
    for (let s = 1; s <= 20; s++) {
      const angle = rStart + rStep * s;
      const nx = cx + 5 * scale + r * Math.cos(angle);
      const ny = cy + r * Math.sin(angle);
      rightPoints.push([nx - prevX, ny - prevY]);
      prevX = nx;
      prevY = ny;
    }
    doc.lines(rightPoints, cx + 5 * scale + r * Math.cos(rStart), cy + r * Math.sin(rStart), [1, 1], "S", false);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    // Auth check — admin or profile owner
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await params;
    const theme = (request.nextUrl.searchParams.get("theme") ?? "dark") as ThemeKey;

    if (!["dark", "light"].includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Fetch profile with user
    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, name: true } },
        category: { select: { name: true, slug: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only admin or owner can export
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.id !== profile.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profileUrl = `${APP_URL}/p/${profile.slug}`;
    const colors = THEMES[theme];

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      width: 400,
      margin: 0,
      color: {
        dark: `#${colors.qr[0].toString(16).padStart(2, "0")}${colors.qr[1].toString(16).padStart(2, "0")}${colors.qr[2].toString(16).padStart(2, "0")}`,
        light: "#ffffff00",
      },
      errorCorrectionLevel: "H",
    });

    // Load back image
    // (back side is drawn programmatically below)

    // Create PDF (A4 landscape)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [PAGE_W, PAGE_H],
    });

    // ── Front side (top half) ───────────────────────────────────────────
    const frontX = (PAGE_W - CARD_W) / 2;
    const frontY = (PAGE_H / 2 - CARD_H) / 2;

    // Card background
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.roundedRect(frontX, frontY, CARD_W, CARD_H, 3, 3, "F");

    // Border
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(frontX, frontY, CARD_W, CARD_H, 3, 3, "S");

    // QR code (centered, 28mm)
    const qrSize = 28;
    const qrX = frontX + (CARD_W - qrSize) / 2;
    const qrY = frontY + 6;
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // NFC waves around QR
    const waveCx = frontX + CARD_W / 2;
    const waveCy = qrY + qrSize / 2;
    drawNfcWaves(doc, waveCx, waveCy, colors.accent, 1);

    // "NEX CARD" text below QR
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const textY = qrY + qrSize + 7;
    const textW = doc.getTextWidth("NEX CARD");
    doc.text("NEX CARD", frontX + (CARD_W - textW) / 2, textY);

    // ── Back side (bottom half) ─────────────────────────────────────────
    const backY = PAGE_H / 2 + (PAGE_H / 2 - CARD_H) / 2;

    // Draw back side
    drawBackSide(doc, frontX, backY, CARD_W, CARD_H, theme);

    // ── Crop marks ──────────────────────────────────────────────────────
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    const markLen = 4;

    // Front crop marks
    const frontCorners: [number, number][] = [
      [frontX, frontY],
      [frontX + CARD_W, frontY],
      [frontX, frontY + CARD_H],
      [frontX + CARD_W, frontY + CARD_H],
    ];
    for (const [x, y] of frontCorners) {
      const dx = x === frontX ? -markLen : markLen;
      const dy = y === frontY ? -markLen : markLen;
      doc.line(x + dx, y, x, y);
      doc.line(x, y + dy, x, y);
    }

    // Back crop marks
    const backCorners: [number, number][] = [
      [frontX, backY],
      [frontX + CARD_W, backY],
      [frontX, backY + CARD_H],
      [frontX + CARD_W, backY + CARD_H],
    ];
    for (const [x, y] of backCorners) {
      const dx = x === frontX ? -markLen : markLen;
      const dy = y === backY ? -markLen : markLen;
      doc.line(x + dx, y, x, y);
      doc.line(x, y + dy, x, y);
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="nex-card-${profile.slug}-${theme}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[export-card]", error);
    return NextResponse.json(
      { error: "Failed to generate card" },
      { status: 500 }
    );
  }
}
