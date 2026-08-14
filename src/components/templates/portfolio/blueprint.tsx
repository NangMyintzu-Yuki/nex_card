"use client";

import React from "react";
import {
  ArrowUpRight,
  Mail,
  Phone,
  Globe,
  Quote,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import type { PortfolioData } from "@/lib/validators/template-schemas";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { safeHref } from "@/lib/security/safe-href";

interface PP { data: PortfolioData; accentColor?: string; }

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  return safeHref(value);
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn", github: "GitHub", twitter: "X", instagram: "Instagram",
  facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", whatsapp: "WhatsApp",
  telegram: "Telegram", discord: "Discord", website: "Website",
};

/** Editorial section heading: small-caps kicker + serif title */
function MagazineHeader({ kicker, title, accentColor }: { kicker: string; title: string; accentColor: string }) {
  return (
    <div className="mb-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] mb-3" style={{ color: accentColor }}>
        {kicker}
      </p>
      <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
        {title}
      </h2>
      <div className="mt-5 flex items-center gap-3">
        <div className="h-px w-12" style={{ background: accentColor }} />
        <div className="h-px flex-1 bg-stone-200" />
      </div>
    </div>
  );
}

export function BlueprintPortfolio({ data, accentColor = "#8b5cf6" }: PP) {
  const {
    fullName, headline, bio, avatarUrl, projects, skills, socialLinks,
    contacts, testimonials, resumeUrl, experience, services, gallery,
  } = data;

  return (
    <main className="min-h-screen bg-[#faf9f7] text-stone-900 font-sans selection:bg-violet-200 selection:text-stone-900 relative overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">

        {/* ── MASTHEAD ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-300 pb-5 mb-12">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-[0.25em] text-stone-900">
              <span className="h-2 w-2 rounded-full" style={{ background: accentColor }} />
              PORTFOLIO
            </span>
          </div>
          <div className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            <span>© {new Date().getFullYear()}</span>
            <span>Volume I</span>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-stone-400 mb-6">
            — Featured Profile
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl font-medium leading-[1.02] tracking-tight text-stone-900">
            {fullName}
          </h1>
          <p className="mt-5 text-lg sm:text-2xl font-light italic text-stone-500 leading-snug">
            {headline}
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            {avatarUrl && (
              <div className="lg:col-span-5">
                <figure>
                  <div className="aspect-[4/5] overflow-hidden bg-stone-200">
                    <img src={resolveImageUrl(avatarUrl)} alt={fullName}
                      className="h-full w-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <figcaption className="mt-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                    <span>Portrait</span>
                    <span>Plate 01</span>
                  </figcaption>
                </figure>
              </div>
            )}

            <div className={`${avatarUrl ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>
              <p className="font-serif text-lg leading-relaxed text-stone-700 first-letter:text-5xl first-letter:font-serif first-letter:leading-none first-letter:mr-1 first-letter:float-left first-letter:mt-1 first-letter:font-bold">
                {bio}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {resumeUrl && (
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: accentColor }}>
                    <FileText className="h-3.5 w-3.5" /> Read the Full CV
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                {contacts.map((c, i) => (
                  <a key={i} href={cHref(c.type, c.value)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-xs font-semibold text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-all">
                    {c.type === "email" ? <Mail className="h-3.5 w-3.5" /> :
                     c.type === "phone" ? <Phone className="h-3.5 w-3.5" /> :
                     <Globe className="h-3.5 w-3.5" />}
                    <span>{c.label || c.value}</span>
                  </a>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-stone-200">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
                      <span className="h-1 w-1 rounded-full" style={{ background: accentColor }} />
                      {PLATFORM_LABELS[s.platform] ?? s.label ?? s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── EXPERIENCE ── */}
        {experience && experience.length > 0 && (
          <section className="mb-20">
            <MagazineHeader accentColor={accentColor} kicker="Chapter 01" title="Professional History" />
            <div className="space-y-0">
              {experience.map((e, i) => (
                <div key={i}
                  className="group grid gap-3 sm:grid-cols-12 py-7 border-b border-stone-200 first:pt-0 last:border-b-0">
                  <div className="sm:col-span-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                      {e.startDate}{e.endDate ? ` — ${e.endDate}` : " — Present"}
                    </p>
                  </div>
                  <div className="sm:col-span-9">
                    <h3 className="font-serif text-xl text-stone-900 transition-colors group-hover:opacity-70">
                      {e.role}
                    </h3>
                    <p className="mt-0.5 text-sm font-semibold" style={{ color: accentColor }}>
                      {e.company}
                      {e.location && <span className="font-normal text-stone-400"> · {e.location}</span>}
                    </p>
                    {e.description && (
                      <p className="mt-2 text-sm leading-relaxed text-stone-500 max-w-2xl">{e.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SELECTED WORKS ── */}
        {projects.length > 0 && (
          <section className="mb-20">
            <MagazineHeader accentColor={accentColor} kicker="Chapter 02" title="Selected Works" />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {projects.map((p, i) => (
                <article key={p.id} className="group">
                  {p.coverImageUrl ? (
                    <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                      <img src={resolveImageUrl(p.coverImageUrl)} alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center bg-stone-100">
                      <ImageIcon className="h-8 w-8 text-stone-300" />
                    </div>
                  )}
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-1.5">
                        {p.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-serif text-xl text-stone-900 group-hover:opacity-70 transition-opacity">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="mt-1.5 text-xs leading-relaxed text-stone-500 line-clamp-2">{p.description}</p>
                      )}
                    </div>
                    <span className="font-serif text-2xl font-light text-stone-300 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {(p.liveUrl || p.caseStudyUrl) && (
                    <div className="mt-3 flex items-center gap-5">
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] hover:opacity-70 transition-opacity"
                          style={{ color: accentColor }}>
                          View Project <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {p.caseStudyUrl && (
                        <a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400 hover:text-stone-700 transition-colors">
                          Case Study
                        </a>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── SERVICES ── */}
        {services && services.length > 0 && (
          <section className="mb-20">
            <MagazineHeader accentColor={accentColor} kicker="Chapter 03" title="What I Offer" />
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {services.map((s, i) => (
                <div key={i} className="border-l-2 pl-5" style={{ borderColor: `${accentColor}55` }}>
                  <p className="font-serif text-3xl font-light text-stone-200">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-serif text-lg text-stone-900 mt-1">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{s.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── EXPERTISE ── */}
        {skills.length > 0 && (
          <section className="mb-20">
            <MagazineHeader accentColor={accentColor} kicker="Chapter 04" title="Areas of Expertise" />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {skills.map((g, i) => (
                <div key={i}>
                  <h3 className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: accentColor }}>
                    {g.category}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {g.items.map((item, j) => (
                      <span key={j} className="text-sm text-stone-600 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-stone-300" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── GALLERY ── */}
        {gallery && gallery.length > 0 && (
          <section className="mb-20">
            <MagazineHeader accentColor={accentColor} kicker="Chapter 05" title="Portfolio Plates" />
            <div className="columns-2 sm:columns-3 gap-3 [&>*]:mb-3">
              {gallery.map((img, i) => (
                <div key={i} className="break-inside-avoid overflow-hidden bg-stone-100 group">
                   <img src={resolveImageUrl(img.url)} alt={img.alt ?? `Plate ${i + 1}`}
                    className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PRAISE ── */}
        {testimonials && testimonials.length > 0 && (
          <section className="mb-20">
            <MagazineHeader accentColor={accentColor} kicker="Chapter 06" title="In Their Words" />
            <div className="space-y-10">
              {testimonials.slice(0, 3).map((t, i) => (
                <figure key={i} className="border-l-2 pl-6 sm:pl-10" style={{ borderColor: accentColor }}>
                  <Quote className="h-6 w-6 mb-3" style={{ color: `${accentColor}55` }} />
                  <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed text-stone-800">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    {t.avatarUrl ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stone-300 shrink-0">
                         <img src={resolveImageUrl(t.avatarUrl)} alt={t.author} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: accentColor }}>
                        {t.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-stone-900">{t.author}</p>
                      <p className="text-xs text-stone-400">
                        {t.role}{t.company && ` · ${t.company}`}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ── COLOPHON ── */}
        <footer className="border-t border-stone-300 pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif text-2xl text-stone-900">{fullName}</p>
              <p className="mt-1 text-xs text-stone-500">{headline}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
                    {PLATFORM_LABELS[s.platform] ?? s.label ?? s.platform}
                  </a>
                ))}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                Portfolio · {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
