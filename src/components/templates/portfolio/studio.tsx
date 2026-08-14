"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  X,
  Star,
  Award,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Send,
  Music,
  MessageCircle,
} from "lucide-react";
import type { PortfolioData } from "@/lib/validators/template-schemas";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { safeHref } from "@/lib/security/safe-href";

interface PP {
  data: PortfolioData;
  accentColor?: string;
}

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g, "")}`;
  return safeHref(value);
}

const AVAIL_MAP: Record<string, { dot: string; text: string }> = {
  available: { dot: "bg-emerald-400 animate-pulse", text: "Taking New Orders / Clients" },
  limited: { dot: "bg-amber-400", text: "Limited Slots Available" },
  unavailable: { dot: "bg-rose-500", text: "Currently Booked Out" },
};

export function StudioPortfolio({ data, accentColor = "#ec4899" }: PP) {
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
    testimonials,
    resumeUrl,
    availability,
  } = data;

  const avail = availability ? AVAIL_MAP[availability] : null;

  const [selectedItem, setSelectedItem] = useState<typeof projects[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(projects.flatMap((p) => p.tags)))];

  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.tags.includes(selectedCategory));

  function SocialIcon({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) {
    const icons: Record<string, React.ReactNode> = {
      linkedin: <Linkedin className={className} />,
      github: <Github className={className} />,
      twitter: <Twitter className={className} />,
      instagram: <Instagram className={className} />,
      youtube: <Youtube className={className} />,
      facebook: <Facebook className={className} />,
      website: <Globe className={className} />,
      whatsapp: <Phone className={className} />,
      telegram: <Send className={className} />,
      tiktok: <Music className={className} />,
      discord: <MessageCircle className={className} />,
    };
    return <>{icons[platform] ?? <Globe className={className} />}</>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-500 selection:text-white relative">
      
      {/* Background Animated Gradient Blobs */}
      <div 
        className="fixed -top-32 -left-32 h-96 w-96 rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ background: accentColor }}
      />
      <div 
        className="fixed bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ background: accentColor }}
      />

      {/* Sticky Business Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-md">
                 <img src={resolveImageUrl(avatarUrl)} alt={fullName} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="max-w-[40vw] truncate font-extrabold text-sm tracking-wide text-white leading-tight sm:max-w-none">{fullName}</h1>
              <p className="text-[10px] text-zinc-400 font-medium">Official Business Showcase</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {avail && (
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300">
                <span className={`h-2 w-2 rounded-full ${avail.dot}`} />
                <span>{avail.text}</span>
              </div>
            )}

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                style={{ background: accentColor }}
              >
                <span>Catalog / Info</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-28 border-b border-zinc-800/60">
        <div className="mx-auto max-w-6xl grid md:grid-cols-12 gap-10 items-center">
          
          <div className="md:col-span-7 space-y-6">
            {avail && (
              <div className="sm:hidden inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
                <span className={`h-2 w-2 rounded-full ${avail.dot}`} />
                <span>{avail.text}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
              <span>Premium Products & Services</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {headline || fullName}
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
              {bio}
            </p>

            {/* Quick Action Contact Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  {c.type === "email" && <Mail className="h-3.5 w-3.5 text-rose-400" />}
                  {c.type === "phone" && <Phone className="h-3.5 w-3.5 text-emerald-400" />}
                  {c.type !== "email" && c.type !== "phone" && <Globe className="h-3.5 w-3.5 text-sky-400" />}
                  <span>{c.label || c.value}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Featured Hero Banner Card */}
          <div className="md:col-span-5">
            {projects[0]?.coverImageUrl ? (
              <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                   <img
                     src={resolveImageUrl(projects[0].coverImageUrl)}
                     alt={projects[0].title}
                     className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white">
                    Featured Highlight
                  </span>
                  <h3 className="text-xl font-bold text-white">{projects[0].title}</h3>
                  <p className="text-xs text-zinc-300 line-clamp-2">{projects[0].description}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-4">
                <ShoppingBag className="h-12 w-12 mx-auto text-zinc-600" />
                <h3 className="text-lg font-bold text-white">Welcome to Our Store</h3>
                <p className="text-xs text-zinc-400">Explore our curated collection of services & products below.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Products / Services Showcase */}
      {projects.length > 0 && (
        <section id="products" className="px-4 py-20 sm:px-6 bg-zinc-950">
          <div className="mx-auto max-w-6xl space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" style={{ color: accentColor }} />
                  <span>Our Collection & Services</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Click on any item to view details & ordering options</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                      selectedCategory === cat
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedItem(p)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between"
                >
                  <div>
                    {p.coverImageUrl && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                        <img
                          src={resolveImageUrl(p.coverImageUrl)}
                          alt={p.title}
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/80 p-2 rounded-full backdrop-blur-sm text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-800/50 mt-4">
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                      View Details
                    </span>
                    <span
                      className="text-xs font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      style={{ color: accentColor }}
                    >
                      Order / Demo ↗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Business Features / Skills Section */}
      {skills.length > 0 && (
        <section className="px-4 py-16 sm:px-6 border-t border-zinc-800/60 bg-zinc-900/30">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Why Choose Us</h2>
              <p className="text-xs text-zinc-400 mt-2">Core capabilities, service guarantees & technical expertise</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((g, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-4 w-4" style={{ color: accentColor }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      {g.category}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((item, j) => (
                      <span
                        key={j}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
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

      {/* Track Record / Experience */}
      {experience.length > 0 && (
        <section className="px-4 py-16 sm:px-6 border-t border-zinc-800/60">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-400" />
              <span>Business Milestones & Track Record</span>
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {experience.map((e, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{e.role}</h3>
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-md">
                        {e.startDate.slice(0, 7)} – {e.endDate ? e.endDate.slice(0, 7) : "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: accentColor }}>
                      @{e.company}
                    </p>
                    {e.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-2">
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

      {/* Customer Reviews / Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="px-4 py-20 sm:px-6 border-t border-zinc-800/60 bg-zinc-900/40">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Customer Reviews</h2>
              <p className="text-xs text-zinc-400 mt-1">What our clients and buyers have to say</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between space-y-4"
                >
                  <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
                    {t.avatarUrl ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                          <img src={resolveImageUrl(t.avatarUrl)} alt={t.author} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                        {t.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[10px] text-zinc-500">
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

      {/* Footer & Order Contact Section */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Ready to place an order?</h2>
            <p className="text-xs text-zinc-400">Get in touch directly via social links or contact channels.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={cHref(c.type, c.value)}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: accentColor }}
                >
                  {c.value}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
                title={s.label || s.platform}
              >
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-12 border-t border-zinc-800/50 pt-6 flex justify-between items-center text-[10px] text-zinc-600">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
          <p className="font-mono tracking-widest">NEX CARD BUSINESS</p>
        </div>
      </footer>

      {/* ITEM DETAIL POPUP MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 rounded-full bg-zinc-800 p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {selectedItem.coverImageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-950">
                   <img
                   src={resolveImageUrl(selectedItem.coverImageUrl)}
                   alt={selectedItem.title}
                   className="absolute inset-0 h-full w-full object-cover"
                 />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.tags.map((t, i) => (
                  <span key={i} className="rounded-md bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    {t}
                  </span>
                ))}
              </div>

              <h3 className="text-2xl font-bold text-white">{selectedItem.title}</h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">{selectedItem.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800">
              {selectedItem.liveUrl && (
                <a
                  href={selectedItem.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                  style={{ background: accentColor }}
                >
                  <span>Order Now / Visit Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {selectedItem.repoUrl && (
                <a
                  href={selectedItem.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs text-zinc-200 hover:text-white"
                >
                  More Details
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
