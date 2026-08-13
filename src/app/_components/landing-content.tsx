"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ThemeProvider, useTheme } from "@/lib/theme/theme-context";
import { NexCardLogo } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Hero3D from "./hero-3d";
import ScrollToTop from "./scroll-to-top";
import AiAssistant from "./ai-assistant";

/* ────────────────────────────────────────────────────────────────────────────
   Reusable Framer Motion wrappers
   ──────────────────────────────────────────────────────────────────────────── */

function FadeIn({ children, delay = 0, className = "", ...props }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  [key: string]: unknown;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className = "", staggerDelay = 0.1 }: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Icons
   ──────────────────────────────────────────────────────────────────────────── */

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
}

export default function LandingContent({ isLoggedIn }: LandingContentProps) {
  return (
    <ThemeProvider>
      <LandingInner isLoggedIn={isLoggedIn} />
    </ThemeProvider>
  );
}

function LandingInner({ isLoggedIn }: LandingContentProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeCategory, setActiveCategory] = useState("All");

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
    { name: "Aurora", cat: "Name Card", accent: "#6366f1" },
    { name: "Obsidian", cat: "Name Card", accent: "#f59e0b" },
    { name: "Canvas", cat: "Portfolio", accent: "#0ea5e9" },
    { name: "Studio", cat: "Portfolio", accent: "#ec4899" },
    { name: "Marquee", cat: "Business", accent: "#ef4444" },
    { name: "Vault", cat: "Business", accent: "#d4af37" },
    { name: "Eternal", cat: "Wedding", accent: "#c9a96e" },
    { name: "Celestial", cat: "Wedding", accent: "#a78bfa" },
  ];

  const CATEGORIES = ["All", "Name Card", "Portfolio", "Business", "Wedding"];

  const filteredTemplates = activeCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.cat === activeCategory);

  const STEPS = [
    { n: "01", title: "Choose a Category", desc: "Name card, portfolio, business, or wedding." },
    { n: "02", title: "Pick a Template", desc: "20 world-class templates. Preview before you commit." },
    { n: "03", title: "Fill Your Content", desc: "Add your details, links, photos, and contact info." },
    { n: "04", title: "Publish & Share", desc: "Go live instantly. Share via QR code or NFC tap." },
  ];

  const STATS = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Cards Created" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "User Rating" },
  ];

  return (
    <main style={{ background: "var(--nc-bg)", color: "var(--nc-text)", minHeight: "100vh" }}>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b"
        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)", backdropFilter: "blur(20px)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href={homeHref} className="flex items-center gap-2.5">
            <NexCardLogo size={36} isDark={isDark} />
            <span className="text-lg font-black leading-none" style={{ color: isDark ? "#d4af37" : "#2d6eb5" }}>NEX CARD</span>
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
          <div className="flex items-center gap-3">
            <ThemeToggle size="lg" />
            {!isLoggedIn ? (
              <>
                <Link href="/login"
                  className="hidden rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 sm:block"
                  style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
                  Sign In
                </Link>
                <Link href="/register"
                  className="nc-btn-brand rounded-xl px-4 py-2 text-sm font-black transition-all hover:opacity-90">
                  Get Started Free
                </Link>
              </>
            ) : (
              <Link href="/dashboard"
                className="nc-btn-brand rounded-xl px-4 py-2 text-sm font-black transition-all hover:opacity-90">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Hero3D isLoggedIn={isLoggedIn} />

      {/* ════════════════════════ SOCIAL PROOF BAR ════════════════════════ */}
      <section className="relative border-y px-6 py-10"
        style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-2, var(--nc-bg))" }}>
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "var(--nc-text-3)" }}>
              Trusted by professionals worldwide
            </p>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-2 gap-6 md:grid-cols-4" staggerDelay={0.12}>
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
      <section id="features" className="relative px-6 py-28 overflow-hidden"
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

          <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
            {FEATURES.map((f, i) => (
              <StaggerItem key={f.title}>
                <div className="group relative h-full">
                  <motion.div
                    whileHover={{ y: -6, transition: { duration: 0.3 } }}
                    className="relative h-full rounded-3xl p-8 transition-shadow duration-500"
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
                  </motion.div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════════ TEMPLATES ═════════════════════════════════ */}
      <section id="templates" className="relative px-6 py-28 overflow-hidden"
        style={{ background: "var(--nc-bg-2, var(--nc-bg))" }}>
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[100px] opacity-[0.08]" aria-hidden
          style={{ background: "var(--nc-brand-grad)" }} />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-[100px] opacity-[0.08]" aria-hidden
          style={{ background: "var(--nc-brand-grad)" }} />

        <div className="relative mx-auto max-w-6xl">
          <FadeIn className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>Templates</p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl" style={{ color: "var(--nc-text)" }}>
              World-class designs
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              Researched and built to the standard of Stripe, Linear, and Awwwards winners.
            </p>
          </FadeIn>

          {/* Category pills */}
          <FadeIn delay={0.2} className="mb-12 flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer rounded-full px-5 py-2 text-xs font-bold transition-all duration-300"
                  style={{
                    background: isActive ? "var(--nc-brand-grad)" : "var(--nc-bg-card)",
                    color: isActive ? "var(--nc-brand-text)" : "var(--nc-text-3)",
                    border: `1px solid ${isActive ? "transparent" : "var(--nc-border)"}`,
                    boxShadow: isActive ? "var(--nc-glow)" : "none",
                  }}>
                  {cat}
                </motion.button>
              );
            })}
          </FadeIn>

          {/* Template grid */}
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTemplates.map((t, i) => (
              <motion.div
                key={t.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <div className="group cursor-pointer">
                  <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative overflow-hidden rounded-3xl transition-shadow duration-500"
                    style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}
                  >
                    {/* Phone mockup preview */}
                    <div className="relative mx-auto mt-6 h-52 w-36 overflow-hidden rounded-2xl"
                      style={{ background: `linear-gradient(135deg, ${t.accent}15, ${t.accent}05)`, border: `1px solid ${t.accent}20` }}>
                      <div className="absolute inset-3 flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 rounded-full" style={{ background: `${t.accent}25` }} />
                        <div className="h-2 w-16 rounded-full" style={{ background: `${t.accent}15` }} />
                        <div className="h-2 w-12 rounded-full" style={{ background: `${t.accent}10` }} />
                        <div className="mt-2 h-1 w-20 rounded-full" style={{ background: `${t.accent}08` }} />
                        <div className="h-1 w-14 rounded-full" style={{ background: `${t.accent}08` }} />
                        <div className="mt-3 flex gap-1.5">
                          <div className="h-5 w-5 rounded-md" style={{ background: `${t.accent}15` }} />
                          <div className="h-5 w-5 rounded-md" style={{ background: `${t.accent}15` }} />
                          <div className="h-5 w-5 rounded-md" style={{ background: `${t.accent}15` }} />
                        </div>
                      </div>
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: `linear-gradient(105deg, transparent 30%, ${t.accent}10 50%, transparent 70%)` }} />
                    </div>
                    {/* Card info */}
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-sm" style={{ color: "var(--nc-text)" }}>{t.name}</h3>
                          <span className="text-[11px] font-medium" style={{ color: "var(--nc-text-3)" }}>{t.cat}</span>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100"
                          style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <FadeIn delay={0.3} className="mt-14 text-center">
            <Link href={isLoggedIn ? "/dashboard" : "/register"}
              className="group/btn nc-btn-brand inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-black transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ boxShadow: "var(--nc-glow)" }}>
              {isLoggedIn ? "Manage My Templates" : "Browse All 20 Templates"}
              <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ══════════════════════════════ */}
      <section id="how-it-works" className="relative px-6 py-28 overflow-hidden"
        style={{ background: "var(--nc-bg)" }}>
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-[0.04]" aria-hidden
          style={{ background: "var(--nc-brand-grad)" }} />

        <div className="relative mx-auto max-w-5xl">
          <FadeIn className="mb-20 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>Process</p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl" style={{ color: "var(--nc-text)" }}>
              Live in 4 steps
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              From zero to live in under five minutes. No code required.
            </p>
          </FadeIn>

          <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:flex lg:items-start lg:gap-0" staggerDelay={0.15}>
            {STEPS.map((s, i) => (
              <StaggerItem key={s.n} className="flex-1">
                <div className="group relative text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
                    style={{
                      background: "var(--nc-bg-card)",
                      border: "2px solid var(--nc-line)",
                      boxShadow: "var(--nc-shadow)",
                    }}
                  >
                    <span className="text-2xl font-black" style={{
                      backgroundImage: "var(--nc-brand-grad)",
                      backgroundColor: "transparent",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}>{s.n}</span>
                  </motion.div>
                  <h3 className="mb-2 text-lg font-black" style={{ color: "var(--nc-text)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="pointer-events-none absolute top-10 hidden lg:block"
                    style={{ left: "calc(50% + 44px)", right: "calc(-50% + 44px)", height: "2px", background: "var(--nc-line)" }} />
                )}
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════════ CTA ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: "var(--nc-bg)" }}>
        <div className="relative px-6 py-32">
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
                className="group/cta nc-btn-brand inline-flex items-center gap-3 rounded-2xl px-12 py-5 text-base font-black transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]"
                style={{ boxShadow: "0 12px 40px rgba(212,175,55,0.4)" }}>
                {isLoggedIn ? "Go to Dashboard" : "Create Your Card"}
                <svg className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {["No credit card required", "20 premium templates", "QR + NFC ready"].map((item) => (
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
        <div className="mx-auto max-w-6xl px-6 py-16">
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
                <div className="mt-6 flex items-center gap-3">
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
                    style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
                    style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
                    style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
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
                © {new Date().getFullYear()} NEX CARD. All Rights Reserved. Developed by{" "}
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
