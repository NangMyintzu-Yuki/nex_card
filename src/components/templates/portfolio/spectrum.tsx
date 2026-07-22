"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ArrowUpRight, 
  Sparkles, 
  Mail, 
  Phone, 
  Globe, 
  Terminal, 
  Compass, 
  Quote, 
  FileText,
  MessageSquare
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
  available: { dot: "bg-emerald-400 animate-pulse", text: "Open to opportunities" },
  limited: { dot: "bg-amber-400", text: "Limited availability" },
  unavailable: { dot: "bg-rose-500", text: "Not available" },
};

const SP_EMOJI: Record<string, string> = {
  linkedin: "💼", twitter: "𝕏", instagram: "📸", facebook: "👥",
  youtube: "▶️", tiktok: "🎵", whatsapp: "💬", telegram: "✈️",
  viber: "📲", discord: "🎮", website: "🌐", behance: "🎨",
  dribbble: "🏀", medium: "📝"
};

export function SpectrumPortfolio({ data, accentColor = "#f59e0b" }: PP) {
  const {
    fullName,
    headline,
    bio,
    avatarUrl,
    projects,
    skills,
    socialLinks,
    contacts,
    testimonials,
    resumeUrl,
    availability
  } = data;

  const avail = availability ? AVAIL_MAP[availability] : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div 
        className="fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[180px] opacity-20 pointer-events-none"
        style={{ background: accentColor }}
      />
      <div 
        className="fixed top-1/2 right-0 h-[600px] w-[600px] rounded-full blur-[200px] opacity-15 pointer-events-none"
        style={{ background: accentColor }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
        
        {/* HERO SECTION */}
        <section className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10 md:p-12 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-3">
                {avail && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md">
                    <span className={`h-2 w-2 rounded-full ${avail.dot}`} />
                    <span>{avail.text}</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <span>Creative Portfolio</span>
                </div>
              </div>

              {/* Name & Headline */}
              <div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  {fullName}
                </h1>
                <p className="mt-3 text-lg sm:text-2xl font-extrabold tracking-tight" style={{ color: accentColor }}>
                  {headline}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                {bio}
              </p>

              {/* Action Contact & Resume Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl px-5 py-3 text-xs font-bold text-slate-950 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                    style={{ background: accentColor }}
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Resume</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}

                {contacts.map((c, i) => (
                  <a
                    key={i}
                    href={cHref(c.type, c.value)}
                    className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all duration-300"
                  >
                    {c.type === "email" && <Mail className="h-3.5 w-3.5 text-amber-400" />}
                    {c.type === "phone" && <Phone className="h-3.5 w-3.5 text-emerald-400" />}
                    {c.type !== "email" && c.type !== "phone" && <Globe className="h-3.5 w-3.5 text-sky-400" />}
                    <span>{c.label || c.value}</span>
                  </a>
                ))}
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/60">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span>{SP_EMOJI[s.platform] || "🔗"}</span>
                      <span>{s.label || s.platform}</span>
                    </a>
                  ))}
                </div>
              )}

            </div>

            {/* Avatar Frame */}
            {avatarUrl && (
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative aspect-square w-full max-w-[280px] lg:max-w-none overflow-hidden rounded-3xl border-2 border-slate-700/50 bg-slate-950 p-2 shadow-2xl group">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="350px"
                      priority
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* WORK / PROJECTS GALLERY */}
        {projects.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5" style={{ color: accentColor }} />
                <h2 className="text-2xl font-black text-white tracking-tight">Featured Works</h2>
              </div>
              <span className="text-xs font-mono text-slate-500">{projects.length} Showcase Items</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <div
                  key={p.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 ${
                    i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <div>
                    {p.coverImageUrl && (
                      <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 mb-4 ${
                        i === 0 ? "aspect-[21/9]" : "aspect-video"
                      }`}>
                        <Image
                          src={p.coverImageUrl}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map((t, idx) => (
                          <span key={idx} className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {p.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                    {p.liveUrl ? (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold flex items-center gap-1 hover:underline"
                        style={{ color: accentColor }}
                      >
                        <span>Visit Website</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : <span />}

                    {p.caseStudyUrl && (
                      <a
                        href={p.caseStudyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        Case Study ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERTISE / SKILLS */}
        {skills.length > 0 && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
              <Terminal className="h-5 w-5" style={{ color: accentColor }} />
              <h2 className="text-xl font-extrabold text-white">Capabilities & Skillset</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((g, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 space-y-3"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
                    <span>{g.category}</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((item, j) => (
                      <span
                        key={j}
                        className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {testimonials && testimonials.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
              <Quote className="h-5 w-5" style={{ color: accentColor }} />
              <h2 className="text-xl font-extrabold text-white">Endorsements & Feedback</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col justify-between space-y-4"
                >
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4">
                    {t.avatarUrl ? (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-700">
                        <Image src={t.avatarUrl} alt={t.author} fill className="object-cover" sizes="36px" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                        {t.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[10px] text-slate-500">
                        {t.role}{t.company && ` · ${t.company}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="rounded-3xl border border-slate-800/80 bg-slate-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>SPECTRUM DIGITAL CARD</span>
          </div>
        </footer>

      </div>
    </main>
  );
}