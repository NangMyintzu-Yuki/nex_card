// src/components/templates/business-ad/marquee.tsx
// Marquee — kinetic retail / events: full-bleed hero, continuous ticker, coral accent
"use client";

import { TemplateImage } from "@/components/templates/template-image";
import {
  contactHref,
  formatAddress,
  stars,
  type BusinessAdProps,
} from "./_shared";
import { SocialIconLinks } from "./_social-links";

export function MarqueeBusiness({
  data,
  accentColor = "#f97316",
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
    gallery = [],
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    industry,
    founded,
    address,
  } = data;

  const accent = accentColor;
  const tickerItems =
    services.length > 0
      ? services.map((s) => s.title)
      : [tagline, industry, businessName].filter(Boolean) as string[];
  const tickerLoop = [...tickerItems, ...tickerItems, ...tickerItems];
  const addr = formatAddress(address);

  return (
    <main
      className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[#121212] text-[#f5f0eb] antialiased"
      style={{ fontFamily: "var(--font-space), 'Arial Narrow', Impact, sans-serif" }}
    >
      <style>{`
        @keyframes mq-ticker { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        .mq-ticker { animation: mq-ticker 28s linear infinite; }
        .mq-body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
      `}</style>

      {/* Continuous service ticker */}
      <div
        className="overflow-hidden border-b py-2.5"
        style={{ borderColor: `${accent}55`, background: accent, color: "#111" }}
      >
        <div className="mq-ticker flex w-max gap-10 whitespace-nowrap text-xs font-black uppercase tracking-[0.25em]">
          {tickerLoop.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-10">
              {item}
              <span aria-hidden>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Full-bleed hero — brand as hero signal */}
      <section className="relative flex min-h-[88vh] flex-col justify-end overflow-hidden">
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <TemplateImage
              src={heroImageUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-black/30" />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${accent}33, transparent 50%), #121212`,
            }}
          />
        )}

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-28 sm:px-8">
          {logoUrl && (
            <div className="relative mb-6 h-12 w-36">
              <TemplateImage
                src={logoUrl}
                alt={businessName}
                fill
                className="object-contain object-left brightness-0 invert"
                sizes="144px"
              />
            </div>
          )}
          {industry && (
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              {industry}
              {founded ? ` · Est. ${founded}` : ""}
            </p>
          )}
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl md:text-8xl">
            {businessName}
          </h1>
          <p className="mq-body mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {tagline}
          </p>
          <div className="mq-body mt-8 flex flex-wrap gap-3">
            <a
              href={primaryCtaUrl}
              className="inline-flex items-center px-7 py-3.5 text-sm font-black uppercase tracking-wider text-black transition-opacity hover:opacity-90"
              style={{ background: accent }}
            >
              {primaryCtaLabel}
            </a>
            {secondaryCtaLabel && secondaryCtaUrl && (
              <a
                href={secondaryCtaUrl}
                className="inline-flex items-center border border-white/30 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white hover:border-white"
              >
                {secondaryCtaLabel}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="mq-body border-y border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/40 md:col-span-3">
            Now showing
          </p>
          <p className="text-lg leading-relaxed text-white/80 md:col-span-9 md:text-xl">
            {description}
          </p>
        </div>
      </section>

      {/* Services as horizontal strip — not cards */}
      {services.length > 0 && (
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-10 text-3xl font-black uppercase tracking-tight sm:text-4xl"
              style={{ color: accent }}
            >
              What&apos;s on
            </h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {services.map((s, i) => (
                <div
                  key={`${s.title}-${i}`}
                  className="mq-body grid gap-3 py-6 sm:grid-cols-12 sm:items-baseline"
                >
                  <span className="font-mono text-xs text-white/30 sm:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="sm:col-span-4">
                    <h3 className="text-xl font-black uppercase tracking-wide">
                      {s.title}
                    </h3>
                    {s.price && (
                      <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>
                        {s.price}
                        {s.priceNote ? ` · ${s.priceNote}` : ""}
                      </p>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-white/60 sm:col-span-7">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery filmstrip */}
      {gallery && gallery.length > 0 && (
        <section className="pb-4 pt-4">
          <div className="flex gap-3 overflow-x-auto px-5 pb-6 sm:px-8">
            {gallery.map((img, i) => (
              <div
                key={img.url + i}
                className="relative h-56 w-72 shrink-0 overflow-hidden sm:h-72 sm:w-96"
              >
                <TemplateImage
                  src={img.url}
                  alt={img.alt || `${businessName} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="384px"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — quote wall */}
      {testimonials && testimonials.length > 0 && (
        <section className="mq-body border-t border-white/10 px-5 py-16 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            {testimonials.slice(0, 4).map((t, i) => (
              <blockquote key={i} className="border-l-2 pl-5" style={{ borderColor: accent }}>
                <p className="text-sm text-white/40">{stars(t.rating)}</p>
                <p className="mt-2 text-lg leading-snug text-white/90">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-3 text-xs font-bold uppercase tracking-wider text-white/40">
                  {t.author}
                  {t.platform ? ` · ${t.platform}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section
        className="px-5 py-16 text-center sm:px-8"
        style={{ background: accent, color: "#111" }}
      >
        <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
          Ready when you are
        </h2>
        <a
          href={primaryCtaUrl}
          className="mq-body mt-6 inline-flex bg-black px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white"
        >
          {primaryCtaLabel}
        </a>
      </section>

      {/* Footer */}
      <footer className="mq-body border-t border-white/10 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-black uppercase">{businessName}</p>
            {addr && <p className="mt-2 max-w-sm text-sm text-white/50">{addr}</p>}
            {address?.googleMapsUrl && (
              <a
                href={address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Directions
              </a>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-sm text-white/60">
              {contacts.map((c, i) => (
                <a key={i} href={contactHref(c.type, c.value)} className="hover:text-white">
                  {c.label || c.value}
                </a>
              ))}
            </div>
            <SocialIconLinks
              links={socialLinks}
              linkClassName="border border-white/20 text-white/70 hover:border-white/50 hover:text-white"
              iconClassName="h-4 w-4"
            />
          </div>
        </div>
      </footer>
    </main>
  );
}
