// src/app/api/admin/export-card/[profileId]/route.ts
// Server-side SVG card — front only with dynamic QR

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { APP_URL } from "@/lib/env";
import QRCode from "qrcode";

const THEMES = {
  dark: {
    bg: "#000000",
    qr: "#d4af37",
    text: "#d4af37",
    frameBorder: "#d4af37",
    wave: "rgba(212,175,55,0.4)",
  },
  light: {
    bg: "#ffffff",
    qr: "#1a1a2e",
    text: "#1a1a2e",
    frameBorder: "#1e3a6b",
    wave: "rgba(30,60,107,0.25)",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

function svgEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await params;
    const theme = (request.nextUrl.searchParams.get("theme") ?? "dark") as ThemeKey;

    if (!["dark", "light"].includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

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

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.id !== profile.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profileUrl = `${APP_URL}/p/${profile.slug}`;
    const c = THEMES[theme];
    const W = 856;
    const H = 540;
    const cx = W / 2;
    const cy = H / 2 - 20;
    const frameSize = 220;
    const qrSize = 170;

    const qrSvg = await QRCode.toString(profileUrl, {
      type: "svg",
      width: qrSize,
      margin: 0,
      color: { dark: c.qr, light: "#ffffff00" },
      errorCorrectionLevel: "H",
    });
    const qrInner = qrSvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

    // NFC wave arcs
    const waveOffsetX = 38;
    const waveArcs: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const r = 28 + i * 18;
      // Left arcs
      waveArcs.push(
        `<circle cx="${cx - waveOffsetX}" cy="${cy}" r="${r}" fill="none" stroke="${c.wave}" stroke-width="4" stroke-linecap="round"
          stroke-dasharray="${r * 1.5} ${r * 1.5}" stroke-dashoffset="0"
          clip-path="url(#leftClip)"/>`
      );
      // Right arcs
      waveArcs.push(
        `<circle cx="${cx + waveOffsetX}" cy="${cy}" r="${r}" fill="none" stroke="${c.wave}" stroke-width="4" stroke-linecap="round"
          stroke-dasharray="${r * 1.5} ${r * 1.5}" stroke-dashoffset="0"
          clip-path="url(#rightClip)"/>`
      );
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <clipPath id="leftClip">
      <rect x="0" y="0" width="${cx}" height="${H}"/>
    </clipPath>
    <clipPath id="rightClip">
      <rect x="${cx}" y="0" width="${W - cx}" height="${H}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- NFC wave arcs -->
  ${waveArcs.join("\n  ")}

  <!-- QR frame -->
  <rect x="${cx - frameSize / 2}" y="${cy - frameSize / 2}" width="${frameSize}" height="${frameSize}" rx="28" ry="28"
    fill="${c.bg}" stroke="${c.frameBorder}" stroke-width="6"/>

  <!-- QR code -->
  <svg x="${cx - qrSize / 2}" y="${cy - qrSize / 2}" viewBox="0 0 ${qrSize} ${qrSize}" width="${qrSize}" height="${qrSize}">
    ${qrInner}
  </svg>

  <!-- NEX CARD text -->
  <text x="${cx}" y="${cy + frameSize / 2 + 30}" text-anchor="middle"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="bold" font-size="36"
    fill="${c.text}">NEX CARD</text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="nex-card-${profile.slug}-${theme}.svg"`,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch (error) {
    console.error("[export-card]", error);
    return NextResponse.json({ error: "Failed to generate card" }, { status: 500 });
  }
}
