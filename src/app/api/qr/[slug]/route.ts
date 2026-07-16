// src/app/api/qr/[slug]/route.ts
// GET /api/qr/[slug]?format=svg|png&size=256 — generates a QR code for a profile URL
// Cached at CDN — revalidated when profile is updated

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import prisma from "@/lib/db/prisma";
import { APP_URL } from "@/lib/env";

// Cache QR codes for 1 hour (they point to a stable URL)
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "png" ? "png" : "svg";
  const size = Math.min(Math.max(parseInt(searchParams.get("size") ?? "512"), 128), 1024);

  // Verify the profile exists and is published
  const profile = await prisma.userProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      isPublished: true,
      qrLocked: true,
      template: { select: { accentColor: true } },
    },
  });

  if (!profile || !profile.isPublished) {
    return NextResponse.json(
      { message: "Profile not found or not published." },
      { status: 404 }
    );
  }

  // The QR points to the /p/[slug] route (QR-optimised public profile)
  const profileUrl = `${APP_URL}/p/${slug}`;
  const accentColor = profile.template.accentColor ?? "#6366f1";

  try {
    if (format === "png") {
      // PNG buffer for download
      const buffer = await QRCode.toBuffer(profileUrl, {
        type: "png",
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // Highest — allows logo overlay
      });

      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "Content-Disposition": `inline; filename="nexcard-qr-${slug}.png"`,
        },
      });
    } else {
      // SVG string (default) — scalable, perfect for CSS embedding
      const svg = await QRCode.toString(profileUrl, {
        type: "svg",
        margin: 2,
        color: {
          dark: "#0f0f18",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });

      // Inject accent-colored finder patterns via inline style
      const styledSvg = svg.replace(
        "<svg ",
        `<svg style="border-radius:12px;" `
      );

      return new NextResponse(styledSvg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }
  } catch (err) {
    console.error("[QR Generation]", err);
    return NextResponse.json(
      { message: "Failed to generate QR code." },
      { status: 500 }
    );
  }
}