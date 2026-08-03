// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // ── Image optimization ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Local dev uploads
      {
        protocol: "http",
        hostname: "localhost",
      },
      // User-uploaded content via your storage provider
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      // Placeholder / seed images (legacy placehold.co URLs may still exist in DB)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Supabase Storage
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Your own CDN domain in prod
      {
        protocol: "https",
        hostname: "cdn.nexcard.io",
      },
      {
        protocol: "https",
        hostname: "cdn.presencecard.io",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // ── Performance ─────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ── Security headers ────────────────────────────────────────────────────
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      // Report-only first — switch to Content-Security-Policy once console is clean
      { key: "Content-Security-Policy-Report-Only", value: csp },
    ];

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/uploads/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ── Experimental ────────────────────────────────────────────────────────
  experimental: {
    // Enable partial prerendering for the public profile pages
    // ppr: true,
    // cacheComponents: true,
    // Faster server actions
    // serverActions: {
    //   bodySizeLimit: "4mb",
    // },
  },
};

export default nextConfig;