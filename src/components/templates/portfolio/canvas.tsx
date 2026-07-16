// ALL 5 PORTFOLIO TEMPLATES — Redesigned for ALL personas
// Canvas: Universal clean white — suits everyone (designer, CEO, developer, SME)
// Studio: Dark cinematic — creative agencies, photographers, filmmakers
// Forge: Terminal/developer — engineers, open source, technical roles
// Spectrum: Bento bold — creative directors, brand designers, influencers
// Blueprint: Technical grid — architects, consultants, analysts, PMs

import Image from "next/image";
import type { PortfolioData } from "@/lib/validators/template-schemas";

interface PP { data: PortfolioData; accentColor?: string; }

function cHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s/g,"")}`;
  return value.startsWith("http") ? value : `https://${value}`;
}

const AVAIL_MAP: Record<string,{dot:string;text:string}> = {
  available:{dot:"bg-emerald-400",text:"Open to opportunities"},
  limited:{dot:"bg-amber-400",text:"Limited availability"},
  unavailable:{dot:"bg-red-400",text:"Not available"},
};

const SP_EMOJI: Record<string,string>={linkedin:"💼",github:"🐙",twitter:"𝕏",instagram:"📸",facebook:"👥",youtube:"▶️",tiktok:"🎵",whatsapp:"💬",telegram:"✈️",viber:"📲",discord:"🎮",website:"🌐",behance:"🎨",dribbble:"🏀",medium:"📝",stackoverflow:"📚"};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS — Universal editorial white. Works for every profession.
// ─────────────────────────────────────────────────────────────────────────────
export function CanvasPortfolio({ data, accentColor="#0ea5e9" }: PP) {
  const {fullName,headline,bio,avatarUrl,projects,skills,experience,socialLinks,contacts,testimonials,availability,resumeUrl,gallery} = data;
  const avail = availability ? AVAIL_MAP[availability] : null;

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {avatarUrl && <div className="relative h-8 w-8 overflow-hidden rounded-full"><Image src={avatarUrl} alt={fullName} fill className="object-cover" sizes="32px"/></div>}
            <span className="font-black text-sm">{fullName}</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {["Work","About","Skills","Experience","Contact"].map(i=>(
              <a key={i} href={`#${i.toLowerCase()}`} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{i}</a>
            ))}
          </nav>
          <div className="flex gap-2">
            {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="hidden rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 sm:block" style={{background:accentColor}}>Resume ↓</a>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-100 px-6 py-20">
        <div className="mx-auto max-w-5xl flex flex-col gap-8 md:flex-row md:items-center">
          {avatarUrl && (
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl shadow-2xl">
              <Image src={avatarUrl} alt={fullName} fill className="object-cover" sizes="112px" priority/>
            </div>
          )}
          <div className="flex-1">
            {avail && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{borderColor:`${accentColor}30`,background:`${accentColor}10`,color:accentColor}}>
                <span className={`h-2 w-2 rounded-full ${avail.dot}`}/>{avail.text}
              </div>
            )}
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">{fullName}</h1>
            <p className="mt-2 text-xl font-semibold" style={{color:accentColor}}>{headline}</p>
            <p className="mt-3 max-w-xl text-neutral-500 leading-relaxed">{bio}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {contacts.map((c,i)=>(
                <a key={i} href={cHref(c.type,c.value)} className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                  {SP_EMOJI[c.type]??""} {c.label??c.value}
                </a>
              ))}
              {socialLinks.slice(0,5).map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                  {SP_EMOJI[s.platform]??""} {s.label??s.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects.some(p=>p.featured) && (
        <section id="work" className="border-b border-neutral-100 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-black">Featured Work</h2>
              <span className="text-sm text-neutral-400">{projects.length} total</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.filter(p=>p.featured).slice(0,3).map(p=>(
                <div key={p.id} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm hover:shadow-xl transition-all">
                  {p.coverImageUrl && (
                    <div className="relative aspect-video overflow-hidden bg-neutral-100">
                      <Image src={p.coverImageUrl} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="400px"/>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap gap-1">
                      {p.tags.slice(0,3).map((t,i)=>(
                        <span key={i} className="rounded-md px-2 py-0.5 text-xs font-medium" style={{background:`${accentColor}10`,color:accentColor}}>{t}</span>
                      ))}
                    </div>
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{p.description}</p>
                    <div className="mt-3 flex gap-3">
                      {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:opacity-70" style={{color:accentColor}}>Live ↗</a>}
                      {p.repoUrl&&<a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-neutral-700">Code ↗</a>}
                      {p.caseStudyUrl&&<a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-neutral-700">Case Study ↗</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All projects list */}
      {projects.filter(p=>!p.featured).length>0 && (
        <section className="border-b border-neutral-100 bg-neutral-50 px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-xl font-black">More Projects</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {projects.filter(p=>!p.featured).slice(0,8).map(p=>(
                <div key={p.id} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition-all">
                  {p.coverImageUrl && <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100"><Image src={p.coverImageUrl} alt={p.title} fill className="object-cover" sizes="56px"/></div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      <div className="flex shrink-0 gap-2">
                        {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold" style={{color:accentColor}}>↗</a>}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{p.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">{p.tags.slice(0,3).map((t,i)=><span key={i} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">{t}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About + Skills */}
      <section id="skills" className="border-b border-neutral-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-black">Skills & Expertise</h2>
          {data.skills.length>0 && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {data.skills.map((g,i)=>(
                <div key={i} className="rounded-2xl border border-neutral-100 p-5">
                  <h3 className="mb-3 text-xs font-black uppercase tracking-wider" style={{color:accentColor}}>{g.category}</h3>
                  <div className="flex flex-wrap gap-1.5">{g.items.map((item,j)=><span key={j} className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">{item}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experience */}
      {experience.length>0 && (
        <section id="experience" className="border-b border-neutral-100 bg-neutral-50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-2xl font-black">Experience</h2>
            <div className="space-y-5">
              {experience.map((e,i)=>(
                <div key={i} className="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-5">
                  {e.logoUrl&&<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-100"><Image src={e.logoUrl} alt={e.company} fill className="object-contain p-2" sizes="48px"/></div>}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-bold">{e.role}</h3>
                      <span className="text-sm text-neutral-500">@ {e.company}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-400">{e.startDate.slice(0,7)} – {e.endDate?e.endDate.slice(0,7):"Present"}{e.location&&` · ${e.location}`}</p>
                    <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{e.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery&&gallery.length>0&&(
        <section className="border-b border-neutral-100 bg-white px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-xl font-black">Gallery</h2>
            <div className="columns-2 gap-3 md:columns-4">
              {gallery.slice(0,8).map((img,i)=>(
                <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl">
                  <div className="relative aspect-square"><Image src={img.url} alt={img.alt} fill className="object-cover" sizes="250px"/></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials&&testimonials.length>0&&(
        <section className="border-b border-neutral-100 bg-neutral-50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-2xl font-black">Testimonials</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {testimonials.slice(0,4).map((t,i)=>(
                <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="mb-3 flex">{Array.from({length:5}).map((_,j)=><span key={j} className="text-amber-400 text-sm">★</span>)}</div>
                  <p className="text-sm leading-relaxed text-neutral-600 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3">
                    {t.avatarUrl&&<div className="relative h-8 w-8 overflow-hidden rounded-full"><Image src={t.avatarUrl} alt={t.author} fill className="object-cover" sizes="32px"/></div>}
                    <div><p className="text-xs font-bold">{t.author}</p><p className="text-xs text-neutral-400">{t.role}{ t.company && ` · ${t.company}`}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <footer id="contact" className="px-6 py-12 bg-white">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Let&apos;s work together</h2>
            <div className="mt-2 flex flex-wrap gap-3">
              {contacts.map((c,i)=><a key={i} href={cHref(c.type,c.value)} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{color:accentColor}}>{c.value}</a>)}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {socialLinks.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors">{SP_EMOJI[s.platform]} {s.label??s.platform}</a>)}
          </div>
        </div>
        <p className="mx-auto max-w-5xl mt-8 text-xs text-neutral-300">NEX CARD</p>
      </footer>
    </main>
  );
}

