"use client";

import { useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ThemeProvider, useTheme } from "@/lib/theme/theme-context";
import { NexCardLogo } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Hero3D from "./hero-3d";
import ScrollToTop from "./scroll-to-top";
import AiAssistant from "./ai-assistant";

/* ────────────────────────────────────────────────────────────────────────────
   Scroll-triggered CSS reveals (.nc-reveal + IntersectionObserver)
   ──────────────────────────────────────────────────────────────────────────── */

function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.classList.remove("nc-wait");
      el.classList.add("nc-in");
    };

    el.classList.add("nc-wait");

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -18% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`nc-reveal ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function StaggerChildren({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`nc-stagger ${className}`}>
      {children}
    </div>
  );
}

function StaggerItem({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`nc-reveal ${className}`}>{children}</div>;
}

function ScaleIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`nc-reveal ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────────────────────────────────────── */

function TemplateMini({ cat, accent }: { cat: string; accent: string }) {
  if (cat === "Portfolio") {
    return (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-1.5 p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-md" style={{ background: `${accent}${i % 2 === 0 ? "55" : "28"}` }} />
        ))}
      </div>
    );
  }
  if (cat === "Business") {
    return (
      <div className="flex h-full flex-col p-3">
        <div className="h-10 rounded-md" style={{ background: `${accent}66` }} />
        <div className="mt-2 h-2 w-2/3 rounded-full" style={{ background: `${accent}40` }} />
        <div className="mt-1.5 h-2 w-1/2 rounded-full" style={{ background: `${accent}28` }} />
        <div className="mt-auto flex gap-1">
          <div className="h-6 flex-1 rounded" style={{ background: `${accent}30` }} />
          <div className="h-6 flex-1 rounded" style={{ background: `${accent}30` }} />
        </div>
      </div>
    );
  }
  if (cat === "Wedding") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
        <div className="text-lg font-serif" style={{ color: accent }}>A · M</div>
        <div className="h-px w-10" style={{ background: accent }} />
        <div className="h-1.5 w-16 rounded-full" style={{ background: `${accent}40` }} />
        <div className="h-1.5 w-10 rounded-full" style={{ background: `${accent}28` }} />
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: accent, color: "#111" }}>
        AM
      </div>
      <div className="h-2 w-20 rounded-full" style={{ background: `${accent}55` }} />
      <div className="h-1.5 w-14 rounded-full" style={{ background: `${accent}30` }} />
      <div className="mt-1 flex gap-1.5">
        <div className="h-6 w-6 rounded-full" style={{ background: `${accent}35` }} />
        <div className="h-6 w-6 rounded-full" style={{ background: `${accent}35` }} />
        <div className="h-6 w-6 rounded-full" style={{ background: `${accent}35` }} />
      </div>
    </div>
  );
}

const FEATURE_ICONS = [
  <svg key="card" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
  <svg key="portfolio" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  <svg key="business" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  <svg key="wedding" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  <svg key="qr" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>,
  <svg key="nfc" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
];

/* ────────────────────────────────────────────────────────────────────────────
   Page component
   ──────────────────────────────────────────────────────────────────────────── */

interface LandingContentProps {
  isLoggedIn: boolean;
  preorderMode?: boolean;
}

export default function LandingContent({ isLoggedIn, preorderMode = false }: LandingContentProps) {
  return (
    <ThemeProvider>
      <LandingInner isLoggedIn={isLoggedIn} preorderMode={preorderMode} />
    </ThemeProvider>
  );
}

