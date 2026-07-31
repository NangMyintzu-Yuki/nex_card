"use client";

import React from "react";
import {
  ArrowUpRight,
  Mail,
  Phone,
  Globe,
  Quote,
  Briefcase,
  Calendar,
  MapPin,
  Image,
  Package,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { PortfolioData } from "@/lib/validators/template-schemas";

interface PP { data: PortfolioData; accentColor?: string; }

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  return value.startsWith("http") ? value : `https://${value}`;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn", github: "GitHub", twitter: "X", instagram: "Instagram",
  facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", whatsapp: "WhatsApp",
  telegram: "Telegram", discord: "Discord", website: "Website",
};

export function BlueprintPortfolio({ data, accentColor = "#8b5cf6" }: PP) {
  const {
    fullName, headline, bio, avatarUrl, projects, skills, socialLinks,
    contacts, testimonials, resumeUrl, experience, services, gallery, availabilityNote,
  } = data;

  return (
    <main className="min-h-screen bg-[#06080f] text-white font-sans selection:bg-violet-500/30 selection:text-white relative overflow-x-hidden">
      {/* Blueprint grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16 space-y-14">

        {/* ── HERO ── */}
        <section className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            {avatarUrl && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-violet-500/30 mb-2">
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.08]">
                {fullName}
              </h1>
              <p className="mt-2 text-base sm:text-lg font-semibold" style={{ color: accentColor }}>
                {headline}
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              {bio}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: accentColor, color: '#06080f' }}>
                  <FileText className="h-3.5 w-3.5" /> Resume <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {contacts.map((c, i) => (
                <a key={i} href={cHref(c.type, c.value)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition-all">
                  {c.type === "email" ? <Mail className="h-3.5 w-3.5" /> :
                   c.type === "phone" ? <Phone className="h-3.5 w-3.5" /> :
                   <Globe className="h-3.5 w-3.5" />}
                  <span>{c.label || c.value}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            {socialLinks.length > 0 && (
              <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">Connect</p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-white hover:border-slate-700 transition-all">
                      {PLATFORM_LABELS[s.platform] ?? s.label ?? s.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── EXPERIENCE ── */}
        {experience && experience.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-700">
                <Briefcase className="h-3 w-3" style={{ color: accentColor }} /> Experience
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            </div>
            <div className="space-y-5">
              {experience.map((e, i) => (
                <div key={i}
                  className="rounded-xl border border-slate-800/40 bg-slate-900/20 p-5 hover:border-slate-700/40 transition-all">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <h3 className="font-bold text-white text-sm">{e.role}</h3>
                    <span className="text-sm text-slate-600">@ {e.company}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.startDate}{e.endDate ? ` — ${e.endDate}` : " — Present"}</span>
                    {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>}
                  </div>
                  {e.description && <p className="text-xs text-slate-500 leading-relaxed">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-700">
                <Package className="h-3 w-3" style={{ color: accentColor }} /> Projects
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id}
                  className="group rounded-xl border border-slate-800/40 bg-slate-900/20 overflow-hidden hover:border-slate-700/40 transition-all">
                  {p.coverImageUrl ? (
                    <div className="relative aspect-video overflow-hidden bg-slate-900">
                      <img src={p.coverImageUrl} alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-slate-900/60">
                      <Image className="h-7 w-7 text-slate-800" />
                    </div>
                  )}
                  <div className="p-4 space-y-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t, idx) => (
                        <span key={idx} className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-sm text-white">{p.title}</h3>
                    {p.description && <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{p.description}</p>}
                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity"
                          style={{ color: accentColor }}>
                          Live <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {p.caseStudyUrl && (
                        <a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer"
                          className="text-slate-700 hover:text-slate-400 transition-colors">Case Study ↗</a>
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
            <div className="flex items-center gap-4 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-700">
                <Package className="h-3 w-3" style={{ color: accentColor }} /> Services
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <div key={i}
                  className="rounded-xl border border-slate-800/30 bg-slate-900/10 p-5 hover:border-slate-700/30 transition-all">
                  <h3 className="font-bold text-sm text-white mb-1.5">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SKILLS ── */}
        {skills.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-700">
                <Image className="h-3 w-3" style={{ color: accentColor }} /> Skills
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((g, i) => (
                <div key={i} className="rounded-xl border border-slate-800/30 bg-slate-900/10 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${accentColor}99` }}>
                    {g.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((item, j) => (
                      <span key={j}
                        className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-500">
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
            <div className="flex items-center gap-4 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-700">
                <Image className="h-3 w-3" style={{ color: accentColor }} /> Gallery
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            </div>
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-900 border border-slate-800/30">
                  <img src={img.url} alt={img.alt ?? `Gallery ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ── */}
        {testimonials && testimonials.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-700">
                <Quote className="h-3 w-3" style={{ color: accentColor }} /> Testimonials
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-800/30 bg-slate-900/10 p-5 flex flex-col justify-between">
                  <p className="text-sm text-slate-400 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 pt-3 border-t border-slate-800/40">
                    {t.avatarUrl ? (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-700 shrink-0">
                        <img src={t.avatarUrl} alt={t.author} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                        {t.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{t.author}</p>
                      <p className="text-[10px] text-slate-700 truncate">
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
        <footer className="border-t border-slate-800/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-semibold text-slate-700 hover:text-slate-300 transition-colors">
                {PLATFORM_LABELS[s.platform] ?? s.label ?? s.platform}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-800">
            <span>© {new Date().getFullYear()} {fullName}</span>
            <span className="font-mono tracking-widest">BLUEPRINT</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
