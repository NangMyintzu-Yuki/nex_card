"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Star,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  ExternalLink,
  Send,
  Menu,
  X,
  ArrowUpRight,
  Layers,
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
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    case "website":
      return <Globe className="h-4 w-4" />;
    case "address":
      return <MapPin className="h-4 w-4" />;
    default:
      return <Send className="h-4 w-4" />;
  }
}

/* Custom SVG Icons for platforms not available in standard Lucide sets */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.73 6.66-2.87 8.01-3.43 3.81-1.58 4.6-1.86 5.12-1.86.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.22z" />
    </svg>
  );
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.38 4.62C17.42 2.66 14.82 1.58 12 1.58c-5.75 0-10.42 4.67-10.42 10.42 0 1.84.48 3.63 1.39 5.21L1.58 22.42l5.35-1.4c1.53.84 3.26 1.28 5.07 1.28 5.75 0 10.42-4.67 10.42-10.42 0-2.82-1.08-5.42-3.04-7.26zm-7.38 15.66c-1.58 0-3.13-.42-4.48-1.22l-.32-.19-3.33.87.89-3.24-.21-.33a8.38 8.38 0 0 1-1.28-4.48c0-4.65 3.78-8.43 8.43-8.43 2.25 0 4.37.88 5.96 2.47 1.59 1.59 2.47 3.71 2.47 5.96 0 4.65-3.78 8.43-8.43 8.43zm4.62-6.32c-.25-.13-1.5-.74-1.73-.82-.23-.08-.4-.13-.57.13-.17.25-.66.82-.81.99-.15.17-.3.19-.55.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43-.15-.01-.32-.01-.49-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.48-.3z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-1.12z" />
    </svg>
  );
}

function SocialIcon({ platform = "", url = "" }: { platform?: string; url?: string }) {
  const target = (platform || url).toLowerCase();

  if (target.includes("facebook") || target.includes("fb")) {
    return <Facebook className="h-4 w-4" />;
  }
  if (target.includes("viber")) {
    return <ViberIcon className="h-4 w-4" />;
  }
  if (target.includes("telegram") || target.includes("t.me")) {
    return <TelegramIcon className="h-4 w-4" />;
  }
  if (target.includes("tiktok")) {
    return <TikTokIcon className="h-4 w-4" />;
  }
  if (target.includes("linkedin")) {
    return <Linkedin className="h-4 w-4" />;
  }
  if (target.includes("instagram")) {
    return <Instagram className="h-4 w-4" />;
  }
  if (target.includes("twitter") || target.includes("x.com")) {
    return <Twitter className="h-4 w-4" />;
  }
  if (target.includes("youtube") || target.includes("youtu.be")) {
    return <Youtube className="h-4 w-4" />;
  }

  return <Share2 className="h-4 w-4" />;
}

function getPlatformLabel(platform?: string, url?: string, fallbackLabel?: string) {
  if (fallbackLabel && fallbackLabel.trim()) return fallbackLabel;
  const target = (platform || url || "").toLowerCase();

  if (target.includes("facebook") || target.includes("fb")) return "Facebook";
  if (target.includes("viber")) return "Viber";
  if (target.includes("telegram") || target.includes("t.me")) return "Telegram";
  if (target.includes("tiktok")) return "TikTok";
  if (target.includes("linkedin")) return "LinkedIn";
  if (target.includes("instagram")) return "Instagram";
  if (target.includes("twitter") || target.includes("x.com")) return "Twitter / X";
  if (target.includes("youtube")) return "YouTube";

  return platform || "Social Link";
}

