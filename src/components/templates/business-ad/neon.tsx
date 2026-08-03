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
  Zap,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Share2,
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
    default: return <SendGlow />;
  }
}

function SendGlow() {
  return <Share2 className="h-4 w-4" />;
}

function SocialIcon({ platform = "", url = "" }: { platform?: string; url?: string }) {
  const target = (platform || url).toLowerCase();
  if (target.includes("facebook") || target.includes("fb")) return <Facebook className="h-4 w-4" />;
  if (target.includes("linkedin")) return <Linkedin className="h-4 w-4" />;
  if (target.includes("instagram")) return <Instagram className="h-4 w-4" />;
  if (target.includes("twitter") || target.includes("x.com")) return <Twitter className="h-4 w-4" />;
  if (target.includes("youtube") || target.includes("youtu.be")) return <Youtube className="h-4 w-4" />;
  return <Share2 className="h-4 w-4" />;
}

const STYLE = `
@keyframes nc-ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-ticker { animation: nc-ticker 30s linear infinite; }
@keyframes nc-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.4; }
  94% { opacity: 1; }
  97% { opacity: 0.7; }
  98% { opacity: 1; }
}
.animate-flicker { animation: nc-flicker 4s infinite; }
`;

export function NeonBusiness({ data, accentColor = "#22d3ee" }: BP) {
  const [hasMounted, setHasMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  if (!hasMounted) {
    return <div className="min-h-screen w-full bg-[#05060d]" />;
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
    gallery = [],
    testimonials = [],
    primaryCtaLabel = "Get Started",
    primaryCtaUrl = "#contact",
    businessHours = [],
    whatWeDo = [],
    history = [],
    faq = [],
    address,
    industry,
    founded,
  } = data || {};

  const glow = (a = accentColor, v = "0.55") => `0 0 12px ${a}${v}, 0 0 40px ${a}${v}`;
  const tickerItems = [
    "OPEN FOR BUSINESS",
    industry || "SERVING CUSTOMERS NOW",
    `${services.length} SERVICES LIVE`,
    founded ? `EST. ${founded}` : "READY WHEN YOU ARE",
    primaryCtaLabel.toUpperCase(),
  ];

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden bg-[#05060d] font-sans text-white antialiased selection:bg-white/20 selection:text-white"
      suppressHydrationWarning
    >
      <style>{STYLE}</style>

      {/* Cyberpunk grid + scanlines */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, #fff 3px, #fff 4px)" }} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[500px]"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% -10%, ${accentColor}30, transparent)` }} />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05060d]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName || "Logo"} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md font-black text-[#05060d]"
                  style={{ background: accentColor, boxShadow: glow() }}>
                  {businessName ? businessName.charAt(0).toUpperCase() : "N"}
                </span>
                <span className="text-lg font-black uppercase tracking-tight text-white">{businessName}</span>
              </div>
            )}
          </Link>

          <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 md:flex">
            <a href="#about" className="transition-colors hover:text-white">About</a>
            {whatWeDo.length > 0 && <a href="#approach" className="transition-colors hover:text-white">Services</a>}
            {gallery.length > 0 && <a href="#gallery" className="transition-colors hover:text-white">Gallery</a>}
            {history.length > 0 && <a href="#history" className="transition-colors hover:text-white">Timeline</a>}
            {testimonials.length > 0 && <a href="#testimonials" className="transition-colors hover:text-white">Reviews</a>}
            <a href="#contact" className="transition-colors hover:text-white">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href={primaryCtaUrl}
              className="group inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-[#05060d] transition-all hover:brightness-110"
              style={{ background: accentColor, boxShadow: glow() }}>
              <Zap className="h-3.5 w-3.5 transition-transform group-hover:scale-125" />
              {primaryCtaLabel}
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-white/15 p-2 text-white/60 hover:text-white md:hidden"
              aria-label="Toggle navigation menu">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-[#05060d]/95 px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider text-white/70">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">About</a>
              {whatWeDo.length > 0 && <a href="#approach" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Services</a>}
              {gallery.length > 0 && <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Gallery</a>}
              {history.length > 0 && <a href="#history" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Timeline</a>}
              {testimonials.length > 0 && <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Reviews</a>}
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative z-10 px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ borderColor: `${accentColor}55`, color: accentColor, boxShadow: `inset 0 0 20px ${accentColor}15` }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accentColor, boxShadow: glow() }} />
            {industry || "Business"}
          </div>

          <h1 className="mt-8 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            <span style={{ color: accentColor, textShadow: glow() }}>{businessName}</span>
          </h1>

          {tagline && (
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/70 sm:text-2xl">
              {tagline}
            </p>
          )}

          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href={primaryCtaUrl}
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#05060d] transition-all hover:brightness-110"
              style={{ background: accentColor, boxShadow: glow() }}>
              {primaryCtaLabel} <ArrowRight className="h-4 w-4" />
            </a>
            {contacts.filter((c) => c.type === "phone").slice(0, 1).map((c, i) => (
              <a key={i} href={`tel:${c.value.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-lg border px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white/70 transition-all hover:border-white/40 hover:text-white"
                style={{ borderColor: `${accentColor}44` }}>
                <Phone className="h-4 w-4" style={{ color: accentColor }} />
                {c.value}
              </a>
            ))}
          </div>
        </div>

        {heroImageUrl && (
          <div className="mx-auto mt-14 max-w-6xl">
            <div className="overflow-hidden rounded-xl border"
              style={{ borderColor: `${accentColor}33`, boxShadow: `0 0 60px ${accentColor}22` }}>
              <img src={heroImageUrl} alt={businessName || "Hero"} className="h-[380px] w-full object-cover" />
            </div>
          </div>
        )}
      </section>

      {/* ================= TICKER ================= */}
      <div className="relative z-10 overflow-hidden border-y border-white/10 bg-white/[0.02] py-3.5">
        <div className="animate-ticker flex w-max gap-10 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-10 text-xs font-black uppercase tracking-[0.3em] text-white/40">
              {item}
              <span style={{ color: accentColor, textShadow: glow() }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================= ABOUT ================= */}
      <section id="about" className="relative z-10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // About
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Who We <span style={{ color: accentColor, textShadow: glow() }}>Are</span>
            </h2>
            <div className="mt-6 h-1 w-20" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
            <p className="mt-6 text-sm leading-relaxed text-white/60 sm:text-base">{description}</p>

            {address && (
              <div className="mt-8 inline-flex items-center gap-3 rounded-lg border px-4 py-3 font-mono text-xs text-white/70"
                style={{ borderColor: `${accentColor}33` }}>
                <MapPin className="h-4 w-4" style={{ color: accentColor }} />
                <span>{[address.street, address.city, address.state, address.zip].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl" style={{ boxShadow: `0 0 80px ${accentColor}22` }} />
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border"
              style={{ borderColor: `${accentColor}33` }}>
              {heroImageUrl ? (
                <img src={heroImageUrl} alt={businessName || "About"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
                  <span className="text-7xl font-black" style={{ color: `${accentColor}44`, textShadow: glow() }}>
                    {businessName ? businessName.charAt(0).toUpperCase() : "N"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      {whatWeDo.length > 0 && (
        <section id="approach" className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // What We Do
            </p>
            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Core <span style={{ color: accentColor, textShadow: glow() }}>Powers</span>
            </h2>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeDo.map((item, i) => (
                <div key={i}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${accentColor}18`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{item.iconName || "⚡"}</span>
                    <span className="font-mono text-xs text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black uppercase tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SERVICES ================= */}
      {services.length > 0 && (
        <section id="services" className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // Services
            </p>
            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Plans & <span style={{ color: accentColor, textShadow: glow() }}>Solutions</span>
            </h2>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <div key={i}
                  className="relative flex flex-col justify-between rounded-xl border bg-[#0a0c18] p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    borderColor: s.highlighted ? accentColor : "rgba(255,255,255,0.10)",
                    boxShadow: s.highlighted ? glow() : "none",
                  }}>
                  {s.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#05060d]"
                      style={{ background: accentColor, boxShadow: glow() }}>
                      Hot
                    </span>
                  )}
                  <div>
                    {s.iconName && <div className="mb-3 text-3xl">{s.iconName}</div>}
                    <h3 className="text-xl font-black uppercase tracking-tight">{s.title}</h3>
                    {s.price && (
                      <p className="mt-3 text-3xl font-black" style={{ color: accentColor, textShadow: glow("", "0.4") }}>
                        {s.price}
                        {s.priceNote && <span className="ml-2 text-xs font-medium text-white/40">{s.priceNote}</span>}
                      </p>
                    )}
                    <p className="mt-4 text-sm leading-relaxed text-white/50">{s.description}</p>
                    {s.features && s.features.length > 0 && (
                      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                        {s.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs text-white/70">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <a href={primaryCtaUrl}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110"
                    style={{ borderColor: `${accentColor}66`, color: accentColor }}>
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= GALLERY ================= */}
      {gallery.length > 0 && (
        <section id="gallery" className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // Gallery
            </p>
            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Visual <span style={{ color: accentColor, textShadow: glow() }}>Feed</span>
            </h2>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {gallery.slice(0, 9).map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  <img src={img.url} alt={img.alt || `Gallery ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(to top, ${accentColor}40, transparent)` }} />
                  <span className="absolute bottom-2 left-2 font-mono text-[10px] text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                    IMG_{String(i + 1).padStart(3, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= HISTORY TIMELINE ================= */}
      {history.length > 0 && (
        <section id="history" className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // Timeline
            </p>
            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Signal <span style={{ color: accentColor, textShadow: glow() }}>History</span>
            </h2>

            <div className="relative mt-16 pl-8">
              <div className="absolute left-[7px] top-2 bottom-2 w-px"
                style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
              {history.map((h, i) => (
                <div key={i} className="relative mb-8">
                  <span className="absolute -left-8 top-1.5 h-[15px] w-[15px] rounded-full border-2 bg-[#05060d]"
                    style={{ borderColor: accentColor, boxShadow: glow("", "0.5") }} />
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded px-2.5 py-1 font-mono text-xs font-black text-[#05060d]"
                        style={{ background: accentColor, boxShadow: glow("", "0.4") }}>
                        {h.year}
                      </span>
                      <h3 className="font-black uppercase tracking-tight">{h.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= TESTIMONIALS ================= */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // Reviews
            </p>
            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Signal <span style={{ color: accentColor, textShadow: glow() }}>Testimonials</span>
            </h2>

            <div className="mt-16 grid gap-5 sm:grid-cols-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <div key={i} className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-7">
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s < (t.rating || 5) ? "fill-current text-white" : "text-white/20"}`}
                          style={s < (t.rating || 5) ? { color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})` } : undefined} />
                      ))}
                    </div>
                    <p className="mt-4 text-sm italic leading-relaxed text-white/70">&ldquo;{t.text}&rdquo;</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.author || "Avatar"} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-[#05060d]"
                        style={{ background: accentColor, boxShadow: glow("", "0.4") }}>
                        {t.author ? t.author.charAt(0).toUpperCase() : "A"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold">{t.author}</p>
                      {t.platform && <p className="font-mono text-[11px] text-white/40">{t.platform}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {faq.length > 0 && (
        <section className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // FAQ
            </p>
            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Decode <span style={{ color: accentColor, textShadow: glow() }}>Questions</span>
            </h2>

            <div className="mt-12 space-y-3">
              {faq.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-bold"
                      style={{ color: isOpen ? accentColor : "white" }}>
                      <span>{item.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/10 px-6 pb-6 pt-4 text-sm leading-relaxed text-white/50">
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
      <section id="contact" className="relative z-10 border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              // Contact
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Link <span style={{ color: accentColor, textShadow: glow() }}>Up</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Reach us on any channel — we reply fast.
            </p>

            <div className="mt-8 space-y-3">
              {contacts.map((c, i) => (
                <a key={i} href={cHref(c.type, c.value)}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/70 transition-all hover:border-white/25 hover:text-white">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#05060d]"
                    style={{ background: accentColor, boxShadow: glow("", "0.3") }}>
                    <ContactIcon type={c.type} />
                  </span>
                  <span>{c.value}</span>
                </a>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2.5">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 transition-all hover:border-white/40 hover:text-white">
                    <span style={{ color: accentColor }}>
                      <SocialIcon platform={s.platform} url={s.url} />
                    </span>
                    <span>{s.label || s.platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {businessHours.length > 0 && (
            <div>
              <div className="rounded-xl border p-8" style={{ borderColor: `${accentColor}33`, boxShadow: `0 0 60px ${accentColor}15` }}>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" style={{ color: accentColor, filter: `drop-shadow(0 0 6px ${accentColor})` }} />
                  <h3 className="font-black uppercase tracking-wide">Open Channels</h3>
                </div>
                <div className="mt-6 divide-y divide-white/10">
                  {businessHours.map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-3.5 text-sm">
                      <span className="text-white/50">{h.day}</span>
                      <span className={h.isClosed ? "text-white/25" : "font-bold"} style={h.isClosed ? {} : { color: accentColor }}>
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
      <footer className="relative z-10 border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName || "Footer Logo"} className="h-7 w-auto object-contain" />
            ) : (
              <span className="font-black uppercase tracking-tight">{businessName}</span>
            )}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
            © {new Date().getFullYear()} {businessName} · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
