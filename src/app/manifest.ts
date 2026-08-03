// src/app/manifest.ts
// Web app manifest for installability and SEO signals

import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NEX CARD",
    short_name: "NEX CARD",
    description:
      "Create stunning digital name cards, portfolios, business pages, and wedding invitations.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#1e3a8a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    id: APP_URL,
  };
}
