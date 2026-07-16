// src/app/page.tsx — NEX CARD marketing landing page
// Fully themed with CSS vars, supports both dark/gold and light/navy

import Link from "next/link";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { NexCardLogo } from "@/components/ui/nex-card-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  const FEATURES = [
    { emoji: "🪪", title: "Digital Name Card",        desc: "Share your contact, social links, and vCard — tap to save directly to any phone." },
    { emoji: "🎨", title: "Portfolio",                desc: "Showcase your work, skills, and experience. Perfect for developers, designers, CEOs." },
    { emoji: "🏢", title: "Business Page",            desc: "Full business website — logo, services, history, testimonials, hours, contact." },
    { emoji: "💒", title: "Wedding Invitation",       desc: "Elegant digital invitations with love story, gallery, RSVP, and countdown timer." },
    { emoji: "📱", title: "QR Code Generation",       desc: "Generate a branded QR code for print, events, and business cards." },
    { emoji: "📡", title: "NFC Tag Programming",      desc: "Program NFC tags so anyone can tap your card on their phone — no app needed." },
  ];

  const TEMPLATES = [
    { name: "Aurora",    cat: "Name Card", accent: "#6366f1" },
    { name: "Obsidian",  cat: "Name Card", accent: "#f59e0b" },
    { name: "Canvas",    cat: "Portfolio", accent: "#0ea5e9" },
    { name: "Studio",    cat: "Portfolio", accent: "#ec4899" },
    { name: "Marquee",   cat: "Business",  accent: "#ef4444" },
    { name: "Vault",     cat: "Business",  accent: "#d4af37" },
    { name: "Eternal",   cat: "Wedding",   accent: "#c9a96e" },
    { name: "Celestial", cat: "Wedding",   accent: "#a78bfa" },
  ];

  const STEPS = [
    { n: "01", title: "Choose a Category",   desc: "Name card, portfolio, business, or wedding." },
    { n: "02", title: "Pick a Template",     desc: "20 world-class templates. Preview before you commit." },
    { n: "03", title: "Fill Your Content",   desc: "Add your details, links, photos, and contact info." },
    { n: "04", title: "Publish & Share",     desc: "Go live instantly. Share via QR code or NFC tap." },
  ];

  return (
    <ThemeProvider>
    <main style={{ background: "var(--nc-bg)", color: "var(--nc-text)", minHeight: "100vh" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NexCardLogo size={36} />
          <nav className="hidden items-center gap-8 md:flex">
            {["Features", "Templates", "How it Works"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g,"-")}`}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--nc-text-2)" }}>
                {l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle size="lg" />
            <Link href="/login"
              className="hidden rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 sm:block"
              style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
              Sign In
            </Link>
            <Link href="/register"
              className="nc-btn-brand rounded-xl px-4 py-2 text-sm font-black transition-all hover:opacity-90">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-28 text-center md:py-40">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-15"
            style={{ background: "var(--nc-brand-grad, linear-gradient(135deg,#d4af37,#f0c050))" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
            style={{ borderColor: "var(--nc-border-brand)", background: "var(--nc-bg-card)" }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--nc-text-2)" }}>
              20 Premium Templates · QR · NFC
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tighter md:text-7xl lg:text-8xl"
            style={{ color: "var(--nc-text)" }}>
            Your Digital{" "}
            <span style={{
              backgroundImage: "var(--nc-brand-grad, linear-gradient(135deg,#d4af37,#f0c050))",
              backgroundColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}>
              Identity
            </span>
            ,<br />Elevated.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            Create stunning digital name cards, portfolios, business pages, and wedding invitations.
            Share instantly via link, QR code, or NFC tap.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register"
              className="nc-btn-brand flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-black transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow: "var(--nc-glow)",
              }}>
              Create Your Card →
            </Link>
            <Link href="/alex-rivera"
              className="flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold transition-all hover:opacity-80"
              style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
              View Live Demo
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {[["20+", "Templates"], ["QR", "Code Ready"], ["NFC", "Tag Support"], ["∞", "Customizable"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black" style={{
                  backgroundImage: "var(--nc-brand-grad)",
                  backgroundColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}>{v}</p>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t px-6 py-20"
        style={{ borderColor: "var(--nc-border)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>Platform Features</p>
            <h2 className="text-4xl font-black" style={{ color: "var(--nc-text)" }}>
              Everything you need
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
                <div className="mb-4 text-3xl">{f.emoji}</div>
                <h3 className="text-lg font-black mb-2" style={{ color: "var(--nc-text)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-t px-6 py-20"
        style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-2, var(--nc-bg))" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>20 Premium Templates</p>
            <h2 className="text-4xl font-black" style={{ color: "var(--nc-text)" }}>
              World-class designs
            </h2>
            <p className="mt-3 text-base" style={{ color: "var(--nc-text-2)" }}>
              Researched and built to the standard of Stripe, Linear, and Awwwards winners.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="group overflow-hidden rounded-2xl transition-all hover:scale-[1.03] hover:shadow-xl"
                style={{ background: "var(--nc-bg-card)", border: `1px solid ${t.accent}30` }}>
                {/* Mock preview */}
                <div className="relative h-36 overflow-hidden flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.accent}18, ${t.accent}06)` }}>
                  <div className="text-4xl opacity-40"
                    style={{ color: t.accent }}>
                    {t.cat === "Name Card" ? "🪪" : t.cat === "Portfolio" ? "🎨" : t.cat === "Business" ? "🏢" : "💒"}
                  </div>
                  <div className="absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${t.accent}25`, color: t.accent }}>
                    {t.cat}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-sm" style={{ color: "var(--nc-text)" }}>{t.name}</h3>
                  <div className="mt-1 h-1 w-8 rounded-full" style={{ background: t.accent }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/register"
              className="nc-btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black">
              Browse All Templates →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t px-6 py-20"
        style={{ borderColor: "var(--nc-border)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--nc-brand-2, #d4af37)" }}>Simple Process</p>
            <h2 className="text-4xl font-black" style={{ color: "var(--nc-text)" }}>
              Live in 4 steps
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-5 rounded-2xl p-6"
                style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
                <div className="shrink-0 text-3xl font-black leading-none" style={{
                  backgroundImage: "var(--nc-brand-grad)",
                  backgroundColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}>{s.n}</div>
                <div>
                  <h3 className="font-black mb-1" style={{ color: "var(--nc-text)" }}>{s.title}</h3>
                  <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-6 py-24 text-center"
        style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-2, var(--nc-bg))" }}>
        <div className="mx-auto max-w-2xl">
          <NexCardLogo size={56} className="mb-6 mx-auto" />
          <h2 className="text-4xl font-black mb-4" style={{ color: "var(--nc-text)" }}>
            Ready to stand out?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--nc-text-2)" }}>
            Join thousands using NEX CARD to share their digital presence.
          </p>
          <Link href="/register"
            className="nc-btn-brand inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-black hover:opacity-90 hover:scale-[1.02] transition-all"
            style={{
              boxShadow: "var(--nc-glow)",
            }}>
            Create Your Card →
          </Link>
          <p className="mt-4 text-xs" style={{ color: "var(--nc-text-3)" }}>
            No credit card required · 20 premium templates · QR + NFC ready
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10"
        style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg)" }}>
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <NexCardLogo size={28} />
          <div className="flex flex-wrap gap-6">
            {[["Login", "/login"], ["Register", "/register"], ["Demo", "/alex-rivera"]].map(([l, h]) => (
              <Link key={l} href={h} className="text-xs transition-colors hover:opacity-70"
                style={{ color: "var(--nc-text-3)" }}>{l}</Link>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
            © {new Date().getFullYear()} NEX CARD. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
    </ThemeProvider>
  );
}