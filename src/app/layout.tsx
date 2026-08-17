// src/app/layout.tsx
// Root layout — applies global fonts, ThemeProvider, metadata

import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { headers } from "next/headers";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { ThemeRoot } from "./_components/theme-root";
import { MaintenanceContent } from "./maintenance/maintenance-content";
import { isMaintenanceMode as isMaintenanceModeEnv } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a8a",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.nexcard.wetechmm.com"),
  title: {
    default: "NEX CARD — Your Digital Identity, Elevated",
    template: "%s — NEX CARD",
  },
  description:
    "Create stunning digital name cards, portfolios, business pages, and wedding invitations with 20 premium templates. Share via QR code.",
  keywords: ["digital name card", "QR card", "portfolio", "wedding invitation", "business page", "digital presence", "NEX CARD"],
  authors: [{ name: "NEX CARD" }],
  creator: "NEX CARD",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NEX CARD",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@nexcard",
  },
};

const themeBootScript = `
(function(){
  try {
    var t = localStorage.getItem('nexcard-theme');
    var root = document.documentElement;
    if (t === 'light') { root.classList.add('nc-light'); root.classList.remove('nc-dark'); }
    else { root.classList.add('nc-dark'); root.classList.remove('nc-light'); }
  } catch (e) {}
})();
`;

/**
 * Maintenance mode from:
 *  1. Environment variable MAINTENANCE_MODE=true  (manual / CI-CD)
 *  2. data/settings.json maintenance_mode field   (admin panel toggle)
 */
function isMaintenanceMode(): boolean {
  if (isMaintenanceModeEnv()) return true;
  try {
    const raw = readFileSync(join(process.cwd(), "data", "settings.json"), "utf-8");
    return JSON.parse(raw).maintenance_mode === true;
  } catch {
    return false;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const maintenanceOn = isMaintenanceMode();

  let isBypassed = false;
  if (maintenanceOn) {
    const hdrs = await headers();
    isBypassed = hdrs.get("x-maintenance-bypass") === "1";
  }

  const showMaintenance = maintenanceOn && !isBypassed;

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} nc-dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${inter.className} antialiased`} style={{ background: "var(--nc-bg)" }}>
        <RegisterServiceWorker />
        <ThemeRoot>
          {showMaintenance ? <MaintenanceContent /> : children}
        </ThemeRoot>
      </body>
    </html>
  );
}