function StarRating({ r }: { r: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < r
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-800 text-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

export function NeonBusiness({ data, accentColor = "#a3e635" }: BP) {
  const [hasMounted, setHasMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div 
        className="min-h-screen w-full bg-zinc-950" 
        style={{ backgroundColor: "#09090b" }} 
      />
    );
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
  } = data || {};

  return (
    <div 
      className="relative min-h-screen w-full overflow-x-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-white selection:text-zinc-950"
      suppressHydrationWarning
    >
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px] overflow-hidden opacity-20">
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: accentColor }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={businessName || "Business Logo"}
                width={140}
                height={36}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-lg font-extrabold text-zinc-950 shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {businessName ? businessName.charAt(0) : "B"}
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  {businessName}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400 md:flex">
            <a href="#about" className="transition-colors hover:text-white">About</a>
            {whatWeDo.length > 0 && <a href="#approach" className="transition-colors hover:text-white">Approach</a>}
            {services.length > 0 && <a href="#services" className="transition-colors hover:text-white">Services</a>}
            {gallery.length > 0 && <a href="#gallery" className="transition-colors hover:text-white">Gallery</a>}
            {history.length > 0 && <a href="#history" className="transition-colors hover:text-white">History</a>}
            {testimonials.length > 0 && <a href="#testimonials" className="transition-colors hover:text-white">Reviews</a>}
            <a href="#contact" className="transition-colors hover:text-white">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={primaryCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all duration-300 hover:opacity-90 sm:px-5 sm:text-sm"
              style={{ backgroundColor: accentColor }}
            >
              <span>{primaryCtaLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-zinc-800 bg-zinc-950/95 px-6 py-6 backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col gap-4 text-sm font-semibold tracking-wide text-zinc-300">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">About</a>
              {whatWeDo.length > 0 && <a href="#approach" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Approach</a>}
              {services.length > 0 && <a href="#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Services</a>}
              {gallery.length > 0 && <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Gallery</a>}
              {history.length > 0 && <a href="#history" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">History</a>}
              {testimonials.length > 0 && <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Reviews</a>}
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {industry && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  {industry}
                </div>
              )}

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {businessName}
              </h1>

              {tagline && (
                <p className="mt-4 text-xl font-medium sm:text-2xl" style={{ color: accentColor }}>
                  {tagline}
                </p>
              )}

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {description}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={primaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 8px 24px -6px ${accentColor}60`,
                  }}
                >
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                {contacts.filter((c) => c.type === "phone").slice(0, 1).map((c, i) => (
                  <a
                    key={i}
                    href={`tel:${c.value}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800"
                  >
                    <Phone className="h-4 w-4" style={{ color: accentColor }} />
                    <span>{c.value}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div
                  className="absolute -inset-1.5 rounded-3xl opacity-30 blur-2xl"
                  style={{ background: accentColor }}
                />

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/90 shadow-2xl backdrop-blur-sm">
                  {heroImageUrl ? (
                    <Image
                      src={heroImageUrl}
                      alt={businessName || "Business hero banner"}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-zinc-600">
                      <Building2 className="mb-4 h-12 w-12 stroke-[1.5]" />
                      <h3 className="text-xl font-bold text-white">{businessName}</h3>
                      <p className="mt-1 text-xs text-zinc-400">{tagline}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            About Company
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Who We Are
          </h2>
          <p className="mt-6 text-base leading-relaxed text-zinc-300 sm:text-lg">
            {description}
          </p>

          {address && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-5 py-3.5 text-sm text-zinc-300">
              <MapPin className="h-5 w-5 shrink-0" style={{ color: accentColor }} />
              <span>
                {[address.street, address.city, address.state, address.zip].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      {whatWeDo && whatWeDo.length > 0 && (
        <section id="approach" className="relative z-10 border-t border-zinc-800/60 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Our Methodology
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                What We Do
              </h2>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeDo.map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div
                    className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl text-zinc-950 shadow-lg font-bold text-xl"
                    style={{ backgroundColor: accentColor }}
                  >
                    {item.iconName || <Layers className="h-5 w-5" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= GALLERY ================= */}
      {gallery && gallery.length > 0 && (
        <section id="gallery" className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Portfolio
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Visual Showcase
              </h2>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {gallery.slice(0, 9).map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-lg"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Gallery image ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SERVICES ================= */}
      {services && services.length > 0 && (
        <section id="services" className="relative z-10 border-t border-zinc-800/60 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Capabilities
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Our Services & Solutions
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col justify-between rounded-2xl p-8 backdrop-blur-md transition-all duration-300 ${
                    s.highlighted
                      ? "border-2 bg-zinc-900/90 text-white shadow-2xl"
                      : "border border-zinc-800/80 bg-zinc-900/40 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900/70"
                  }`}
                  style={{
                    borderColor: s.highlighted ? accentColor : undefined,
                  }}
                >
                  <div>
                    {s.highlighted && (
                      <span
                        className="absolute -top-3.5 right-6 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-950 shadow-lg"
                        style={{ backgroundColor: accentColor }}
                      >
                        Featured
                      </span>
                    )}

                    {s.iconName && (
                      <div className="mb-4 text-3xl">{s.iconName}</div>
                    )}

                    <h3 className="text-2xl font-bold text-white">{s.title}</h3>

                    {s.price && (
                      <p className="mt-4 text-3xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                        {s.price}
                        {s.priceNote && (
                          <span className="ml-2 text-xs font-normal text-zinc-400">
                            {s.priceNote}
                          </span>
                        )}
                      </p>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                      {s.description}
                    </p>

                    {s.features && s.features.length > 0 && (
                      <ul className="mt-6 space-y-3 border-t border-zinc-800/80 pt-6">
                        {s.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-3 text-xs text-zinc-300">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0"
                              style={{ color: accentColor }}
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-8 pt-4">
                    <a
                      href={primaryCtaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-zinc-950 transition-all hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      <span>Inquire Now</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= HISTORY ================= */}
      {history && history.length > 0 && (
        <section id="history" className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Milestones
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Our Story & Journey
              </h2>
            </div>

            <div className="mt-16 space-y-8">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md sm:flex-row sm:items-start sm:gap-6"
                >
                  <div
                    className="inline-flex h-12 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-black text-zinc-950 shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    {h.year}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {h.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= TESTIMONIALS ================= */}
      {testimonials && testimonials.length > 0 && (
        <section id="testimonials" className="relative z-10 border-t border-zinc-800/60 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Testimonials
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Client Success Stories
              </h2>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-md"
                >
                  <div>
                    <StarRating r={t.rating || 5} />
                    <p className="mt-4 text-base italic leading-relaxed text-zinc-300">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-4 border-t border-zinc-800/80 pt-6">
                    {t.avatarUrl ? (
                      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-zinc-700">
                        <Image
                          src={t.avatarUrl}
                          alt={t.author || "Avatar"}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-zinc-950 shadow-md"
                        style={{ backgroundColor: accentColor }}
                      >
                        {t.author ? t.author.charAt(0) : "A"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{t.author}</p>
                      {t.platform && (
                        <p className="text-xs text-zinc-500">{t.platform}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= FAQ ================= */}
      {faq && faq.length > 0 && (
        <section className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                FAQ
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {faq.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between p-6 text-left text-base font-semibold text-white hover:bg-zinc-800/40"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-zinc-800/80 px-6 pb-6 pt-4 text-sm leading-relaxed text-zinc-400">
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

      {/* ================= CONTACT & HOURS ================= */}
      <section id="contact" className="relative z-10 border-t border-zinc-800/60 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Get In Touch
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Connect With Us
              </h2>
              <p className="mt-4 text-base text-zinc-400">
                Reach out directly through any of our channels or visit us during working hours.
              </p>

              <div className="mt-8 space-y-4">
                {contacts.map((c, i) => (
                  <a
                    key={i}
                    href={cHref(c.type, c.value)}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-950 shadow-md"
                      style={{ backgroundColor: accentColor }}
                    >
                      <ContactIcon type={c.type} />
                    </div>
                    <span>{c.value}</span>
                  </a>
                ))}
              </div>

              {socialLinks && socialLinks.length > 0 && (
                <div className="mt-10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                    Follow & Connect
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((s, i) => {
                      const label = getPlatformLabel(s.platform, s.url, s.label);
                      return (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        >
                          <span className="text-zinc-400 group-hover:text-white transition-colors">
                            <SocialIcon platform={s.platform} url={s.url} />
                          </span>
                          <span>{label}</span>
                          <ExternalLink className="h-3 w-3 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {businessHours && businessHours.length > 0 && (
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6" style={{ color: accentColor }} />
                    <h3 className="text-xl font-bold text-white">
                      Working Hours
                    </h3>
                  </div>

                  <div className="mt-6 divide-y divide-zinc-800/80">
                    {businessHours.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <span className="font-medium text-zinc-300">{h.day}</span>
                        <span
                          className={
                            h.isClosed
                              ? "font-normal text-zinc-500"
                              : "font-semibold text-white"
                          }
                        >
                          {h.isClosed ? "Closed" : `${h.open} – ${h.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-zinc-950 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={businessName || "Footer Logo"}
                width={100}
                height={30}
                className="h-7 w-auto object-contain"
              />
            ) : (
              <span className="text-base font-bold text-white">{businessName}</span>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            © NEX CARD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}