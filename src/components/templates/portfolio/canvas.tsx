"use client";

import React, { useState } from "react";
import Image from "next/image";
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

const AVAIL_MAP: Record<string, { dot: string; text: string; glow: string }> = {
  available: { dot: "bg-emerald-400", text: "Open to opportunities", glow: "shadow-emerald-500/50" },
  limited: { dot: "bg-amber-400", text: "Limited availability", glow: "shadow-amber-500/50" },
  unavailable: { dot: "bg-rose-500", text: "Not available", glow: "shadow-rose-500/50" },
};

const SP_EMOJI: Record<string, string> = {
  linkedin: "💼", twitter: "𝕏", instagram: "📸", facebook: "👥",
  youtube: "▶️", tiktok: "🎵", whatsapp: "💬", telegram: "✈️",
  viber: "📲", discord: "🎮", website: "🌐", behance: "🎨",
  dribbble: "🏀", medium: "📝"
};

export function CanvasPortfolio({ data, accentColor = "#6366f1" }: PP) {
  const {
    fullName, headline, bio, avatarUrl, projects, skills,
    experience, socialLinks, contacts, testimonials, availability,
    resumeUrl, gallery
  } = data;

  const avail = availability ? AVAIL_MAP[availability] : null;
  const [activeTab, setActiveTab] = useState<"all" | "featured">("all");
  const filteredProjects = activeTab === "featured" ? projects.filter(p => p.featured) : projects;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-indigo-500 selection:text-white font-sans antialiased relative overflow-hidden">
      
      {/* Background Glow Effect Animation */}
      <div 
        className="fixed -top-40 -left-40 h-96 w-96 rounded-full blur-[128px] opacity-20 pointer-events-none transition-all duration-1000"
        style={{ background: accentColor }}
      />
      <div 
        className="fixed top-1/2 -right-40 h-96 w-96 rounded-full blur-[128px] opacity-15 pointer-events-none transition-all duration-1000"
        style={{ background: accentColor }}
      />

      {/* Floating Glass Navigation Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-neutral-900/60 p-2 pl-4 backdrop-blur-md shadow-2xl transition-all">
          <a href="#" className="flex items-center gap-3 group">
            {avatarUrl && (
              <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/10 group-hover:scale-105 transition-transform duration-300">
                <Image src={avatarUrl} alt={fullName} fill className="object-cover" sizes="36px" />
              </div>
            )}
            <span className="font-bold text-sm tracking-tight text-neutral-200 group-hover:text-white transition-colors">
              {fullName}
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {["Work", "Skills", "Experience", "Gallery", "Contact"].map((i) => (
              <a
                key={i}
                href={`#${i.toLowerCase()}`}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                {i}
              </a>
            ))}
          </nav>

          <div className="flex gap-2">
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                style={{ background: accentColor }}
              >
                Resume ↓
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
          
          {/* Avatar Profile Frame */}
          {avatarUrl && (
            <div className="relative group shrink-0">
              <div 
                className="absolute -inset-1 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
                style={{ background: accentColor }}
              />
              <div className="relative h-36 w-36 md:h-44 md:w-44 overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl">
                <Image src={avatarUrl} alt={fullName} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" sizes="176px" priority />
              </div>
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            {avail && (
              <div 
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md animate-pulse"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${avail.dot} shadow-lg ${avail.glow}`} />
                <span className="text-neutral-300">{avail.text}</span>
              </div>
            )}

            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
              {fullName}
            </h1>
            <p className="mt-3 text-lg font-semibold md:text-2xl" style={{ color: accentColor }}>
              {headline}
            </p>
            <p className="mt-4 max-w-2xl text-neutral-400 leading-relaxed text-sm md:text-base">
              {bio}
            </p>

            {/* Quick Contact & Social Pills */}
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2.5">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>{SP_EMOJI[c.type] ?? "✉️"}</span>
                  <span>{c.label ?? c.value}</span>
                </a>
              ))}
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>{SP_EMOJI[s.platform] ?? "🔗"}</span>
                  <span>{s.label ?? s.platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      {projects.length > 0 && (
        <section id="work" className="px-6 py-16 border-t border-white/5 bg-neutral-900/30">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Selected Projects</h2>
                <p className="text-xs text-neutral-400 mt-1">Check out some of my recent work</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-xl bg-neutral-900 p-1 border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "all" ? "bg-white/10 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setActiveTab("featured")}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "featured" ? "bg-white/10 text-white shadow" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Featured ({projects.filter(p => p.featured).length})
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  {p.coverImageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                      <Image
                        src={p.coverImageUrl}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-white/5 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-neutral-300 bg-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold hover:underline flex items-center gap-1"
                          style={{ color: accentColor }}
                        >
                          Live Demo ↗
                        </a>
                      )}
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          Source Code
                        </a>
                      )}
                      {p.caseStudyUrl && (
                        <a
                          href={p.caseStudyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-400 hover:text-white transition-colors ml-auto"
                        >
                          Case Study
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills & Expertise */}
      {skills.length > 0 && (
        <section id="skills" className="px-6 py-16 border-t border-white/5">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-extrabold text-white tracking-tight">Skills & Expertise</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {skills.map((g, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                >
                  <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest" style={{ color: accentColor }}>
                    {g.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((item, j) => (
                      <span
                        key={j}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {experience.length > 0 && (
        <section id="experience" className="px-6 py-16 border-t border-white/5 bg-neutral-900/30">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-3xl font-extrabold text-white tracking-tight">Experience</h2>
            <div className="relative border-l border-white/10 ml-4 space-y-8 pl-6 md:pl-8">
              {experience.map((e, i) => (
                <div key={i} className="relative group">
                  {/* Timeline Dot */}
                  <span 
                    className="absolute -left-[31px] md:-left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-neutral-950 transition-transform duration-300 group-hover:scale-125"
                    style={{ background: accentColor }}
                  />

                  <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {e.logoUrl && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white">
                            <Image src={e.logoUrl} alt={e.company} fill className="object-contain p-1.5" sizes="40px" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-bold text-white">{e.role}</h3>
                          <p className="text-xs text-neutral-400">@ {e.company}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 self-start sm:self-auto">
                        {e.startDate.slice(0, 7)} – {e.endDate ? e.endDate.slice(0, 7) : "Present"}
                      </span>
                    </div>
                    {e.description && (
                      <p className="mt-4 text-xs md:text-sm text-neutral-400 leading-relaxed">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery && gallery.length > 0 && (
        <section id="gallery" className="px-6 py-16 border-t border-white/5">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-extrabold text-white tracking-tight">Gallery</h2>
            <div className="columns-2 gap-4 sm:columns-3 md:columns-4 space-y-4">
              {gallery.map((img, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                  <div className="relative aspect-square">
                    <Image
                      src={img.url}
                      alt={img.alt || "Gallery image"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="px-6 py-16 border-t border-white/5 bg-neutral-900/30">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-extrabold text-white tracking-tight">Testimonials</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900 p-6 backdrop-blur-sm">
                  <div>
                    <div className="mb-3 flex text-amber-400 gap-1 text-xs">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j}>★</span>
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-neutral-300 italic leading-relaxed">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                    {t.avatarUrl && (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/10">
                        <Image src={t.avatarUrl} alt={t.author} fill className="object-cover" sizes="36px" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[10px] text-neutral-400">
                        {t.role}{t.company && ` · ${t.company}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modern Animated Footer */}
      <footer id="contact" className="border-t border-white/10 px-6 py-16 bg-neutral-950 relative">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Let&apos;s build something together.</h2>
            <p className="mt-2 text-xs text-neutral-400">Feel free to reach out for collaborations or just a friendly chat.</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="text-xs font-semibold hover:underline transition-all"
                  style={{ color: accentColor }}
                >
                  {c.value}
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300"
              >
                {SP_EMOJI[s.platform]} {s.label ?? s.platform}
              </a>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-12 border-t border-white/5 pt-6 flex justify-between items-center text-[10px] text-neutral-500">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
          <p className="tracking-widest font-mono">NEX CARD</p>
        </div>
      </footer>
    </main>
  );
}