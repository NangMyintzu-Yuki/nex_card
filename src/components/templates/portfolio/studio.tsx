import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
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

export function StudioPortfolio({ data, accentColor="#ec4899" }: PP) {
  const {fullName,headline,bio,avatarUrl,projects,skills,experience,socialLinks,contacts,testimonials,resumeUrl,availability} = data;
  const avail=availability?AVAIL_MAP[availability]:null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero fullbleed */}
      <section className="relative min-h-[85vh] flex flex-col justify-end px-6 pb-16 overflow-hidden">
        {projects[0]?.coverImageUrl&&(
          <div className="absolute inset-0">
            <Image src={projects[0].coverImageUrl} alt="Hero" fill className="object-cover opacity-20" sizes="100vw" priority/>
            <div className="absolute inset-0" style={{background:"linear-gradient(to top,#09090b 40%,transparent)"}}/>
          </div>
        )}
        <div className="relative z-10 mx-auto max-w-5xl w-full">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              {avail&&<div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{borderColor:`${accentColor}30`,background:`${accentColor}15`,color:accentColor}}><span className={`h-2 w-2 rounded-full ${avail.dot}`}/>{avail.text}</div>}
              <h1 className="text-6xl font-black leading-none tracking-tighter md:text-8xl">{fullName}</h1>
              <p className="mt-2 text-xl text-zinc-400 max-w-xl">{headline}</p>
              <p className="mt-3 max-w-lg text-sm text-zinc-500 leading-relaxed">{bio}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {contacts.map((c,i)=><a key={i} href={cHref(c.type,c.value)} className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-all">{c.label??c.value}</a>)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              {avatarUrl&&<div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/10"><Image src={avatarUrl} alt={fullName} fill className="object-cover" sizes="64px"/></div>}
              {resumeUrl&&<a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-5 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">Resume ↓</a>}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="border-t border-zinc-800 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-3xl font-black">Selected Work</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {projects.slice(0,6).map(p=>(
              <div key={p.id} className="group relative overflow-hidden rounded-2xl bg-zinc-900">
                {p.coverImageUrl&&<div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={p.coverImageUrl} alt={p.title} fill className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" sizes="600px"/>
                </div>}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-zinc-950/90 to-transparent p-5">
                  <div className="flex flex-wrap gap-1 mb-1">{p.tags.slice(0,2).map((t,i)=><span key={i} className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/60">{t}</span>)}</div>
                  <h3 className="text-lg font-black">{p.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-1">{p.description}</p>
                  <div className="mt-2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold" style={{color:accentColor}}>Live ↗</a>}
                    {p.repoUrl&&<a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400">Code ↗</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      {data.skills.length>0&&<section className="border-t border-zinc-800 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-black">Craft & Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.skills.map((g,i)=>(
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider" style={{color:accentColor}}>{g.category}</h3>
                <div className="flex flex-wrap gap-1.5">{g.items.map((item,j)=><span key={j} className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">{item}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Experience */}
      {experience.length>0&&<section className="border-t border-zinc-800 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-black">Experience</h2>
          <div className="space-y-4">
            {experience.map((e,i)=>(
              <div key={i} className="flex gap-4 rounded-xl border border-zinc-800 p-5">
                <div>
                  <div className="flex flex-wrap items-baseline gap-2"><h3 className="font-bold">{e.role}</h3><span className="text-sm text-zinc-500">@ {e.company}</span></div>
                  <p className="text-xs text-zinc-600 mt-0.5">{e.startDate.slice(0,7)} – {e.endDate?e.endDate.slice(0,7):"Present"}{e.location&&` · ${e.location}`}</p>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Testimonials */}
      {testimonials&&testimonials.length>0&&<section className="border-t border-zinc-800 bg-zinc-900 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-black">Kind Words</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(0,4).map((t,i)=>(
              <div key={i} className="rounded-xl border border-zinc-800 p-5">
                <p className="text-sm leading-relaxed text-zinc-300 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3 border-t border-zinc-800 pt-3">
                  {t.avatarUrl&&<div className="relative h-8 w-8 overflow-hidden rounded-full"><Image src={t.avatarUrl} alt={t.author} fill className="object-cover" sizes="32px"/></div>}
                  <div><p className="text-xs font-bold text-white">{t.author}</p><p className="text-xs text-zinc-600">{t.role}{t.company&&` · ${t.company}`}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      <footer className="border-t border-zinc-800 px-6 py-10 flex flex-wrap justify-between items-center gap-4">
        <p className="font-black text-zinc-700">{fullName}</p>
        <div className="flex gap-4 flex-wrap">
          {socialLinks.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:text-white transition-colors">{SP_EMOJI[s.platform]} {s.label??s.platform}</a>)}
        </div>
        <p className="text-xs text-zinc-800">NEX CARD</p>
      </footer>
    </main>
  );
}