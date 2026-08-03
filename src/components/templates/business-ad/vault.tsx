// src/components/templates/business-ad/vault.tsx
// Vault — institutional light: cool slate, tabular services, certification stamps
"use client";

import { useState } from "react";
import { TemplateImage } from "@/components/templates/template-image";
import {
  contactHref,
  formatAddress,
  type BusinessAdProps,
} from "./_shared";
import { SocialIconLinks } from "./_social-links";

export function VaultBusiness({
  data,
  accentColor = "#3b5368",
}: BusinessAdProps) {
  const {
    businessName,
    tagline,
    description,
    logoUrl,
    services = [],
    contacts = [],
    socialLinks = [],
    testimonials = [],
    faq = [],
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

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const accent = accentColor;
  const addr = formatAddress(address);

  return (
    <main
      className="min-h-screen w-full max-w-full overflow-x-clip bg-[#eef1f4] text-[#1a2330] antialiased"
      style={{ fontFamily: "system-ui, 'IBM Plex Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Centered mark + rule */}
      <header className="border-b border-[#cfd6de] bg-[#f7f9fb] px-5 py-12 text-center sm:px-8 sm:py-16">
        {logoUrl && (
          <div className="relative mx-auto mb-6 h-14 w-14 overflow-hidden rounded-full border border-[#cfd6de] bg-white">
            <TemplateImage
              src={logoUrl}
              alt=""
              fill
              className="object-contain p-2"
              sizes="56px"
            />
          </div>
        )}
        <p
          className="font-mono text-[10px] uppercase tracking-[0.35em]"
          style={{ color: accent }}
        >
          {industry || "Professional services"}
          {founded ? ` · Est. ${founded}` : ""}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {businessName}
        </h1>
        <div className="mx-auto mt-5 h-px w-16" style={{ background: accent }} />
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#4a5563]">
          {tagline}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={primaryCtaUrl}
            className="px-6 py-2.5 text-sm font-semibold text-white"
            style={{ background: accent }}
          >
            {primaryCtaLabel}
          </a>
          {secondaryCtaLabel && secondaryCtaUrl && (
            <a
              href={secondaryCtaUrl}
              className="border border-[#cfd6de] bg-white px-6 py-2.5 text-sm font-semibold text-[#1a2330]"
            >
              {secondaryCtaLabel}
            </a>
          )}
        </div>
      </header>

      {/* Certification stamps */}
      {(certifications.length > 0 || employeeCount) && (
        <section className="border-b border-[#cfd6de] bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4">
            {employeeCount && (
              <span className="border border-[#cfd6de] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#4a5563]">
                Team {employeeCount}
              </span>
            )}
            {certifications.map((c) => (
              <span
                key={c}
                className="border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider"
                style={{ borderColor: accent, color: accent }}
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Credentials / about */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h2
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            Overview
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#2d3748]">{description}</p>
        </div>
      </section>

      {/* Services as price table — tabular */}
      {services.length > 0 && (
        <section className="border-y border-[#cfd6de] bg-white px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Schedule of services
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#1a2330]">
                    <th className="py-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4a5563]">
                      Service
                    </th>
                    <th className="py-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4a5563]">
                      Scope
                    </th>
                    <th className="py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4a5563]">
                      Fee
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#e2e8f0] align-top"
                      style={
                        s.highlighted
                          ? { background: `${accent}08` }
                          : undefined
                      }
                    >
                      <td className="py-4 pr-4 font-semibold">{s.title}</td>
                      <td className="py-4 pr-4 text-[#4a5563]">
                        {s.description}
                        {s.features && s.features.length > 0 && (
                          <ul className="mt-2 space-y-0.5 text-xs text-[#718096]">
                            {s.features.map((f) => (
                              <li key={f}>— {f}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-4 text-right font-mono text-xs whitespace-nowrap">
                        {s.price || "—"}
                        {s.priceNote && (
                          <span className="mt-1 block text-[10px] text-[#718096]">
                            {s.priceNote}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials — restrained */}
      {testimonials && testimonials.length > 0 && (
        <section className="px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Client statements
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 bg-white px-5 py-4"
                  style={{ borderColor: accent }}
                >
                  <p className="text-sm leading-relaxed text-[#2d3748]">{t.text}</p>
                  <footer className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[#718096]">
                    {t.author}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ accordion */}
      {faq && faq.length > 0 && (
        <section className="border-t border-[#cfd6de] bg-white px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <h2
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Frequently asked
            </h2>
            <div className="mt-6">
              {faq.map((item, i) => (
                <div key={i} className="border-b border-[#e2e8f0]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold"
                  >
                    {item.question}
                    <span className="font-mono text-xs text-[#718096]">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="pb-4 text-sm leading-relaxed text-[#4a5563]">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Formal contact */}
      <section className="px-5 py-16 sm:px-8" style={{ background: accent, color: "#f7f9fb" }}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold">Contact the office</h2>
          {addr && <p className="mt-3 text-sm opacity-85">{addr}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            {contacts.map((c, i) => (
              <a
                key={i}
                href={contactHref(c.type, c.value)}
                className="underline-offset-2 hover:underline"
              >
                {c.label || c.value}
              </a>
            ))}
          </div>
          <a
            href={primaryCtaUrl}
            className="mt-8 inline-block bg-white px-7 py-3 text-sm font-semibold"
            style={{ color: accent }}
          >
            {primaryCtaLabel}
          </a>
        </div>
      </section>

      <footer className="border-t border-[#cfd6de] bg-[#f7f9fb] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">{businessName}</p>
          <SocialIconLinks
            links={socialLinks}
            linkClassName="border border-[#cfd6de] text-[#718096] hover:border-[#3b5368] hover:text-[#1a2330]"
            iconClassName="h-3.5 w-3.5"
          />
        </div>
      </footer>
    </main>
  );
}
