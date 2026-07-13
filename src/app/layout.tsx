// src/app/layout.tsx
// Root layout — applies global fonts, ThemeProvider, metadata

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/theme-context";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://nexcard.io"),
  title: {
    default: "NEX CARD — Your Digital Identity, Elevated",
    template: "%s — NEX CARD",
  },
  description:
    "Create stunning digital name cards, portfolios, business pages, and wedding invitations with 20 premium templates. Share via QR code & NFC.",
  keywords: ["digital name card", "NFC card", "QR card", "portfolio", "wedding invitation", "business page", "digital presence", "NEX CARD"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} nc-dark`}>
      <body className={`${inter.className} antialiased`} style={{ background: "var(--nc-bg)" }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}