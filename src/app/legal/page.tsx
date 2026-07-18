"use client";

import Link from "next/link";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { useScrollRevealChildren } from "@/lib/hooks/use-scroll-reveal";

const DOCUMENTS = [
  {
    title: "Privacy Policy",
    desc: "How we collect, use, and protect your personal information.",
    href: "/legal/privacy",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Terms of Service",
    desc: "The rules and guidelines for using NEX CARD.",
    href: "/legal/terms",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: "Cookie Policy",
    desc: "What cookies we use and how to manage your preferences.",
    href: "/legal/cookies",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
      </svg>
    ),
  },
];

export default function LegalPage() {
  const cardsRef = useScrollRevealChildren<HTMLDivElement>();

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
        <header className="border-b" style={{ borderColor: "var(--nc-border)" }}>
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--nc-brand-2)" }}>
              Legal
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl" style={{ color: "var(--nc-text)" }}>
              Legal Documents
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              Important information about your rights, our responsibilities, and how we handle your data.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <div ref={cardsRef} className="sr-stagger grid gap-6 sm:grid-cols-3">
            {DOCUMENTS.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="sr-item group rounded-2xl border p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: "var(--nc-bg-card)",
                  borderColor: "var(--nc-border)",
                  boxShadow: "var(--nc-shadow)",
                }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
                  style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}
                >
                  {doc.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--nc-text)" }}>
                  {doc.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
                  {doc.desc}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                  style={{ color: "var(--nc-brand-2)" }}
                >
                  Read
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ThemeProvider>
  );
}
