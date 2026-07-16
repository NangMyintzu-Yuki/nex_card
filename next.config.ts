// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // ── Image optimization ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
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