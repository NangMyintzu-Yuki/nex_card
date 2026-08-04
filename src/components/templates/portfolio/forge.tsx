"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  Code2,
  Mail,
  Phone,
  Globe,
  Layers,
  FileText,
  Sparkles
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
  available: { dot: "bg-emerald-500 animate-ping", text: "Available for Hire" },
  limited: { dot: "bg-amber-500", text: "Limited Availability" },
  unavailable: { dot: "bg-rose-500", text: "Currently Booked" },
};

export function ForgePortfolio({ data, accentColor = "#10b981" }: PP) {
  const {
    fullName,
    headline,
    bio,
    avatarUrl,
    projects,
    skills,
    experience,
    socialLinks,
    contacts,
    availability,
    resumeUrl,
    testimonials
  } = data;

  const avail = availability ? AVAIL_MAP[availability] : null;
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const allTags = ["All", ...Array.from(new Set(projects.flatMap((p) => p.tags)))];
  const filteredProjects = selectedTag === "All"
    ? projects
    : projects.filter((p) => p.tags.includes(selectedTag));

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-emerald-500 selection:text-neutral-950 p-4 sm:p-6 lg:p-8">
      
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* TOP HERO BENTO GRID */}
        <div className="grid gap-4 md:grid-cols-12">
          
          {/* Main Bio Card (8 cols) */}
          <div className="md:col-span-8 rounded-3xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group">
            
            {/* Background Glow */}
            <div 
              className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[100px] opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none"
              style={{ background: accentColor }}
            />

            <div>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                {avail && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-300">
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${avail.dot}`} />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span>{avail.text}</span>
                  </div>
                )}

                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Resume</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {fullName}
              </h1>
              <p className="mt-2 text-base sm:text-lg font-semibold" style={{ color: accentColor }}>
                {headline}
              </p>
              <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl">
                {bio}
              </p>
            </div>

            {/* Quick Contact Links */}
            <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t border-white/5">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-white/20 hover:text-white transition-all"
                >
                  {c.type === "email" && <Mail className="h-3.5 w-3.5" />}
                  {c.type === "phone" && <Phone className="h-3.5 w-3.5" />}
                  {c.type !== "email" && c.type !== "phone" && <Globe className="h-3.5 w-3.5" />}
                  <span>{c.label || c.value}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Profile Picture & Social Bento (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {avatarUrl && (
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 group">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            )}

            {/* Social Grid Card */}
            {socialLinks.length > 0 && (
              <div className="flex-1 rounded-3xl border border-white/10 bg-neutral-950/60 p-5 backdrop-blur-xl flex flex-wrap gap-2 items-center justify-start">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-all flex-1 min-w-[110px] justify-center"
                  >
                    <span>{s.label || s.platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* PROJECTS BENTO SECTION */}
        {projects.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5" style={{ color: accentColor }} />
                <h2 className="text-xl font-extrabold text-white">Featured Projects</h2>
              </div>

              {/* Tag Filters */}
              <div className="flex flex-wrap gap-1.5 bg-neutral-900 p-1 rounded-xl border border-white/5">
                {allTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      selectedTag === tag
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50 p-5 hover:border-white/20 hover:bg-neutral-900 transition-all duration-300"
                >
                  {p.coverImageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950 mb-4">
                      <img
                        src={p.coverImageUrl}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                        {p.title}
                      </h3>
                      {p.featured && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: `${accentColor}20`, color: accentColor }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {p.tags.map((t, i) => (
                        <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-neutral-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
                    {p.liveUrl ? (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold flex items-center gap-1 hover:underline"
                        style={{ color: accentColor }}
                      >
                        Live Demo <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : <span />}

                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-white transition-colors"
                      >
                        Code / Details
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS & EXPERIENCE BENTO GRID */}
        <div className="grid gap-4 md:grid-cols-12">
          
          {/* Skills (6 cols) */}
          {skills.length > 0 && (
            <div className="md:col-span-6 rounded-3xl border border-white/10 bg-neutral-950/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-5 w-5" style={{ color: accentColor }} />
                <h2 className="text-lg font-bold text-white">Skills & Tech Stack</h2>
              </div>

              <div className="space-y-3">
                {skills.map((g, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                      {g.category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((item, j) => (
                        <span key={j} className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-xs text-neutral-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Timeline (6 cols) */}
          {experience.length > 0 && (
            <div className="md:col-span-6 rounded-3xl border border-white/10 bg-neutral-950/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5" style={{ color: accentColor }} />
                <h2 className="text-lg font-bold text-white">Work Experience</h2>
              </div>

              <div className="space-y-3">
                {experience.map((e, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">{e.role}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {e.startDate.slice(0, 7)} – {e.endDate ? e.endDate.slice(0, 7) : "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: accentColor }}>
                      @{e.company}
                    </p>
                    {e.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed pt-1">
                        {e.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* TESTIMONIALS SECTION */}
        {testimonials && testimonials.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 backdrop-blur-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Recommendations</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5 flex flex-col justify-between">
                  <p className="text-xs text-neutral-300 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-3">
                    {t.avatarUrl && (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                        <img src={t.avatarUrl} alt={t.author} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[10px] text-neutral-500">{t.role}{t.company && ` · ${t.company}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
          <span className="font-mono tracking-widest text-[10px]">NEX CARD FORGE</span>
        </footer>

      </div>
    </main>
  );
}