function LandingInner({ isLoggedIn, preorderMode = false }: LandingContentProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);

  const homeHref = isLoggedIn ? "/dashboard" : "/";

  const FEATURES = [
    { title: "Digital Name Card", desc: "Share your contact, social links, and vCard. Tap to save directly to any phone." },
    { title: "Portfolio", desc: "Showcase your work, skills, and experience. Perfect for developers, designers, CEOs." },
    { title: "Business Page", desc: "Full business website — logo, services, history, testimonials, hours, contact." },
    { title: "Wedding Invitation", desc: "Elegant digital invitations with love story, gallery, RSVP, and countdown timer." },
    { title: "QR Code Generation", desc: "Generate a branded QR code for print, events, and business cards." },
    { title: "NFC Tag Programming", desc: "Program NFC tags so anyone can tap your card on their phone — no app needed." },
  ];

  const TEMPLATES = [
    { name: "Aurora", cat: "Name Card", accent: "#6366f1", note: "Glass card", href: "/dashboard/onboarding/preview/digital-card-aurora" },
    { name: "Obsidian", cat: "Name Card", accent: "#f59e0b", note: "Dark editorial", href: "/dashboard/onboarding/preview/digital-card-obsidian" },
    { name: "Canvas", cat: "Portfolio", accent: "#0ea5e9", note: "Project grid", href: "/dashboard/onboarding/preview/portfolio-canvas" },
    { name: "Studio", cat: "Portfolio", accent: "#ec4899", note: "Full-bleed work", href: "/dashboard/onboarding/preview/portfolio-studio" },
    { name: "Marquee", cat: "Business", accent: "#f97316", note: "Retail & events", href: "/dashboard/onboarding/preview/business-marquee" },
    { name: "Vault", cat: "Business", accent: "#d4af37", note: "Finance & legal", href: "/dashboard/onboarding/preview/business-vault" },
    { name: "Eternal", cat: "Wedding", accent: "#c9a96e", note: "Classic serif", href: "/dashboard/onboarding/preview/wedding-eternal" },
    { name: "Celestial", cat: "Wedding", accent: "#a78bfa", note: "Night sky", href: "/dashboard/onboarding/preview/wedding-celestial" },
  ];

  const CATEGORIES = ["All", "Name Card", "Portfolio", "Business", "Wedding"];

  const filteredTemplates = activeCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.cat === activeCategory);

  const STEPS = [
    { n: "01", title: "Create an account", desc: "Sign up and verify your email. Takes about a minute." },
    { n: "02", title: "Choose a category", desc: "Name card, portfolio, business page, or wedding invite." },
    { n: "03", title: "Pick a template", desc: "Twenty layouts. Preview before you lock one in." },
    { n: "04", title: "Add your content", desc: "Name, photos, links, hours — whatever the page needs." },
    { n: "05", title: "Publish and share", desc: "Go live. Share the link, QR code, or NFC tap." },
  ];

  const STATS = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Cards Created" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "User Rating" },
  ];

  return (
    <main
      className={`${isDark ? "nc-dark" : "nc-light"} nc-page-enter`}
      style={{ background: "var(--nc-bg)", color: "var(--nc-text)", minHeight: "100vh" }}
    >

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)", backdropFilter: "blur(20px)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <Link href={homeHref} className="flex min-w-0 items-center gap-2">
            <NexCardLogo size={32} isDark={isDark} />
            <span className="truncate text-base font-black leading-none sm:text-lg" style={{ color: isDark ? "#d4af37" : "#2d6eb5" }}>NEX CARD</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {["Features", "Templates", "How it Works"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--nc-text-2)" }}>
                {l}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle size="md" />
            {!isLoggedIn ? (
              <>
                <Link href="/login"
                  className="hidden rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 sm:block"
                  style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
                  Sign In
                </Link>
                <Link href="/register"
                  className="nc-btn-brand rounded-xl px-3 py-2 text-xs font-black transition-all hover:opacity-90 sm:px-4 sm:text-sm">
                  {preorderMode ? "Reserve" : "Start"}
                </Link>
              </>
            ) : (
              <Link href="/dashboard"
                className="nc-btn-brand rounded-xl px-3 py-2 text-xs font-black transition-all hover:opacity-90 sm:px-4 sm:text-sm">
                Dashboard
              </Link>
            )}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl md:hidden"
              style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text)" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" /></svg>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t px-4 py-3 md:hidden" style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg)" }}>
            <nav className="flex flex-col gap-1">
              {["Features", "Templates", "How it Works"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold"
                  style={{ color: "var(--nc-text)" }}
                >
                  {l}
                </a>
              ))}
              {!isLoggedIn && (
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold sm:hidden"
                  style={{ color: "var(--nc-text-2)" }}>
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Hero3D isLoggedIn={isLoggedIn} preorderMode={preorderMode} />

      {/* ════════════════════════ SOCIAL PROOF BAR ════════════════════════ */}
      <section className="relative border-y px-4 py-10 sm:px-6"
        style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-2, var(--nc-bg))" }}>
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "var(--nc-text-3)" }}>
              Trusted by professionals worldwide
            </p>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <div className="text-center">
                  <p className="text-3xl font-black md:text-4xl" style={{
                    backgroundImage: "var(--nc-brand-grad)",
                    backgroundColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}>{s.value}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════════ FEATURES ══════════════════════════════════ */}
      <section id="features" className="relative scroll-mt-24 overflow-hidden px-4 py-20 sm:px-6 sm:py-28"
        style={{ background: "var(--nc-bg)" }}>
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.02]" aria-hidden
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--nc-text) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }} />

        <div className="relative mx-auto max-w-6xl">
          <FadeIn className="mb-20 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>Features</p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl" style={{ color: "var(--nc-text)" }}>
              Everything you need
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              Powerful tools to create, share, and manage your digital identity — all in one place.
            </p>
          </FadeIn>

          <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <StaggerItem key={f.title}>
                <div className="group relative h-full">
                  <div
                    className="nc-card-lift relative h-full rounded-3xl p-8"
                    style={{
                      background: "var(--nc-bg-card)",
                      border: "1px solid var(--nc-border)",
                      boxShadow: "var(--nc-shadow)",
                    }}
                  >
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: "var(--nc-brand-grad)",
                        color: "var(--nc-brand-text)",
                        boxShadow: "0 8px 24px rgba(212,175,55,0.25)",
                      }}>
                      {FEATURE_ICONS[i]}
                    </div>
                    <h3 className="mb-3 text-xl font-black" style={{ color: "var(--nc-text)" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{f.desc}</p>
                    <div className="absolute bottom-0 left-8 right-8 h-[2px] rounded-full opacity-0 transition-all duration-700 group-hover:opacity-100"
                      style={{ background: "var(--nc-brand-grad)" }} />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════════ TEMPLATES ═════════════════════════════════ */}
      <section id="templates" className="relative scroll-mt-24 px-4 py-20 sm:px-6 md:py-28"
        style={{ background: "var(--nc-bg-2, var(--nc-bg))" }}>
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: "var(--nc-brand-2)" }}>Templates</p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl" style={{ color: "var(--nc-text)" }}>
                Four categories. Twenty layouts.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed md:text-base" style={{ color: "var(--nc-text-2)" }}>
                Name card, portfolio, business, or wedding — pick a look, then fill it with your own content.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className="rounded-full px-4 py-2 text-xs font-semibold"
                    style={{
                      background: isActive ? "var(--nc-brand-grad)" : "transparent",
                      color: isActive ? "var(--nc-brand-text)" : "var(--nc-text-2)",
                      border: `1px solid ${isActive ? "transparent" : "var(--nc-border)"}`,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </FadeIn>

          <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTemplates.map((t) => (
              <StaggerItem key={t.name}>
              <Link
                href={isLoggedIn ? t.href : "/register"}
                className="nc-card-lift group relative z-10 block cursor-pointer overflow-hidden rounded-2xl no-underline"
                style={{
                  background: "var(--nc-bg-card)",
                  border: "1px solid var(--nc-border)",
                }}
              >
                <div
                  className="pointer-events-none h-40 w-full"
                  style={{
                    background: `linear-gradient(165deg, ${t.accent}22, transparent 70%), var(--nc-bg-3)`,
                    borderBottom: `1px solid ${t.accent}33`,
                  }}
                >
                  <TemplateMini cat={t.cat} accent={t.accent} />
                </div>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>{t.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--nc-text-3)" }}>{t.cat} · {t.note}</p>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--nc-brand-2)" }}>
                    {isLoggedIn ? "Preview" : "Use"} →
                  </span>
                </div>
              </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <div className="mt-12 text-center">
            <Link href={isLoggedIn ? "/dashboard" : "/register"}
              className="nc-btn-brand inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold">
              {isLoggedIn ? "Open dashboard" : "See all 20 templates"}
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ══════════════════════════════ */}
      <section id="how-it-works" className="relative scroll-mt-24 px-4 py-20 sm:px-6 md:py-28"
        style={{ background: "var(--nc-bg)" }}>
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-14 max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--nc-brand-2)" }}>Process</p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl" style={{ color: "var(--nc-text)" }}>
              Live in five steps
            </h2>
            <p className="mt-3 text-sm leading-relaxed md:text-base" style={{ color: "var(--nc-text-2)" }}>
              Account, category, template, content, then share. No code.
            </p>
          </FadeIn>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute left-7 top-8 bottom-8 w-px lg:left-[8%] lg:right-[8%] lg:top-7 lg:bottom-auto lg:h-px lg:w-auto"
              style={{ background: "var(--nc-line)" }}
            />
            <StaggerChildren className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-5">
              {STEPS.map((s) => (
                <StaggerItem
                  key={s.n}
                  className="relative flex gap-4 py-5 pl-0 lg:flex-col lg:py-0"
                >
                  <span
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
                    style={{
                      background: "var(--nc-bg)",
                      border: "1px solid var(--nc-border-brand)",
                      color: "var(--nc-brand-2)",
                    }}
                  >
                    {s.n}
                  </span>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-base font-semibold" style={{ color: "var(--nc-text)" }}>{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ════════════════════════ CTA ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: "var(--nc-bg)" }}>
        <div className="relative px-4 py-20 sm:px-6 sm:py-32">
          <div className="absolute inset-0 opacity-[0.06]" aria-hidden
            style={{ background: "var(--nc-brand-grad)" }} />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] animate-glow-orb" aria-hidden
            style={{ background: "var(--nc-brand-grad)", opacity: 0.1 }} />

          <div className="relative mx-auto max-w-3xl text-center">
            <ScaleIn className="mb-8 flex items-center justify-center gap-3">
              <NexCardLogo size={72} isDark={isDark} />
              <span className="text-4xl font-black leading-none md:text-5xl lg:text-6xl" style={{ color: isDark ? "#d4af37" : "#2d6eb5" }}>NEX CARD</span>
            </ScaleIn>
            <FadeIn delay={0.1}>
              <h2 className="text-4xl font-black tracking-tight mb-5 md:text-5xl lg:text-6xl" style={{ color: "var(--nc-text)" }}>
                Ready to stand out?
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg mb-10 leading-relaxed md:text-xl" style={{ color: "var(--nc-text-2)" }}>
                Join thousands using NEX CARD to share their digital presence.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <Link href={isLoggedIn ? "/dashboard" : "/register"}
                className="group/cta nc-btn-brand inline-flex max-w-full items-center gap-3 rounded-2xl px-6 py-4 text-sm font-black transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] sm:px-12 sm:py-5 sm:text-base"
                style={{ boxShadow: "0 12px 40px rgba(212,175,55,0.4)" }}>
                {isLoggedIn ? "Go to Dashboard" : preorderMode ? "Pre-order your card" : "Create Your Card"}
                <svg className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {(preorderMode
                  ? ["No payment yet — prices announced soon", "20 premium templates", "QR + NFC ready"]
                  : ["No credit card required", "20 premium templates", "QR + NFC ready"]
                ).map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
                    style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" style={{ color: "var(--nc-brand-2, #d4af37)" }} />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════════════════ */}
      <footer className="relative border-t"
        style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <FadeIn>
            <div className="grid gap-12 md:grid-cols-4">
              {/* Brand column */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2">
                  <NexCardLogo size={32} isDark={isDark} />
                  <span className="text-base font-black leading-none" style={{ color: isDark ? "#d4af37" : "#2d6eb5" }}>NEX CARD</span>
                </div>
                <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                  Your digital identity, elevated. Create stunning name cards, portfolios, and more.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  {[
                    {
                      name: "Facebook",
                      href: "#",
                      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                    },
                    {
                      name: "Viber",
                      href: "#",
                      path: "M11.4.007C9.473.033 5.2.344 3.048 2.547 1.463 4.186.598 6.653.598 9.576c0 1.6.39 3.501 1.13 5.283L.048 22.13a.477.477 0 0 0 .6.56l6.888-1.733c1.702.8 3.58 1.217 5.39 1.219h.028c4.902-.03 8.848-1.982 10.37-5.4 1.04-2.32.96-5.237-.22-7.905C21.405 4.907 16.9.085 11.4.007zm.133 1.62c4.76.078 8.694 4.16 10.05 7.804 1.027 2.32 1.098 4.856.197 6.868-1.3 2.896-4.722 4.6-9.1 4.624h-.02c-1.63 0-3.333-.38-4.87-1.1l-.348-.16-4.103 1.032 1.052-4.04-.18-.332c-.7-1.6-1.06-3.32-1.06-4.8 0-2.56.76-4.68 2.13-6.1 1.8-1.86 5.496-2.1 6.252-2.126z",
                    },
                    {
                      name: "Telegram",
                      href: "#",
                      path: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
                    },
                    {
                      name: "LinkedIn",
                      href: "#",
                      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                    },
                    {
                      name: "TikTok",
                      href: "#",
                      path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
                    },
                  ].map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      aria-label={s.name}
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
                      style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d={s.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Product links */}
              <div>
                <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--nc-text-2)" }}>Product</h4>
                <ul className="space-y-3">
                  {[["Features", "#features"], ["Templates", "#templates"], ["How it Works", "#how-it-works"], ["Pricing", "#"]].map(([l, h]) => (
                    <li key={l}>
                      <a href={h} className="text-sm transition-all duration-200 hover:translate-x-1 inline-block"
                        style={{ color: "var(--nc-text-3)" }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company links */}
              <div>
                <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--nc-text-2)" }}>Company</h4>
                <ul className="space-y-3">
                  {[["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Contact", "#"]].map(([l, h]) => (
                    <li key={l}>
                      <a href={h} className="text-sm transition-all duration-200 hover:translate-x-1 inline-block"
                        style={{ color: "var(--nc-text-3)" }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account links */}
              <div>
                <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--nc-text-2)" }}>Account</h4>
                <ul className="space-y-3">
                  {isLoggedIn ? (
                    <li>
                      <Link href="/dashboard" className="text-sm transition-all duration-200 hover:translate-x-1 inline-block"
                        style={{ color: "var(--nc-text-3)" }}>
                        Dashboard
                      </Link>
                    </li>
                  ) : (
                    [["Login", "/login"], ["Register", "/register"], ["Demo", "/alex-rivera"], ["Support", "#"]].map(([l, h]) => (
                      <li key={l}>
                        <Link href={h} className="text-sm transition-all duration-200 hover:translate-x-1 inline-block"
                          style={{ color: "var(--nc-text-3)" }}>
                          {l}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
              style={{ borderColor: "var(--nc-border)" }}>
              <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                © {new Date().getFullYear()} NEX CARD. All Rights Reserved.                 Developed by{" "}
                <a href="https://www.nangmyintzu.site/" target="_blank" rel="noopener noreferrer" style={{
                  backgroundImage: "var(--nc-brand-grad)",
                  backgroundColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  fontWeight: 700,
                }}>NMZ</a>
              </p>
              <div className="flex items-center gap-6">
                {[["Privacy Policy", "/legal/privacy"], ["Terms of Service", "/legal/terms"], ["Cookie Policy", "/legal/cookies"]].map(([l, h]) => (
                  <Link key={l} href={h} className="text-xs transition-colors duration-200 hover:opacity-70"
                    style={{ color: "var(--nc-text-3)" }}>
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </footer>

      <ScrollToTop />
      <AiAssistant />
    </main>
  );
}
