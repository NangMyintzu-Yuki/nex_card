"use client";

import React from "react";
import {
  ArrowUpRight,
  Sparkles,
  Mail,
  Phone,
  Globe,
  Quote,
  FileText,
  Briefcase,
  Calendar,
  MapPin,
  Image,
  Package,
} from "lucide-react";
import type { PortfolioData } from "@/lib/validators/template-schemas";

interface PP {
  data: PortfolioData;
  accentColor?: string;
}

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  return value.startsWith("http") ? value : `https://${value}`;
}

const AVAIL_MAP: Record<string, { dot: string; text: string }> = {
  available: { dot: "bg-emerald-400", text: "Open to opportunities" },
  limited: { dot: "bg-amber-400", text: "Limited availability" },
  unavailable: { dot: "bg-rose-500", text: "Not available" },
};

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: "in", github: "gh", twitter: "𝕏", instagram: "ig", facebook: "fb",
  youtube: "yt", tiktok: "tk", whatsapp: "wa", telegram: "tg", discord: "dc", website: "web",
};

export function SpectrumPortfolio({ data, accentColor = "#f59e0b" }: PP) {
  const {
    fullName, headline, bio, avatarUrl, projects, skills, socialLinks,
    contacts, testimonials, resumeUrl, availability, experience,
    services, gallery, availabilityNote,
  } = data;

  const avail = availability ? AVAIL_MAP[availability] : null;

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-amber-400/30 selection:text-white relative overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full blur-[200px] opacity-15"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }} />
        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full blur-[200px] opacity-10"
          style={{ background: `radial-gradient(circle, ${accentColor}88, transparent)` }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full blur-[250px] opacity-5"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-16">

        {/* ── HERO ── */}
        <section className="relative">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {avail && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-sm">
                    <span className={`h-2 w-2 rounded-full ${avail.dot} animate-pulse`} />
                    <span>{avail.text}</span>
                    {availabilityNote && <span className="text-zinc-600">· {availabilityNote}</span>}
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-bold text-zinc-400 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <span>Available for work</span>
                </div>
              </div>

              <div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  {fullName}
                </h1>
                <p className="mt-3 text-lg sm:text-2xl font-bold tracking-tight"
                  style={{ color: accentColor }}>
                  {headline}
                </p>
              </div>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                {bio}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {resumeUrl && (
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-[#0a0a0b] shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{ background: accentColor }}>
                    <FileText className="h-4 w-4" />
                    <span>Resume</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                {contacts.map((c, i) => (
                  <a key={i} href={cHref(c.type, c.value)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs font-semibold text-zinc-400 hover:border-zinc-700 hover:text-white transition-all duration-300 backdrop-blur-sm">
                    {c.type === "email" ? <Mail className="h-3.5 w-3.5" style={{ color: accentColor }} /> :
                     c.type === "phone" ? <Phone className="h-3.5 w-3.5 text-emerald-400" /> :
                     <Globe className="h-3.5 w-3.5 text-sky-400" />}
                    <span>{c.label || c.value}</span>
                  </a>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800/60">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
                      <span className="font-mono">{PLATFORM_ICONS[s.platform] ?? "↗"}</span>
                      <span>{s.label || s.platform}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {avatarUrl && (
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-[32px] opacity-50 blur-xl transition-all duration-500 group-hover:opacity-80"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #a855f7, ${accentColor})` }} />
                  <div className="relative w-64 sm:w-72 aspect-square overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900 shadow-2xl">
                    <img src={avatarUrl} alt={fullName}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── EXPERIENCE ── */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Briefcase className="h-3.5 w-3.5" style={{ color: accentColor }} /> Experience
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
            <div className="relative space-y-6">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-zinc-800 via-zinc-800/50 to-transparent" />
              {experience.map((e, i) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-[13px] top-1.5 h-3 w-3 rounded-full border-2 bg-[#0a0a0b]"
                    style={{ borderColor: accentColor }} />
                  <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-sm hover:border-zinc-700/60 transition-all">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <h3 className="font-bold text-white text-sm">{e.role}</h3>
                      <span className="text-sm text-zinc-500">@ {e.company}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-600 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.startDate}{e.endDate ? ` — ${e.endDate}` : " — Present"}</span>
                      {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>}
                    </div>
                    {e.description && <p className="text-xs text-zinc-400 leading-relaxed">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Package className="h-3.5 w-3.5" style={{ color: accentColor }} /> Projects
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id}
                  className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden backdrop-blur-sm hover:border-zinc-700/60 transition-all duration-300">
                  {p.coverImageUrl ? (
                    <div className="relative aspect-video overflow-hidden bg-zinc-800/50">
                      <img src={p.coverImageUrl} alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-zinc-900/80">
                      <Image className="h-8 w-8 text-zinc-700" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((t, idx) => (
                        <span key={idx} className="rounded-md border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-white text-sm group-hover:opacity-80 transition-opacity">{p.title}</h3>
                    {p.description && <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{p.description}</p>}
                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold transition-colors hover:opacity-70"
                          style={{ color: accentColor }}>
                          Live <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {p.caseStudyUrl && (
                        <a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-zinc-300 transition-colors">
                          Case Study ↗
                        </a>
                      )}
                      {p.repoUrl && (
                        <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-zinc-300 transition-colors">
                          Source ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SERVICES ── */}
        {services && services.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Package className="h-3.5 w-3.5" style={{ color: accentColor }} /> Services
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <div key={i}
                  className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 backdrop-blur-sm hover:border-zinc-700/60 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: `${accentColor}15`, color: accentColor }}>
                      {s.iconName?.[0] ?? "✦"}
                    </div>
                    <h3 className="font-bold text-white text-sm">{s.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SKILLS ── */}
        {skills.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} /> Skills
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((g, i) => (
                <div key={i} className="rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
                    {g.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((item, j) => (
                      <span key={j}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all">
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
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Image className="h-3.5 w-3.5" style={{ color: accentColor }} /> Gallery
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/50">
                  <img src={img.url} alt={img.alt ?? `Gallery ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ── */}
        {testimonials && testimonials.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Quote className="h-3.5 w-3.5" style={{ color: accentColor }} /> Testimonials
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <div key={i}
                  className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 backdrop-blur-sm flex flex-col justify-between space-y-4">
                  <p className="text-sm text-zinc-400 italic leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60">
                    {t.avatarUrl ? (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-zinc-700 shrink-0">
                        <img src={t.avatarUrl} alt={t.author} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {t.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{t.author}</p>
                      <p className="text-[10px] text-zinc-600 truncate">
                        {t.role}{t.company && ` · ${t.company}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="border-t border-zinc-800/50 pt-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-700">© {new Date().getFullYear()} {fullName}</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-300 transition-colors">
                  {s.label || s.platform}
                </a>
              ))}
            </div>
            <p className="text-[10px] font-mono tracking-widest text-zinc-800">SPECTRUM</p>
          </div>
        </footer>

      </div>
    </main>
  );
}
