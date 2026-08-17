// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // ── Image optimization ──────────────────────────────────────────────────
  images: {
    unoptimized: false,
    remotePatterns: [
      // Local dev uploads
      {
        protocol: "http",
        hostname: "localhost",
      },
      // R2 public bucket domains
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      // R2 custom domain
      {
        protocol: "https",
        hostname: "cdn.nexcard.wetechmm.com",
      },
      {
        protocol: "https",
        hostname: "cdn.www.nexcard.wetechmm.com",
      },
      // Seed / onboarding preview images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // Optional storage drivers
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
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
    // Webpack Fast Refresh uses eval() in `next dev`. Keep it out of production.
    const scriptSrc = isProd
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
    const connectSrc = isProd
      ? "connect-src 'self' https:"
      : "connect-src 'self' https: http: ws: wss:";
    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      connectSrc,
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
        value: "camera=(self), microphone=(), geolocation=()",
      },
      // Enforced CSP. District/Neon fonts are next/font (self-hosted), so Google Fonts
      // origins are not required. Remaining 'unsafe-inline' is for template <style> CSS.
      { key: "Content-Security-Policy", value: csp },
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
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;