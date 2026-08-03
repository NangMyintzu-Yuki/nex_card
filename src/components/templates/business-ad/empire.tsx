// src/components/templates/business-ad/empire.tsx
// Empire — quiet luxury B2B: espresso + champagne, serif display, editorial split
"use client";

import { useState } from "react";
import { TemplateImage } from "@/components/templates/template-image";
import {
  contactHref,
  formatAddress,
  type BusinessAdProps,
} from "./_shared";
import { SocialIconLinks } from "./_social-links";

export function EmpireBusiness({
  data,
  accentColor = "#c4a574",
}: BusinessAdProps) {
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
    faq = [],
    history = [],
    whatWeDo = [],
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    certifications = [],
    founded,
    industry,
    employeeCount,
    address,
  } = data;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const accent = accentColor;
  const addr = formatAddress(address);
  const capabilities = whatWeDo && whatWeDo.length > 0 ? whatWeDo : services.slice(0, 6).map((s) => ({
    title: s.title,
    description: s.description,
  }));

  return (
    <main
      className="min-h-screen w-full max-w-full overflow-x-clip bg-[#14110e] text-[#ebe4d8] antialiased"
      style={{ fontFamily: "Georgia, 'Times New Roman', 'Palatino Linotype', serif" }}
    >
      <style>{`
        .em-sans { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
      `}</style>

      {/* Minimal top rule — not sticky glass nav */}
      <div className="em-sans flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-12 lg:px-20">
        <div className="flex items-center gap-4">
          {logoUrl && (
            <div className="relative h-8 w-24">
              <TemplateImage
                src={logoUrl}
                alt=""
                fill
                className="object-contain object-left opacity-90"
                sizes="96px"
              />
            </div>
          )}
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/40">
            {industry || "Established"}
            {founded ? ` ${founded}` : ""}
          </span>
        </div>
        <a
          href={primaryCtaUrl}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors hover:opacity-80"
          style={{ color: accent }}
        >
          {primaryCtaLabel}
        </a>
      </div>

      {/* Editorial asymmetric hero */}
      <section className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-10" style={{ background: accent }} />
            <span
              className="em-sans text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Manifesto
            </span>
          </div>
          <h1 className="text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {businessName}
          </h1>
          <p className="em-sans mt-6 max-w-md text-sm leading-relaxed text-white/55">
            {tagline}
          </p>
          <div className="em-sans mt-10 flex flex-wrap gap-4">
            <a
              href={primaryCtaUrl}
              className="border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#14110e]"
              style={{ background: accent, borderColor: accent }}
            >
              {primaryCtaLabel}
            </a>
            {secondaryCtaLabel && secondaryCtaUrl && (
              <a
                href={secondaryCtaUrl}
                className="border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70 hover:border-white/50"
              >
                {secondaryCtaLabel}
              </a>
            )}
          </div>
          {(employeeCount || certifications.length > 0) && (
            <p className="em-sans mt-12 text-[10px] uppercase tracking-[0.25em] text-white/35">
              {[employeeCount && `${employeeCount} people`, ...certifications.slice(0, 2)]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          )}
        </div>
        <div className="relative min-h-[420px] lg:min-h-full">
          {heroImageUrl ? (
            <>
              <TemplateImage
                src={heroImageUrl}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-[#14110e]/25" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(145deg, #1c1814 0%, ${accent}22 100%)`,
              }}
            />
          )}
        </div>
      </section>

      {/* Ornament divider */}
      <div className="flex items-center justify-center gap-4 py-10">
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
        <span className="h-1.5 w-1.5 rotate-45" style={{ background: accent }} />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
      </div>

      {/* Long-form description */}
      <section className="mx-auto max-w-3xl px-6 pb-20 text-center sm:px-12">
        <p className="text-xl leading-relaxed text-white/75 sm:text-2xl">{description}</p>
      </section>

      {/* Capabilities — numbered, wide margins */}
      {capabilities.length > 0 && (
        <section className="border-t border-white/10 px-6 py-20 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-5xl">
            <h2
              className="em-sans mb-14 text-[10px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Capabilities
            </h2>
            <div className="space-y-12">
              {capabilities.map((c, i) => (
                <div key={i} className="grid gap-4 md:grid-cols-12 md:gap-8">
                  <span
                    className="em-sans text-xs tracking-widest md:col-span-2"
                    style={{ color: accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl md:col-span-4">{c.title}</h3>
                  <p className="em-sans text-sm leading-relaxed text-white/50 md:col-span-6">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full services if more detail needed */}
      {services.length > 0 && whatWeDo && whatWeDo.length > 0 && (
        <section className="em-sans border-t border-white/10 px-6 py-16 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-5xl">
            <h2
              className="mb-10 text-[10px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Engagements
            </h2>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {services.map((s, i) => (
                <div key={i} className="bg-[#14110e] p-8">
                  <h3 className="font-serif text-xl text-[#ebe4d8]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">{s.description}</p>
                  {s.price && (
                    <p className="mt-4 text-xs tracking-wider" style={{ color: accent }}>
                      {s.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Proof quotes */}
      {testimonials && testimonials.length > 0 && (
        <section className="border-t border-white/10 px-6 py-20 sm:px-12">
          <div className="mx-auto max-w-4xl space-y-16">
            {testimonials.slice(0, 3).map((t, i) => (
              <blockquote key={i} className="text-center">
                <p className="text-2xl leading-snug text-white/85 sm:text-3xl">
                  &ldquo;{t.text}&rdquo;
                </p>
                <footer className="em-sans mt-6 text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {t.author}
                  {t.platform ? ` — ${t.platform}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* History timeline */}
      {history && history.length > 0 && (
        <section className="border-t border-white/10 px-6 py-20 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-4xl">
            <h2
              className="em-sans mb-12 text-[10px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Timeline
            </h2>
            <ol className="space-y-8">
              {history.map((h, i) => (
                <li key={i} className="grid gap-2 border-l pl-6 sm:grid-cols-12 sm:gap-6" style={{ borderColor: `${accent}55` }}>
                  <span className="em-sans text-xs tracking-wider sm:col-span-2" style={{ color: accent }}>
                    {h.year}
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="text-lg">{h.title}</h3>
                    <p className="em-sans mt-1 text-sm text-white/45">{h.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <section className="em-sans border-t border-white/10 px-6 py-16 sm:px-12">
          <div className="mx-auto max-w-2xl">
            <h2
              className="mb-8 text-[10px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              Inquiries
            </h2>
            {faq.map((item, i) => (
              <div key={i} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full justify-between gap-4 py-4 text-left text-sm"
                >
                  {item.question}
                  <span style={{ color: accent }}>{openFaq === i ? "–" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="pb-4 text-sm leading-relaxed text-white/45">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="border-t border-white/10 px-6 py-20 text-center sm:px-12">
        <h2 className="text-3xl sm:text-4xl">Begin a conversation</h2>
        <a
          href={primaryCtaUrl}
          className="em-sans mt-8 inline-block px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#14110e]"
          style={{ background: accent }}
        >
          {primaryCtaLabel}
        </a>
        {addr && (
          <p className="em-sans mt-8 text-xs tracking-wide text-white/40">{addr}</p>
        )}
      </section>

      <footer className="em-sans border-t border-white/10 px-6 py-10 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:justify-between">
          <p className="font-serif text-sm">{businessName}</p>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <div className="flex flex-wrap gap-5 text-[10px] uppercase tracking-[0.2em] text-white/40">
              {contacts.map((c, i) => (
                <a key={i} href={contactHref(c.type, c.value)} className="hover:text-white/70">
                  {c.label || c.value}
                </a>
              ))}
            </div>
            <SocialIconLinks
              links={socialLinks}
              linkClassName="border border-white/15 text-white/50 hover:border-white/40 hover:text-white/80"
              iconClassName="h-3.5 w-3.5"
            />
          </div>
        </div>
      </footer>
    </main>
  );
}
