'use client';

import Image from "next/image";
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

function StarRating({ r }: { r: number }) {
  return (
    <div className="flex gap-1 shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < r ? "text-amber-400" : "text-neutral-700"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function MarqueeBusiness({ data, accentColor = "#6366f1" }: BP) {
  const {
    businessName = "Business Name",
    tagline = "Your Company Tagline",
    description = "Company description goes here.",
    logoUrl,
    heroImageUrl,
    services = [],
    contacts = [],
    testimonials = [],
    gallery = [],
    primaryCtaLabel = "Get Started",
    primaryCtaUrl = "#",
    secondaryCtaLabel,
    secondaryCtaUrl,
    businessHours = [],
    certifications = [],
    founded,
    industry,
  } = data || {};

  const currentYear = new Date().getFullYear();

  return (
    /* Outer strict boundary wrapper to stop horizontal overflow */
    <div className="relative w-full max-w-full overflow-x-clip bg-neutral-950 text-neutral-100 font-sans antialiased">
      <main className="w-full max-w-full overflow-x-clip min-h-screen">
        
        {/* Top Banner Ticker */}
        <div className="w-full overflow-hidden py-2 bg-neutral-900 border-b border-white/10">
          <div className="w-full px-4 text-center">
            <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-400 max-w-full truncate">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="truncate">{tagline}</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5 min-w-0">
            <div className="flex items-center gap-3 min-w-0 shrink">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={businessName}
                  width={130}
                  height={40}
                  className="h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[160px] object-contain shrink-0"
                />
              ) : (
                <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent truncate">
                  {businessName}
                </span>
              )}
            </div>

            <nav className="hidden items-center gap-6 lg:gap-8 lg:flex text-sm font-medium text-neutral-400 shrink-0">
              {["About", "Services", "Reviews", "Contact"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="hover:text-white transition-colors"
                >
                  {l}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              {contacts
                .filter((c) => c.type === "phone")
                .slice(0, 1)
                .map((c, i) => (
                  <a
                    key={i}
                    href={`tel:${c.value.replace(/\s/g, "")}`}
                    className="hidden text-sm font-medium text-neutral-300 hover:text-white md:block transition-colors truncate"
                  >
                    {c.value}
                  </a>
                ))}
              <a
                href={primaryCtaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 shadow-lg shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {primaryCtaLabel}
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 border-b border-white/10 overflow-hidden">
          {heroImageUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={heroImageUrl}
                alt={businessName}
                fill
                className="object-cover opacity-20 filter blur-[2px]"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 w-full max-w-4xl mx-auto text-center min-w-0">
            {certifications && certifications.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-full">
                {certifications.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] sm:text-xs font-medium text-neutral-300 backdrop-blur-md max-w-full truncate"
                  >
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span className="truncate">{c}</span>
                  </span>
                ))}
              </div>
            )}

            {industry && (
              <p
                className="mb-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase truncate"
                style={{ color: accentColor }}
              >
                {industry}
              </p>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent break-words max-w-full">
              {businessName}
            </h1>

            <p className="mt-4 text-base sm:text-xl font-medium text-neutral-300 max-w-2xl mx-auto break-words">
              {tagline}
            </p>

            <p className="mt-3 max-w-xl mx-auto text-xs sm:text-base text-neutral-400 leading-relaxed break-words">
              {description}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-xs sm:max-w-none mx-auto">
              <a
                href={primaryCtaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shrink-0"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 30px -10px ${accentColor}80`,
                }}
              >
                {primaryCtaLabel}
              </a>
              {secondaryCtaLabel && secondaryCtaUrl && (
                <a
                  href={secondaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-neutral-200 hover:bg-white/10 transition-all backdrop-blur-md shrink-0"
                >
                  {secondaryCtaLabel}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Services Section */}
        {services && services.length > 0 && (
          <section id="services" className="w-full py-16 sm:py-24 border-b border-white/10 px-4 sm:px-6 overflow-hidden">
            <div className="mx-auto w-full max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 min-w-0">
                <span
                  className="text-xs font-bold uppercase tracking-widest block mb-2"
                  style={{ color: accentColor }}
                >
                  SOLUTIONS
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-words">
                  Comprehensive Services
                </h2>
              </div>

              {/* Grid forcing min-w-0 on columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full min-w-0">
                {services.map((s, i) => (
                  <div
                    key={i}
                    className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl transition-all duration-300 w-full min-w-0 overflow-hidden ${
                      s.highlighted
                        ? "border border-white/20 bg-neutral-900 shadow-2xl ring-1 ring-white/20"
                        : "border border-white/10 bg-neutral-900/40 hover:bg-neutral-900 hover:border-white/20"
                    }`}
                  >
                    {s.highlighted && (
                      <span
                        className="absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md z-10 shrink-0"
                        style={{ backgroundColor: accentColor }}
                      >
                        FEATURED
                      </span>
                    )}

                    <div className="min-w-0 w-full">
                      {s.iconName && (
                        <div className="text-2xl sm:text-3xl mb-3">{s.iconName}</div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-white break-words pr-12">
                        {s.title}
                      </h3>
                      {s.price && (
                        <p className="mt-2 text-xl sm:text-2xl font-extrabold text-white break-words">
                          {s.price}
                          {s.priceNote && (
                            <span className="text-xs font-normal text-neutral-400 ml-1">
                              {s.priceNote}
                            </span>
                          )}
                        </p>
                      )}
                      <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed break-words">
                        {s.description}
                      </p>
                    </div>

                    {s.features && s.features.length > 0 && (
                      <ul className="mt-6 space-y-2 border-t border-white/10 pt-6 w-full min-w-0">
                        {s.features.map((f, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-xs font-medium text-neutral-300 min-w-0"
                          >
                            <span className="shrink-0" style={{ color: accentColor }}>✓</span>
                            <span className="break-words min-w-0">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery && gallery.length > 0 && (
          <section className="w-full py-16 sm:py-24 border-b border-white/10 px-4 sm:px-6 overflow-hidden">
            <div className="mx-auto w-full max-w-6xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-6">
                Featured Work
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
                {gallery.slice(0, 8).map((img, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-900 border border-white/10 w-full min-w-0"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || "Gallery image"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
          <section id="reviews" className="w-full py-16 sm:py-24 border-b border-white/10 px-4 sm:px-6 overflow-hidden">
            <div className="mx-auto w-full max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 min-w-0">
                <span
                  className="text-xs font-bold uppercase tracking-widest block mb-2"
                  style={{ color: accentColor }}
                >
                  Reviews
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Client Feedback
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
                {testimonials.slice(0, 4).map((t, i) => (
                  <div
                    key={i}
                    className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-neutral-900/40 flex flex-col justify-between min-w-0 w-full overflow-hidden"
                  >
                    <div className="min-w-0">
                      <StarRating r={t.rating} />
                      <p className="mt-4 text-neutral-300 text-xs sm:text-sm leading-relaxed italic break-words">
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-3 pt-6 border-t border-white/10 min-w-0">
                      {t.avatarUrl ? (
                        <Image
                          src={t.avatarUrl}
                          alt={t.author}
                          width={36}
                          height={36}
                          className="rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                          {t.author ? t.author.charAt(0) : "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">{t.author}</p>
                        {t.platform && (
                          <p className="text-[10px] sm:text-xs text-neutral-500 truncate">{t.platform}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact" className="w-full py-16 sm:py-24 border-b border-white/10 px-4 sm:px-6 overflow-hidden">
          <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 min-w-0">
            <div className="min-w-0">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-2"
                style={{ color: accentColor }}
              >
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-6">
                Connect with Us
              </h2>
              {contacts && contacts.length > 0 && (
                <div className="space-y-3 min-w-0">
                  {contacts.map((c, i) => (
                    <a
                      key={i}
                      href={cHref(c.type, c.value)}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-neutral-900/40 hover:bg-neutral-900 transition-colors min-w-0"
                    >
                      <span className="text-lg shrink-0">{C_EMOJI[c.type] ?? "📋"}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                          {c.label ?? c.type}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-neutral-200 truncate">
                          {c.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {businessHours && businessHours.length > 0 && (
              <div className="min-w-0">
                <span
                  className="text-xs font-bold uppercase tracking-widest block mb-2"
                  style={{ color: accentColor }}
                >
                  Availability
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-6">
                  Hours
                </h2>
                <div className="rounded-xl border border-white/10 bg-neutral-900/40 overflow-hidden divide-y divide-white/5 w-full min-w-0">
                  {businessHours.map((h, i) => (
                    <div key={i} className="flex justify-between px-4 sm:px-6 py-3.5 text-xs sm:text-sm min-w-0">
                      <span className="text-neutral-400 font-medium truncate">
                        {h.day}
                      </span>
                      <span
                        className={`font-semibold shrink-0 ${
                          h.isClosed ? "text-neutral-600" : "text-white"
                        }`}
                      >
                        {h.isClosed ? "Closed" : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 px-4 sm:px-6 py-6 overflow-hidden">
          <div className="mx-auto w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs text-neutral-500 min-w-0">
            <p className="truncate">© {currentYear} {businessName}. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}