"use client";

import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";

type TocItem = { id: string; label: string };

export default function LegalLayout({
  title,
  description,
  toc,
  children,
}: {
  title: string;
  description: string;
  toc: TocItem[];
  children: React.ReactNode;
}) {
  const headerRef = useScrollReveal<HTMLElement>();
  const contentRef = useScrollReveal<HTMLElement>();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}
    >
      {/* Header */}
      <header
        ref={headerRef}
        className="border-b"
        style={{ borderColor: "var(--nc-border)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--nc-text-3)" }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1
            className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--nc-text)" }}
          >
            {title}
          </h1>
          <p
            className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: "var(--nc-text-2)" }}
          >
            {description}
          </p>
          <p
            className="mt-6 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--nc-text-3)" }}
          >
            Last Updated: July 18, 2026
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Sticky TOC sidebar */}
          <aside className="shrink-0 lg:w-56">
            <nav
              className="mb-8 rounded-2xl border p-4 lg:sticky lg:top-24 lg:mb-0 lg:block lg:p-5"
              style={{
                background: "var(--nc-bg-card)",
                borderColor: "var(--nc-border)",
              }}
            >
              <h2
                className="mb-4 text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--nc-text-3)" }}
              >
                On this page
              </h2>
              <ul className="flex flex-wrap gap-1 lg:block lg:space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-1.5 text-sm transition-all duration-200 hover:translate-x-1 lg:hover:translate-x-1"
                      style={{ color: "var(--nc-text-2)" }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <main
            ref={contentRef}
            className="prose-nc min-w-0 flex-1"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
