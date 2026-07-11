// src/app/page.tsx
// Main Corporate Landing Page — High-converting, glassmorphism, dark mode

import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles, Zap, Shield, Globe, Users, BarChart3,
  Check, ArrowRight, Star, Lock, Palette, Share2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "PresenceCard — Your Digital Identity, Elevated",
  description:
    "Create stunning digital name cards, portfolios, business pages, and wedding invitations. 20 premium templates. One link. Instantly shareable.",
  openGraph: {
    title: "PresenceCard — Your Digital Identity, Elevated",
    description: "Create stunning digital name cards, portfolios, business pages, and wedding invitations.",
    images: [{ url: "/og-home.png", width: 1200, height: 630 }],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Palette,
    title: "20 Premium Templates",
    description:
      "Five distinct categories, four templates each — every design is unique, modern, and pixel-perfect on all devices.",
  },
  {
    icon: Zap,
    title: "Instant Updates",
    description:
      "Edit your content anytime. Changes go live in under a second with our intelligent ISR cache system.",
  },
  {
    icon: Globe,
    title: "Custom Slug URL",
    description:
      "Claim your personal URL like presencecard.io/yourname. Share it anywhere, forever.",
  },
  {
    icon: Share2,
    title: "Perfect Social Sharing",
    description:
      "Every page has dynamic Open Graph images. Your card looks stunning when shared on LinkedIn, Twitter, or WhatsApp.",
  },
  {
    icon: Lock,
    title: "Template Lock-In Guarantee",
    description:
      "Choose once, keep forever. Your template is locked to ensure brand consistency, while your data stays fully editable.",
  },
  {
    icon: BarChart3,
    title: "View Analytics",
    description:
      "See how many people visited your card, which templates perform best, and track your digital reach.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description:
      "All data is encrypted in transit and at rest. Your information is always private and protected.",
  },
  {
    icon: Users,
    title: "Multi-Profile Support",
    description:
      "Create a name card, portfolio, and wedding invitation all under one account. Different facets, one platform.",
  },
];

