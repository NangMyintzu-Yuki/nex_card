// src/app/api/og/route.tsx
// Dynamic Open Graph image generation using Next.js ImageResponse
// Generates a branded card image when no custom ogImageUrl is set

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";


// Cache OG images at the CDN for 1 hour
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }

  // Fetch just the fields needed for the OG image
  const profile = await prisma.userProfile.findUnique({
    where: { slug, isPublished: true },
    select: {
      metaTitle: true,
      metaDescription: true,
      user: { select: { name: true, avatarUrl: true } },
      category: { select: { name: true } },
      template: {
        select: { name: true, accentColor: true },
      },
    },
  });

  const title = profile?.metaTitle ?? profile?.user.name ?? "PresenceCard";
  const subtitle =
    profile?.metaDescription ??
    `${profile?.category.name ?? "Digital Profile"} · ${profile?.template.name ?? ""}`;
  const accentColor = profile?.template.accentColor ?? "#6366f1";
  const categoryName = profile?.category.name ?? "PresenceCard";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "64px",
          background: `linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f1a 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}30, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "-50px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #06b6d420, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo + brand */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "64px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            ✦
          </div>
          <span
            style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", fontWeight: 600 }}
          >
            PresenceCard
          </span>
        </div>

        {/* Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
              borderRadius: "9999px",
              padding: "6px 16px",
              fontSize: "14px",
              color: accentColor,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {categoryName}
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "white",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
            marginBottom: "16px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {subtitle.slice(0, 120)}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "64px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "monospace",
          }}
        >
          presencecard.io/{slug}
        </div>

        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${accentColor}, #06b6d4, #8b5cf6)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
