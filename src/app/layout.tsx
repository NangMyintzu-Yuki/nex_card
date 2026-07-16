// src/app/layout.tsx
// Root layout — applies global fonts, ThemeProvider, metadata

import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://nexcard.io"),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} nc-dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${inter.className} antialiased`} style={{ background: "var(--nc-bg)" }}>
        {children}
      </body>
    </html>
  );
}