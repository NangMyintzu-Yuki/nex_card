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
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  ShieldCheck,
  ExternalLink,
  Send,
  Menu,
  X,
  ArrowUpRight,
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

function StarRating({ r }: { r: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < r ? "fill-amber-400 text-amber-400" : "fill-zinc-800 text-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

export function EmpireBusiness({ data, accentColor = "#6366f1" }: BP) {
  const [hasMounted, setHasMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen w-full bg-zinc-950" style={{ backgroundColor: "#09090b" }} />
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

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-white selection:text-zinc-950"
      suppressHydrationWarning
    >
      {/* Background Ambient Gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px] overflow-hidden opacity-20">
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: accentColor }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* ================= STICKY HEADER ================= */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName || "Business Logo"}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {businessName ? businessName.charAt(0) : "B"}
                </div>
                <span className="text-lg font-bold tracking-tight text-white">{businessName}</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400 md:flex">
            <a href="#about" className="transition-colors hover:text-white">
              About
            </a>
            {whatWeDo.length > 0 && (
              <a href="#approach" className="transition-colors hover:text-white">
                Approach
              </a>
            )}
            {services.length > 0 && (
              <a href="#services" className="transition-colors hover:text-white">
                Services
              </a>
            )}
            {testimonials.length > 0 && (
              <a href="#testimonials" className="transition-colors hover:text-white">
                Reviews
              </a>
            )}
            <a href="#contact" className="transition-colors hover:text-white">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={primaryCtaUrl}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
              style={{ backgroundColor: accentColor }}
            >
              <span className="relative z-10">{primaryCtaLabel}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-zinc-800 bg-zinc-950/95 px-6 py-6 backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col gap-4 text-sm font-semibold tracking-wide text-zinc-300">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white"
              >
                About
              </a>
              {whatWeDo.length > 0 && (
                <a
                  href="#approach"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white"
                >
                  Approach
                </a>
              )}
              {services.length > 0 && (
                <a
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white"
                >
                  Services
                </a>
              )}
              {testimonials.length > 0 && (
                <a
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white"
                >
                  Reviews
                </a>
              )}
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white"
              >
                Contact
              </a>
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
                <p className="mt-4 text-xl font-medium text-zinc-300 sm:text-2xl">{tagline}</p>
              )}

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {description}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={primaryCtaUrl}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 8px 24px -6px ${accentColor}60`,
                  }}
                >
                  <span>{primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#about"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800"
                >
                  Explore Company
                </a>
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
                    <img
                      src={heroImageUrl}
                      alt={businessName || "Business hero banner"}
                      className="absolute inset-0 h-full w-full object-cover"
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

      {/* ================= STATS / HIGHLIGHTS ================= */}
      <section className="relative z-10 border-y border-zinc-800/60 bg-zinc-900/30 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-8 text-center">
          {founded && (
            <div>
              <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Est. {founded}
              </span>
              <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Established
              </span>
            </div>
          )}

          {services.length > 0 && (
            <div>
              <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {services.length}+
              </span>
              <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                Core Capabilities
              </span>
            </div>
          )}

          {certifications.length > 0 &&
            certifications.slice(0, 2).map((cert, idx) => (
              <div key={idx}>
                <span className="inline-flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
                  <ShieldCheck className="h-5 w-5" style={{ color: accentColor }} />
                  {cert}
                </span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Accreditation
                </span>
              </div>
            ))}
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="relative z-10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                About Us
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Precision, Innovation & Excellence
              </h2>
              <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
                {description}
              </p>

              {address && (
                <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-5 py-4 text-sm text-zinc-300 backdrop-blur-md">
                  <MapPin className="h-5 w-5 shrink-0" style={{ color: accentColor }} />
                  <span>
                    {[address.street, address.city, address.state, address.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-2xl">
                {heroImageUrl ? (
                  <img
                    src={heroImageUrl}
                    alt={businessName || "About image"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-8 text-center text-zinc-600">
                    <Building2 className="h-16 w-16 stroke-[1.5]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO / APPROACH ================= */}
      {whatWeDo.length > 0 && (
        <section
          id="approach"
          className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                Methodology
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Strategic Framework
              </h2>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeDo.map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div
                    className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SERVICES / SOLUTIONS ================= */}
      {services.length > 0 && (
        <section id="services" className="relative z-10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                Capabilities
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Solutions built for scale
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
                        className="absolute -top-3.5 right-6 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
                        style={{ backgroundColor: accentColor }}
                      >
                        Featured
                      </span>
                    )}

                    <h3 className="text-2xl font-bold text-white">{s.title}</h3>

                    {s.price && (
                      <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                        {s.price}
                        {s.priceNote && (
                          <span className="ml-2 text-xs font-normal text-zinc-400">
                            {s.priceNote}
                          </span>
                        )}
                      </p>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">{s.description}</p>

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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white transition-all hover:opacity-90"
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

      {/* ================= TESTIMONIALS ================= */}
      {testimonials.length > 0 && (
        <section
          id="testimonials"
          className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                Testimonials
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                What clients say
              </h2>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              {testimonials.map((t, i) => (
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
                        <img
                          src={t.avatarUrl}
                          alt={t.author || "Avatar"}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: accentColor }}
                      >
                        {t.author ? t.author.charAt(0) : "A"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{t.author}</p>
                      {t.platform && <p className="text-xs text-zinc-500">{t.platform}</p>}
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
        <section className="relative z-10 border-t border-zinc-800/60 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
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

      {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="relative z-10 border-t border-zinc-800/60 bg-zinc-900/20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                Get In Touch
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Let&apos;s build together
              </h2>
              <p className="mt-4 text-base text-zinc-400">
                Ready to take your project forward? Contact our team directly through any of the
                channels below.
              </p>

              <div className="mt-8 space-y-4">
                {contacts.map((c, i) => (
                  <a
                    key={i}
                    href={cHref(c.type, c.value)}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
                      style={{ backgroundColor: accentColor }}
                    >
                      <ContactIcon type={c.type} />
                    </div>
                    <span>{c.value}</span>
                  </a>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-bold text-zinc-300 transition-all hover:border-zinc-700 hover:text-white"
                    >
                      <span>{s.label || s.platform}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {businessHours.length > 0 && (
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6" style={{ color: accentColor }} />
                    <h3 className="text-xl font-bold text-white">Hours of Operation</h3>
                  </div>

                  <div className="mt-6 divide-y divide-zinc-800/80">
                    {businessHours.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-3 text-sm">
                        <span className="font-medium text-zinc-300">{h.day}</span>
                        <span
                          className={
                            h.isClosed ? "font-normal text-zinc-500" : "font-semibold text-white"
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
              <img
                src={logoUrl}
                alt={businessName || "Footer Logo"}
                className="h-7 w-auto object-contain"
              />
            ) : (
              <span className="text-base font-bold text-white">{businessName}</span>
            )}
          </div>

          <p className="text-xs text-zinc-500" > 
            © {year ?? "2026"} {businessName}. All rights reserved.{" "}
          </p>
        </div>
      </footer>
    </div>
  );
}
