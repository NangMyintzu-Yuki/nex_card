// src/components/templates/business-ad/district.tsx
// District — coastal local commerce: white + deep teal, hours/address first, bold sans
"use client";

import { TemplateImage } from "@/components/templates/template-image";
import {
  contactHref,
  dayLabel,
  formatAddress,
  stars,
  type BusinessAdProps,
} from "./_shared";
import { SocialIconLinks } from "./_social-links";

export function DistrictBusiness({
  data,
  accentColor = "#0F766E",
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
    businessHours = [],
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    industry,
    founded,
    address,
  } = data;

  const accent = accentColor;
  const addr = formatAddress(address);
  const phone = contacts.find((c) => c.type === "phone" || c.type === "whatsapp");
  const email = contacts.find((c) => c.type === "email");
  const mapsHref =
    address?.googleMapsUrl ||
    (addr
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
      : null);
  const offers = services.filter((s) => s.highlighted);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-clip bg-[#F8FAFB] text-[#0C1A1A] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .d-display { font-family: 'DM Sans', system-ui, sans-serif; }
        .d-body { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
        @keyframes d-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .d-rise { animation: d-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .d-d1 { animation-delay: 0.08s; }
        .d-d2 { animation-delay: 0.18s; }
        .d-d3 { animation-delay: 0.28s; }
      `}</style>

      <header className="border-b border-[#0C1A1A]/[0.08] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <div className="relative h-10 w-10 shrink-0">
                <TemplateImage
                  src={logoUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
            ) : null}
            <p className="d-display truncate text-sm font-bold tracking-tight sm:text-base">
              {businessName}
            </p>
          </div>
          {industry ? (
            <span
              className="d-body shrink-0 rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
              style={{ backgroundColor: accent }}
            >
              {industry}
              {founded ? ` · ${founded}` : ""}
            </span>
          ) : null}
        </div>
      </header>

      <section className="relative isolate min-h-[52vh] overflow-hidden sm:min-h-[58vh]">
        {heroImageUrl ? (
          <TemplateImage
            src={heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${accent} 0%, #134E4A 55%, #0C1A1A 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A1A]/[0.88] via-[#0C1A1A]/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[52vh] max-w-5xl flex-col justify-end px-5 pb-10 pt-24 sm:min-h-[58vh] sm:px-8 sm:pb-14">
          <p className="d-body d-rise mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            {tagline}
          </p>
          <h1 className="d-display d-rise d-d1 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            {businessName}
          </h1>
          <p className="d-body d-rise d-d2 mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {description.length > 160 ? `${description.slice(0, 160).trim()}…` : description}
          </p>
          <div className="d-rise d-d3 mt-8 flex flex-wrap gap-3">
            <a
              href={primaryCtaUrl}
              className="d-display inline-flex items-center bg-white px-6 py-3 text-sm font-bold tracking-tight text-[#0C1A1A] transition hover:bg-white/90"
            >
              {primaryCtaLabel}
            </a>
            {phone ? (
              <a
                href={contactHref(phone.type, phone.value)}
                className="d-display inline-flex items-center border border-white/40 px-6 py-3 text-sm font-bold tracking-tight text-white transition hover:bg-white/10"
              >
                Call now
              </a>
            ) : secondaryCtaLabel && secondaryCtaUrl ? (
              <a
                href={secondaryCtaUrl}
                className="d-display inline-flex items-center border border-white/40 px-6 py-3 text-sm font-bold tracking-tight text-white transition hover:bg-white/10"
              >
                {secondaryCtaLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-[#0C1A1A]/[0.08] bg-white">
        <div className="mx-auto grid max-w-5xl gap-0 sm:grid-cols-2">
          <div className="border-b border-[#0C1A1A]/[0.08] px-5 py-8 sm:border-b-0 sm:border-r sm:px-8">
            <p className="d-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0C1A1A]/45">
              Find us
            </p>
            {addr ? (
              mapsHref ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-display mt-3 block text-xl font-bold leading-snug tracking-tight text-[#0C1A1A] underline-offset-4 hover:underline sm:text-2xl"
                >
                  {addr}
                </a>
              ) : (
                <p className="d-display mt-3 text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                  {addr}
                </p>
              )
            ) : (
              <p className="d-body mt-3 text-sm text-[#0C1A1A]/50">Address coming soon</p>
            )}
          </div>
          <div className="px-5 py-8 sm:px-8">
            <p className="d-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0C1A1A]/45">
              Hours
            </p>
            {businessHours.length ? (
              <ul className="d-body mt-3 space-y-1.5 text-sm">
                {businessHours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span className="font-medium">{dayLabel(h.day)}</span>
                    <span className="tabular-nums text-[#0C1A1A]/65">
                      {h.isClosed ? "Closed" : `${h.open} – ${h.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="d-body mt-3 text-sm text-[#0C1A1A]/50">Hours not listed</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
        <p className="d-body text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
          About
        </p>
        <p className="d-display mt-4 max-w-2xl text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {description}
        </p>
      </section>

      {services.length > 0 ? (
        <section id="services" className="border-y border-[#0C1A1A]/[0.08] bg-white">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
            <p className="d-body text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              What we offer
            </p>
            <ul className="mt-8 divide-y divide-[#0C1A1A]/[0.08]">
              {services.map((s, i) => (
                <li
                  key={`${s.title}-${i}`}
                  className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <div className="min-w-0">
                    <p className="d-display text-lg font-bold tracking-tight">{s.title}</p>
                    {s.description ? (
                      <p className="d-body mt-1 text-sm leading-relaxed text-[#0C1A1A]/60">
                        {s.description}
                      </p>
                    ) : null}
                  </div>
                  {s.price ? (
                    <p
                      className="d-display shrink-0 text-base font-bold tabular-nums"
                      style={{ color: accent }}
                    >
                      {s.price}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {gallery && gallery.length > 0 ? (
        <section className="overflow-x-auto">
          <div className="flex min-w-max gap-0">
            {gallery.map((g, i) => (
              <div key={g.url + i} className="relative h-48 w-72 shrink-0 sm:h-56 sm:w-80">
                <TemplateImage
                  src={g.url}
                  alt={g.alt || ""}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {offers.length > 0 ? (
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <p className="d-body text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
            Featured
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {offers.map((p, i) => (
              <div
                key={`${p.title}-offer-${i}`}
                className="border-l-4 bg-white px-5 py-5"
                style={{ borderColor: accent }}
              >
                <p className="d-display text-lg font-bold tracking-tight">{p.title}</p>
                {p.description ? (
                  <p className="d-body mt-2 text-sm leading-relaxed text-[#0C1A1A]/60">
                    {p.description}
                  </p>
                ) : null}
                {p.price ? (
                  <p className="d-body mt-3 text-[11px] font-medium uppercase tracking-wider" style={{ color: accent }}>
                    {p.price}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials && testimonials.length > 0 ? (
        <section className="border-t border-[#0C1A1A]/[0.08] bg-white">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <p className="d-body text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              Neighbors say
            </p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {testimonials.map((t, i) => (
                <blockquote key={i}>
                  {typeof t.rating === "number" ? (
                    <p className="d-body mb-2 text-xs tracking-widest" style={{ color: accent }}>
                      {stars(t.rating)}
                    </p>
                  ) : null}
                  <p className="d-display text-lg font-bold leading-snug tracking-tight">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <footer className="d-body mt-3 text-sm text-[#0C1A1A]/55">
                    — {t.author}
                    {t.platform ? `, ${t.platform}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-[#0C1A1A]/[0.08]" style={{ backgroundColor: accent }}>
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-12 text-white sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="d-display text-2xl font-extrabold tracking-tight">{businessName}</p>
            <div className="d-body mt-4 flex flex-col gap-1 text-sm text-white/85">
              {phone ? (
                <a href={contactHref(phone.type, phone.value)} className="hover:underline">
                  {phone.value}
                </a>
              ) : null}
              {email ? (
                <a href={contactHref(email.type, email.value)} className="hover:underline">
                  {email.value}
                </a>
              ) : null}
              {addr ? <p className="text-white/70">{addr}</p> : null}
            </div>
          </div>
          <SocialIconLinks
            links={socialLinks}
            linkClassName="rounded-sm border border-white/25 text-white hover:bg-white/10"
            iconClassName="h-[18px] w-[18px]"
          />
        </div>
      </footer>
    </main>
  );
}
