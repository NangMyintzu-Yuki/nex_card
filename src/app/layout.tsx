// src/app/layout.tsx
// Root layout — applies global fonts, metadata, and theme

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://presencecard.io"),
  title: {
    default: "PresenceCard — Your Digital Identity, Elevated",
    template: "%s — PresenceCard",
  },
  description:
    "Create stunning digital name cards, portfolios, business pages, and wedding invitations with 20 premium templates.",
  keywords: ["digital name card", "portfolio", "wedding invitation", "business page", "digital presence"],
  authors: [{ name: "PresenceCard" }],
  creator: "PresenceCard",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PresenceCard",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@presencecard",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}