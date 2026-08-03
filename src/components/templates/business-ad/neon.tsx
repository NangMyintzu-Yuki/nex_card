// src/components/templates/business-ad/neon.tsx
// Neon — velvet nightlife: immersive photo-first, deep navy + rose/amber, soft serif
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

export function NeonBusiness({
  data,
  accentColor = "#E8A87C",
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
    address,
  } = data;

  const accent = accentColor;
  const rose = "#C45C7A";
  const addr = formatAddress(address);
  const phone = contacts.find((c) => c.type === "phone" || c.type === "whatsapp");
  const email = contacts.find((c) => c.type === "email");
  const featured = services.filter((s) => s.highlighted);
  const tonight = featured.length > 0 ? featured : services.slice(0, 2);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-clip bg-[#0A0E17] text-[#F4EDE4] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600&display=swap');
        .n-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .n-body { font-family: 'Outfit', system-ui, sans-serif; }
        @keyframes n-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes n-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
        .n-fade { animation: n-fade 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .n-d1 { animation-delay: 0.12s; }
        .n-d2 { animation-delay: 0.24s; }
        .n-d3 { animation-delay: 0.36s; }
        .n-orb { animation: n-glow 6s ease-in-out infinite; }
      `}</style>

      <section className="relative isolate min-h-[100svh] overflow-hidden">
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
              background: `radial-gradient(ellipse 80% 60% at 70% 20%, ${rose}55 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 20% 80%, ${accent}40 0%, transparent 50%), linear-gradient(165deg, #12182A 0%, #0A0E17 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17]/70 via-[#0A0E17]/45 to-[#0A0E17]" />
        {!heroImageUrl ? (
          <>
            <div
              className="n-orb pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full blur-3xl"
              style={{ backgroundColor: rose }}
            />
            <div
              className="n-orb pointer-events-none absolute -left-16 bottom-1/4 h-64 w-64 rounded-full blur-3xl"
              style={{ backgroundColor: accent, animationDelay: "2s" }}
            />
          </>
        ) : null}

        <div className="relative mx-auto flex min-h-[100svh] max-w-4xl flex-col justify-end px-6 pb-16 pt-28 sm:px-10 sm:pb-20">
          <div className="n-fade flex items-center gap-4">
            {logoUrl ? (
              <div className="relative h-12 w-12 shrink-0">
                <TemplateImage
                  src={logoUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
            ) : null}
            <div>
              <p className="n-body text-[11px] font-medium uppercase tracking-[0.28em] text-[#F4EDE4]/55">
                {businessName}
              </p>
              {industry ? (
                <p className="n-body mt-1 text-xs tracking-wide" style={{ color: accent }}>
                  {industry}
                </p>
              ) : null}
            </div>
          </div>

          <h1 className="n-display n-fade n-d1 mt-8 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            {tagline}
          </h1>
          <p className="n-body n-fade n-d2 mt-5 max-w-lg text-base font-light leading-relaxed text-[#F4EDE4]/70 sm:text-lg">
            {description.length > 180 ? `${description.slice(0, 180).trim()}…` : description}
          </p>

          <div className="n-fade n-d3 mt-10">
            <a
              href={primaryCtaUrl}
              className="n-body inline-flex items-center gap-3 border border-[#F4EDE4]/30 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#F4EDE4] transition hover:border-[#F4EDE4] hover:bg-[#F4EDE4]/5"
            >
              {primaryCtaLabel}
              <span aria-hidden style={{ color: accent }}>
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="tonight" className="relative border-t border-[#F4EDE4]/10">
        <div className="mx-auto grid max-w-5xl gap-0 lg:grid-cols-2">
          <div className="border-b border-[#F4EDE4]/10 px-6 py-16 sm:px-10 lg:border-b-0 lg:border-r">
            <p
              className="n-body text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              The room
            </p>
            <p className="n-display mt-5 text-3xl font-medium leading-snug sm:text-4xl">
              {description}
            </p>
          </div>
          <div className="px-6 py-16 sm:px-10">
            <p
              className="n-body text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: rose }}
            >
              Tonight
            </p>
            <ul className="mt-6 space-y-8">
              {tonight.map((p, i) => (
                <li key={`${p.title}-tonight-${i}`}>
                  <p className="n-display text-2xl font-semibold italic">{p.title}</p>
                  {p.description ? (
                    <p className="n-body mt-2 text-sm font-light leading-relaxed text-[#F4EDE4]/60">
                      {p.description}
                    </p>
                  ) : null}
                  {p.price ? (
                    <p className="n-body mt-2 text-[11px] uppercase tracking-[0.15em]" style={{ color: accent }}>
                      {p.price}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {services.length > 0 ? (
        <section className="border-t border-[#F4EDE4]/10 px-6 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="n-body text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: accent }}>
              On the list
            </p>
            <ul className="mt-10 space-y-0">
              {services.map((s, i) => (
                <li
                  key={`${s.title}-${i}`}
                  className="flex flex-col gap-2 border-t border-[#F4EDE4]/10 py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="n-display text-2xl font-semibold tracking-tight sm:text-3xl">
                      {s.title}
                    </p>
                    {s.description ? (
                      <p className="n-body mt-2 max-w-md text-sm font-light text-[#F4EDE4]/55">
                        {s.description}
                      </p>
                    ) : null}
                  </div>
                  {s.price ? (
                    <p className="n-display shrink-0 text-xl italic tabular-nums" style={{ color: accent }}>
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
        <section className="border-t border-[#F4EDE4]/10 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <p className="n-body mb-8 text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: rose }}>
              Atmosphere
            </p>
            <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
              {gallery.slice(0, 5).map((g, i) => {
                const spans = [
                  "sm:col-span-7 sm:row-span-2 min-h-[280px]",
                  "sm:col-span-5 min-h-[160px]",
                  "sm:col-span-5 min-h-[160px]",
                  "sm:col-span-6 min-h-[200px]",
                  "sm:col-span-6 min-h-[200px]",
                ];
                return (
                  <div
                    key={g.url + i}
                    className={`relative overflow-hidden ${spans[i] ?? "sm:col-span-4 min-h-[180px]"}`}
                  >
                    <TemplateImage
                      src={g.url}
                      alt={g.alt || ""}
                      fill
                      className="object-cover transition duration-700 hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/50 to-transparent" />
                    {g.caption ? (
                      <p className="n-body absolute bottom-3 left-3 text-[11px] tracking-wide text-[#F4EDE4]/80">
                        {g.caption}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {businessHours.length > 0 ? (
        <section className="border-t border-[#F4EDE4]/10 px-6 py-14 sm:px-10">
          <div className="mx-auto max-w-md text-center">
            <p className="n-body text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: accent }}>
              Doors
            </p>
            <ul className="n-body mt-6 space-y-2 text-sm font-light">
              {businessHours.map((h) => (
                <li key={h.day} className="flex justify-between gap-6 text-[#F4EDE4]/75">
                  <span>{dayLabel(h.day)}</span>
                  <span className="tabular-nums">
                    {h.isClosed ? "Closed" : `${h.open} – ${h.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {testimonials && testimonials.length > 0 ? (
        <section className="border-t border-[#F4EDE4]/10 px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-3xl">
            {testimonials.map((t, i) => (
              <blockquote
                key={i}
                className={i > 0 ? "mt-12 border-t border-[#F4EDE4]/10 pt-12" : ""}
              >
                {typeof t.rating === "number" ? (
                  <p className="n-body mb-3 text-xs tracking-[0.3em]" style={{ color: accent }}>
                    {stars(t.rating)}
                  </p>
                ) : null}
                <p className="n-display text-3xl font-medium italic leading-snug sm:text-4xl">
                  &ldquo;{t.text}&rdquo;
                </p>
                <footer className="n-body mt-5 text-sm font-light text-[#F4EDE4]/50">
                  {t.author}
                  {t.platform ? ` · ${t.platform}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t border-[#F4EDE4]/10 bg-[#070A10]">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10 sm:py-16">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="n-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {businessName}
              </p>
              <p className="n-body mt-2 text-sm font-light text-[#F4EDE4]/45">{tagline}</p>
              <div className="n-body mt-6 space-y-1 text-sm font-light text-[#F4EDE4]/65">
                {phone ? (
                  <a
                    href={contactHref(phone.type, phone.value)}
                    className="block transition hover:text-[#F4EDE4]"
                  >
                    {phone.value}
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={contactHref(email.type, email.value)}
                    className="block transition hover:text-[#F4EDE4]"
                  >
                    {email.value}
                  </a>
                ) : null}
                {addr ? <p className="text-[#F4EDE4]/45">{addr}</p> : null}
              </div>
            </div>
            <div className="flex flex-col items-start gap-6 sm:items-end">
              <a
                href={primaryCtaUrl}
                className="n-body inline-flex px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0E17] transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {primaryCtaLabel}
              </a>
              {secondaryCtaLabel && secondaryCtaUrl ? (
                <a
                  href={secondaryCtaUrl}
                  className="n-body text-xs uppercase tracking-[0.18em] text-[#F4EDE4]/50 hover:text-[#F4EDE4]"
                >
                  {secondaryCtaLabel}
                </a>
              ) : null}
              <SocialIconLinks
                links={socialLinks}
                linkClassName="border border-[#F4EDE4]/20 text-[#F4EDE4]/70 hover:border-[#F4EDE4]/50 hover:text-[#F4EDE4]"
                iconClassName="h-4 w-4"
              />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
