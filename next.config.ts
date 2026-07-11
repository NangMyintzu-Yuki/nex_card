// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image optimization ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // User-uploaded content via your storage provider
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      // Placeholder / seed images
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
      // Your own CDN domain in prod
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
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Cache static assets aggressively
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

  // ── Redirects ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin",
        permanent: false,
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