"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Star,
  ChevronDown,
  Check,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import type { BusinessAdData } from "@/lib/validators/template-schemas";

interface BP {
  data: BusinessAdData;
  accentColor?: string;
}

function cHref(type: string, value: string) {
  if (!value) return "#";
  const val = value.trim();
  if (type === "email") return `mailto:${val}`;
  if (type === "phone") return `tel:${val.replace(/\s/g, "")}`;
  if (type === "website") return val.startsWith("http") ? val : `https://${val}`;
  return val.startsWith("http") ? val : "#";
}

function ContactIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case "email": return <Mail className="h-4 w-4" />;
    case "phone": return <Phone className="h-4 w-4" />;
    case "website": return <Globe className="h-4 w-4" />;
    case "address": return <MapPin className="h-4 w-4" />;
    default: return <ExternalLink className="h-4 w-4" />;
  }
}

/** Thin centered ornament divider: ——— ✦ ——— */
function Ornament({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent" style={{ background: "linear-gradient(to right, transparent, #ffffff22)" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: accentColor }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, #ffffff22)" }} />
    </div>
  );
}

export function EmpireBusiness({ data, accentColor = "#c8a24a" }: BP) {
  const [hasMounted, setHasMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  if (!hasMounted) {
    return <div className="min-h-screen w-full bg-[#0b0a08]" />;
  }

  const {
    businessName,
    tagline,
    description,
    logoUrl,
    heroImageUrl,
    services = [],
    contacts = [],
    socialLinks = [],
    testimonials = [],
    primaryCtaLabel = "Get Started",
    primaryCtaUrl = "#contact",
    certifications = [],
    founded,
    industry,
    whatWeDo = [],
    businessHours = [],
    faq = [],
    address,
  } = data || {};

  const monogram = businessName ? businessName.charAt(0).toUpperCase() : "E";

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden bg-[#0b0a08] font-sans text-[#e9e3d3] antialiased selection:bg-[#c8a24a]/40 selection:text-white"
      suppressHydrationWarning
    >
      {/* Subtle vertical texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)" }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-10"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accentColor}, transparent)` }} />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0a08]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName || "Logo"} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border font-serif text-sm font-bold"
                  style={{ borderColor: `${accentColor}66`, color: accentColor }}>
                  {monogram}
                </div>
                <span className="font-serif text-lg tracking-wide text-[#f5f0e4]">{businessName}</span>
              </div>
            )}
          </Link>

          <nav className="hidden items-center gap-9 text-[11px] font-medium uppercase tracking-[0.25em] text-[#a89f8d] md:flex">
            <a href="#about" className="transition-colors hover:text-[#f5f0e4]">About</a>
            {whatWeDo.length > 0 && <a href="#approach" className="transition-colors hover:text-[#f5f0e4]">Craft</a>}
            {services.length > 0 && <a href="#services" className="transition-colors hover:text-[#f5f0e4]">Services</a>}
            {testimonials.length > 0 && <a href="#testimonials" className="transition-colors hover:text-[#f5f0e4]">Testimonials</a>}
            <a href="#contact" className="transition-colors hover:text-[#f5f0e4]">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href={primaryCtaUrl}
              className="hidden items-center gap-2 border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/5 sm:inline-flex"
              style={{ borderColor: `${accentColor}88`, color: accentColor }}>
              {primaryCtaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded border border-white/15 p-2 text-[#a89f8d] hover:text-white md:hidden"
              aria-label="Toggle navigation menu">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-[#0b0a08]/95 px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4 text-sm tracking-wide text-[#c9c1af]">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">About</a>
              {whatWeDo.length > 0 && <a href="#approach" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Craft</a>}
              {services.length > 0 && <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Services</a>}
              {testimonials.length > 0 && <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Testimonials</a>}
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative z-10 px-5 pb-20 pt-16 text-center sm:px-8 sm:pt-24 lg:pb-28">
        <div className="mx-auto max-w-4xl">
          {(founded || industry) && (
            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-[#8d8471]">
              {founded ? `Est. ${founded}` : "Since Inception"}
              {industry && founded ? ` · ${industry}` : industry}
            </p>
          )}

          <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-[#f8f3e8] sm:text-7xl">
            {businessName}
          </h1>

          {tagline && (
            <p className="mx-auto mt-5 max-w-2xl font-serif text-lg italic text-[#c9c1af] sm:text-2xl">
              {tagline}
            </p>
          )}

          <div className="mx-auto mt-8 max-w-xl">
            <Ornament accentColor={accentColor} />
          </div>

          {description && (
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-[#a39a87] sm:text-base">
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href={primaryCtaUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#0b0a08] transition-all duration-300 hover:opacity-90"
              style={{ background: accentColor }}>
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#about"
              className="inline-flex items-center gap-2 border border-white/20 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9c1af] transition-all hover:border-white/40 hover:text-white">
              Discover More
            </a>
          </div>
        </div>

        {heroImageUrl && (
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden border border-white/10">
              <img src={heroImageUrl} alt={businessName || "Hero"} className="h-[420px] w-full object-cover" />
            </div>
          </div>
        )}
      </section>

      {/* ================= STATS ================= */}
      {(founded || services.length > 0 || certifications.length > 0) && (
        <section className="relative z-10 border-y border-white/10 px-5 py-12 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-16 gap-y-8 text-center">
            {founded && (
              <div>
                <p className="font-serif text-4xl text-[#f5f0e4]">{founded}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#8d8471]">Established</p>
              </div>
            )}
            {services.length > 0 && (
              <div>
                <p className="font-serif text-4xl text-[#f5f0e4]">{services.length}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#8d8471]">Signature Services</p>
              </div>
            )}
            {certifications.slice(0, 2).map((cert, idx) => (
              <div key={idx}>
                <p className="font-serif text-xl text-[#f5f0e4]">{cert}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#8d8471]">Accreditation</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= ABOUT ================= */}
      <section id="about" className="relative z-10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accentColor }}>
              01 — About
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[#f5f0e4] sm:text-5xl">
              The Standard of Excellence
            </h2>
            <div className="mt-5 h-px w-16" style={{ background: `${accentColor}88` }} />
            <p className="mt-6 text-sm leading-relaxed text-[#a39a87] sm:text-base">
              {description}
            </p>

            {address && (
              <div className="mt-8 flex items-start gap-3 text-sm text-[#c9c1af]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} />
                <span>
                  {[address.street, address.city, address.state, address.zip].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-3 border opacity-40" style={{ borderColor: `${accentColor}44` }} />
            <div className="relative aspect-[4/5] overflow-hidden bg-[#141210]">
              {heroImageUrl ? (
                <img src={heroImageUrl} alt={businessName || "About"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-serif text-6xl text-[#2a2822]" style={{ color: `${accentColor}33` }}>{monogram}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      {whatWeDo.length > 0 && (
        <section id="approach" className="relative z-10 border-t border-white/10 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accentColor }}>
                02 — Our Craft
              </p>
              <h2 className="mt-4 font-serif text-3xl text-[#f5f0e4] sm:text-5xl">Approach & Philosophy</h2>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeDo.map((item, i) => (
                <div key={i} className="group bg-[#0b0a08] p-8 transition-colors duration-300 hover:bg-[#12100c]">
                  <p className="font-serif text-sm" style={{ color: accentColor }}>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-serif text-xl text-[#f5f0e4]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#8d8471]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SERVICES ================= */}
      {services.length > 0 && (
        <section id="services" className="relative z-10 border-t border-white/10 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accentColor }}>
                03 — Services
              </p>
              <h2 className="mt-4 font-serif text-3xl text-[#f5f0e4] sm:text-5xl">Curation of Services</h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <div key={i}
                  className="relative flex flex-col justify-between border p-8 transition-all duration-300 hover:-translate-y-1"
                  style={{ borderColor: s.highlighted ? `${accentColor}99` : "rgba(255,255,255,0.10)" }}>
                  {s.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#0b0a08]"
                      style={{ background: accentColor }}>
                      Signature
                    </span>
                  )}
                  <div>
                    <p className="font-serif text-sm text-[#5d5748]">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-2 font-serif text-2xl text-[#f5f0e4]">{s.title}</h3>
                    {s.price && (
                      <p className="mt-4 font-serif text-3xl" style={{ color: accentColor }}>
                        {s.price}
                        {s.priceNote && <span className="ml-2 text-xs font-sans text-[#8d8471]">{s.priceNote}</span>}
                      </p>
                    )}
                    <p className="mt-4 text-sm leading-relaxed text-[#8d8471]">{s.description}</p>
                    {s.features && s.features.length > 0 && (
                      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                        {s.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs text-[#c9c1af]">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <a href={primaryCtaUrl}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 border py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all hover:bg-white/5"
                    style={{ borderColor: `${accentColor}66`, color: accentColor }}>
                    Enquire <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= TESTIMONIALS ================= */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="relative z-10 border-t border-white/10 px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accentColor }}>
                04 — Testimonials
              </p>
              <h2 className="mt-4 font-serif text-3xl text-[#f5f0e4] sm:text-5xl">In Their Words</h2>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <figure key={i} className="text-center md:text-left">
                  <div className="flex items-center justify-center gap-1 md:justify-start">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s < (t.rating || 5) ? "fill-[#c8a24a] text-[#c8a24a]" : "text-white/20"}`} />
                    ))}
                  </div>
                  <blockquote className="mt-5 font-serif text-lg italic leading-relaxed text-[#c9c1af] sm:text-xl">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6">
                    {t.avatarUrl && (
                      <img src={t.avatarUrl} alt={t.author || "Avatar"}
                        className="mx-auto h-12 w-12 rounded-full object-cover md:mx-0" />
                    )}
                    <p className="mt-3 text-sm font-medium tracking-wide text-[#f5f0e4]">{t.author}</p>
                    {t.platform && <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-[#8d8471]">{t.platform}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {faq.length > 0 && (
        <section className="relative z-10 border-t border-white/10 px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accentColor }}>
                05 — FAQ
              </p>
              <h2 className="mt-4 font-serif text-3xl text-[#f5f0e4] sm:text-4xl">Common Questions</h2>
            </div>

            <div className="mt-12 space-y-3">
              {faq.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="border border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-medium text-[#e9e3d3]">
                      <span className="font-serif text-base">{item.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-[#8d8471] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/10 px-6 pb-6 pt-4 text-sm leading-relaxed text-[#a39a87]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================= CONTACT ================= */}
      <section id="contact" className="relative z-10 border-t border-white/10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: accentColor }}>
              06 — Contact
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[#f5f0e4] sm:text-4xl">
              Begin Your Inquiry
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#a39a87]">
              Reach our team through any channel below.
            </p>

            <div className="mt-8 space-y-3">
              {contacts.map((c, i) => (
                <a key={i} href={cHref(c.type, c.value)}
                  className="flex items-center gap-4 border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-[#c9c1af] transition-all hover:bg-white/[0.05]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center" style={{ color: accentColor }}>
                    <ContactIcon type={c.type} />
                  </span>
                  <span>{c.value}</span>
                </a>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-xs font-medium tracking-wide text-[#c9c1af] transition-all hover:border-white/30 hover:text-white">
                    {s.label || s.platform}
                    <ExternalLink className="h-3 w-3 text-[#8d8471]" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {businessHours.length > 0 && (
            <div>
              <div className="border p-8" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" style={{ color: accentColor }} />
                  <h3 className="font-serif text-2xl text-[#f5f0e4]">Hours of Operation</h3>
                </div>
                <div className="mt-6 divide-y divide-white/10">
                  {businessHours.map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-3.5 text-sm">
                      <span className="text-[#a39a87]">{h.day}</span>
                      <span className={h.isClosed ? "text-[#5d5748]" : "font-medium text-[#f5f0e4]"}>
                        {h.isClosed ? "Closed" : `${h.open} — ${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName || "Footer Logo"} className="h-7 w-auto object-contain" />
            ) : (
              <span className="font-serif text-lg text-[#f5f0e4]">{businessName}</span>
            )}
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#5d5748]">
            © {new Date().getFullYear()} {businessName} · All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