const CATEGORIES = [
  {
    emoji: "💼",
    name: "Digital Name Card",
    description: "Aurora, Obsidian, Prism, Coral, Titanium",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    emoji: "🎨",
    name: "Portfolio",
    description: "Canvas, Studio, Forge, Spectrum, Blueprint",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
  },
  {
    emoji: "🏢",
    name: "Business Advertisement",
    description: "Marquee, District, Empire, Neon, Vault",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    emoji: "💍",
    name: "Wedding Invitation",
    description: "Eternal, Blossom, Noir, Celestial, Rustic",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for individuals trying out the platform.",
    features: [
      "1 active profile",
      "Choose from all 20 templates",
      "Custom slug URL",
      "Basic social links",
      "View count tracking",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
    color: "#6366f1",
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    description: "For professionals who want the full experience.",
    features: [
      "Up to 4 active profiles",
      "All 20 premium templates",
      "Custom slug on all profiles",
      "Advanced analytics dashboard",
      "Priority cache (< 100ms load)",
      "Dynamic OG image generation",
      "Remove PresenceCard branding",
      "Email support",
    ],
    cta: "Start Pro — $9/mo",
    href: "/register?plan=pro",
    highlighted: true,
    color: "#6366f1",
  },
  {
    name: "Business",
    price: "$29",
    period: "/ month",
    description: "For agencies and teams managing multiple brands.",
    features: [
      "Unlimited profiles",
      "Team member access",
      "White-label domain support",
      "API access",
      "Priority support",
      "Custom template requests",
      "Advanced analytics export",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
    color: "#6366f1",
  },
];

const TESTIMONIALS = [
  {
    name: "Aisha Tan",
    role: "UX Designer at Grab",
    text: "I replaced my old PDF resume with a PresenceCard link. My interview callback rate literally doubled. The Aurora template is stunning.",
    avatar: "AT",
    stars: 5,
  },
  {
    name: "Marcus Chen",
    role: "Founder, TechBridge Ventures",
    text: "We use PresenceCard for our entire team's digital name cards. The ISR performance is insane — pages load in under 200ms globally.",
    avatar: "MC",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Wedding Planner",
    text: "Every couple I work with now gets a Celestial or Blossom wedding invitation page. Guests absolutely love the love-history timeline feature.",
    avatar: "PN",
    stars: 5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5"
        style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">PresenceCard</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Features
            </Link>
            <Link href="#templates" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Templates
            </Link>
            <Link href="#pricing" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm text-neutral-300 transition-colors hover:text-white md:block">
              Sign in
            </Link>
            <Link href="/register"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 text-center">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
            style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-[80px]"
            style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            20 Premium Templates · 4 Categories · One Link
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl lg:text-8xl">
            Your Digital Identity,
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Elevated.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-xl">
            Create a stunning digital name card, portfolio, business page, or wedding invitation in minutes.
            One beautiful link. Instantly shareable. Always up to date.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register"
              className="group flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40">
              Create Your Page Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#templates"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10">
              Browse Templates
            </Link>
          </div>

          <p className="mt-4 text-xs text-neutral-600">
            No credit card required · Free forever plan available
          </p>
        </div>

        {/* Floating demo cards */}
        <div className="relative z-10 mt-20 w-full max-w-5xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}
                className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all hover:-translate-y-1"
                style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                <span className="text-3xl">{cat.emoji}</span>
                <p className="text-xs font-bold" style={{ color: cat.color }}>
                  {cat.name}
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed hidden md:block">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof bar ───────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {[
            { value: "10,000+", label: "Cards Created" },
            { value: "4", label: "Template Categories" },
            { value: "20", label: "Premium Templates" },
            { value: "<100ms", label: "Global Load Time" },
            { value: "99.9%", label: "Uptime SLA" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Everything You Need
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Built for the modern professional
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              Every feature is designed to make you look incredible online and get found by the right people.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title}
                  className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-indigo-500/30 hover:bg-white/[0.05]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="mb-2 font-bold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Template Categories ─────────────────────────────────────────── */}
      <section id="templates" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Template Library
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              20 premium templates, 4 categories
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              Every template is hand-crafted, mobile-first, and designed to make a lasting impression.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}
                className="group relative overflow-hidden rounded-3xl border p-8 transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ borderColor: cat.border, background: cat.bg }}>
                <div className="relative z-10">
                  <span className="text-4xl">{cat.emoji}</span>
                  <h3 className="mt-3 text-2xl font-black text-white">{cat.name}</h3>
                  <p className="mt-1 text-sm font-medium" style={{ color: cat.color }}>
                    5 Exclusive Templates
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">{cat.description}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {cat.description.split(", ").map((template) => (
                      <span key={template}
                        className="rounded-lg px-3 py-1 text-xs font-medium"
                        style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}25` }}>
                        {template}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Simple Process
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose Your Category",
                description: "Pick from Digital Name Card, Portfolio, Business Ad, or Wedding Invitation.",
                color: "#6366f1",
              },
              {
                step: "02",
                title: "Select Your Template",
                description: "Browse 5 premium templates per category. Pick one — this choice is permanent to ensure brand consistency.",
                color: "#8b5cf6",
              },
              {
                step: "03",
                title: "Fill In Your Details",
                description: "Add your info, photos, links, and content. Publish your page with a custom slug. Update anytime.",
                color: "#06b6d4",
              },
            ].map((step) => (
              <div key={step.step} className="relative flex flex-col gap-3">
                <div className="text-5xl font-black" style={{ color: `${step.color}30` }}>
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Testimonials
            </p>
            <h2 className="text-4xl font-black tracking-tight">Loved by thousands</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-neutral-400 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-neutral-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Pricing
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              Start free. Upgrade when you need more. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
                  plan.highlighted
                    ? "border-indigo-500/50 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
                    : "border-white/5 bg-white/[0.03]"
                }`}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-indigo-400/30 bg-indigo-500 px-4 py-1 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-neutral-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-400">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}
                  className={`block rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    plan.highlighted
                      ? "bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25"
                      : "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent px-8 py-16">
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Ready to build your digital presence?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              Join thousands of professionals who use PresenceCard to share who they are in style.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register"
                className="group flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:bg-indigo-400">
                Create Your Free Page
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-600">
              Free plan · No credit card · Takes 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold">PresenceCard</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Your digital identity, elevated. Create beautiful pages that represent who you are.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Templates", "Pricing", "Changelog"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-xs text-neutral-600 transition-colors hover:text-neutral-300">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8">
            <p className="text-xs text-neutral-700">
              © {new Date().getFullYear()} PresenceCard. All rights reserved.
            </p>
            <p className="text-xs text-neutral-700">
              Built with Next.js, Tailwind CSS &amp; MySQL
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
