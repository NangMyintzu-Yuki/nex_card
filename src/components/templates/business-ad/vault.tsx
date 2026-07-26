"use client";

import { useState } from "react";
import {
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Clock,
  Building2,
  Award,
  Calendar,
  ChevronDown,
} from "lucide-react";
import type { BusinessAdData } from "@/lib/validators/template-schemas";

interface BP {
  data: BusinessAdData;
  accentColor?: string;
}

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  if (type === "website") return value.startsWith("http") ? value : `https://${value}`;
  return "#";
}

const C_EMOJI: Record<string, string> = {
  email: "✉️",
  phone: "📱",
  website: "🌐",
  address: "📍",
  whatsapp: "💬",
  viber: "📲",
  telegram: "✈️",
};

const S_EMOJI: Record<string, string> = {
  linkedin: "💼",
  github: "🐙",
  twitter: "𝕏",
  instagram: "📸",
  facebook: "👥",
  youtube: "▶️",
  tiktok: "🎵",
  whatsapp: "💬",
  telegram: "✈️",
  viber: "📲",
  discord: "🎮",
  website: "🌐",
};

export function VaultBusiness({ data, accentColor = "#6366f1" }: BP) {
  const {
    businessName,
    tagline,
    description,
    logoUrl,
    services,
    contacts,
    socialLinks,
    testimonials,
    faq,
    primaryCtaLabel,
    primaryCtaUrl,
    certifications,
    founded,
    industry,
    whatWeDo,
    history,
    businessHours,
  } = data;

  const accent = accentColor;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Spheres for Modern Tech Look */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[140px]"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -right-40 top-[40%] h-[600px] w-[600px] rounded-full opacity-15 blur-[160px]"
        style={{ background: accent }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${accent}, #1e1b4b)` }}
                >
                  {businessName.charAt(0)}
                </div>
                <div>
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    {businessName}
                  </span>
                  {founded && (
                    <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
                      Est. {founded}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {["About", "Services", "History", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>

          <a
            href={primaryCtaUrl}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-lg"
            style={{ background: accent }}
          >
            <span>{primaryCtaLabel}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pb-20 pt-24 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {industry && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-300 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{industry}</span>
                </div>
              )}

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
                {businessName}
              </h1>

              <p
                className="mt-6 text-xl font-medium leading-snug text-slate-300 md:text-2xl"
                style={{ color: accent }}
              >
                {tagline}
              </p>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
                {description}
              </p>

              {certifications && certifications.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300"
                    >
                      <Award className="h-3.5 w-3.5 text-indigo-400" />
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Glassmorphism Hero Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Corporate Profile</h4>
                      <p className="text-xs text-slate-400">Enterprise Excellence</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Established</p>
                      <p className="mt-1 text-lg font-bold text-white">{founded || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Industry Leader</p>
                      <p className="mt-1 text-lg font-bold text-white">Certified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section (Bento Cards) */}
      {whatWeDo && whatWeDo.length > 0 && (
        <section className="border-t border-white/10 bg-slate-950/40 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Capabilities
              </h2>
              <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">What We Do</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeDo.map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl"
                >
                  {item.iconName && (
                    <div className="mb-5 inline-block text-3xl">{item.iconName}</div>
                  )}
                  <h3 className="text-xl font-bold text-white transition-colors group-hover:text-indigo-400">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services / Practice Areas */}
      <section id="services" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Solutions
            </h2>
            <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Practice Areas & Services
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
                    {s.price && (
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                        {s.price}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.description}</p>

                  {s.features && (
                    <ul className="mt-6 space-y-2 border-t border-white/5 pt-6">
                      {s.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                          <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      {history && history.length > 0 && (
        <section id="history" className="border-t border-white/10 bg-slate-950/40 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Evolution
              </h2>
              <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">Our Journey</p>
            </div>

            <div className="relative space-y-12 border-l border-white/10 pl-6 md:pl-10">
              {history.map((h, i) => (
                <div key={i} className="group relative">
                  {/* Glowing Node Dot */}
                  <div
                    className="transition-scale absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#030712] group-hover:scale-125 md:-left-[47px]"
                    style={{ background: accent }}
                  />
                  <div className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 font-mono text-xs font-bold text-indigo-300">
                    <Calendar className="h-3 w-3" />
                    {h.year}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{h.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="border-t border-white/10 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Endorsements
              </h2>
              <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">Client Testimonials</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md"
                >
                  <p className="text-sm italic leading-relaxed text-slate-300">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-white/5 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-white">
                      — {t.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      {faq && faq.length > 0 && (
        <section className="border-t border-white/10 bg-slate-950/40 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">FAQ</h2>
              <p className="mt-2 text-3xl font-bold text-white">Frequently Asked Questions</p>
            </div>

            <div className="space-y-4">
              {faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Get In Touch
              </h2>
              <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">Connect With Us</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Reach out to discuss partnerships, services, or general inquiries.
              </p>

              {businessHours && businessHours.length > 0 && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Office Hours
                  </div>
                  <div className="space-y-2">
                    {businessHours.map((h, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-400">{h.day}</span>
                        <span className={h.isClosed ? "text-slate-600" : "text-slate-200"}>
                          {h.isClosed ? "Closed" : `${h.open} – ${h.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {contacts.map((c, i) => (
                  <a
                    key={i}
                    href={cHref(c.type, c.value)}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <span className="text-2xl">{C_EMOJI[c.type] ?? "📋"}</span>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {c.label ?? c.type}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white transition-colors group-hover:text-indigo-400">
                      {c.value}
                    </p>
                  </a>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <span>{S_EMOJI[s.platform]}</span>
                    <span>{s.label ?? s.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={businessName}
                className="h-6 w-auto object-contain opacity-50"
              />
            )}
            <span className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </span>
          </div>
          <span className="font-mono text-xs text-slate-600">NEX CARD Vault</span>
        </div>
      </footer>
    </main>
  );
}
