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


export function BlueprintPortfolio({ data, accentColor="#3b82f6" }: PP) {
  const {fullName,headline,bio,projects,skills,experience,socialLinks,contacts,testimonials,availability,resumeUrl} = data;
  const avail=availability?AVAIL_MAP[availability]:null;

  return (
    <main className="min-h-screen text-slate-200" style={{
      background:"#06101f",
      backgroundImage:`linear-gradient(rgba(59,130,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.06) 1px,transparent 1px)`,
      backgroundSize:"32px 32px",
    }}>
      <div className="mx-auto max-w-5xl px-6 py-14">
        {/* Header panel */}
        <div className="mb-10 rounded-2xl border p-8" style={{borderColor:`${accentColor}30`,background:`${accentColor}06`}}>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-2" style={{color:`${accentColor}80`}}>// PROFESSIONAL PROFILE</p>
              <h1 className="text-4xl font-black text-white">{fullName}</h1>
              <p className="mt-1 text-xl text-slate-400">{headline}</p>
              {avail&&<div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500"><span className={`h-2 w-2 rounded-full ${avail.dot}`}/>{avail.text}</div>}
            </div>
            <div className="space-y-2">
              {contacts.map((c,i)=>(
                <a key={i} href={cHref(c.type,c.value)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <span style={{color:accentColor}}>→</span> {c.value}
                </a>
              ))}
              {resumeUrl&&<a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{color:accentColor}}>→ resume.pdf</a>}
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-400 max-w-2xl border-t pt-5" style={{borderColor:`${accentColor}20`}}>{bio}</p>
        </div>

        {/* Projects */}
        {projects.length>0&&(
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3"><div className="h-px flex-1" style={{background:`${accentColor}25`}}/><span className="text-xs font-semibold uppercase tracking-widest" style={{color:`${accentColor}70`}}>Projects</span><div className="h-px flex-1" style={{background:`${accentColor}25`}}/></div>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.slice(0,6).map(p=>(
                <div key={p.id} className="rounded-xl border p-4 transition-all hover:border-blue-500/30" style={{borderColor:`${accentColor}15`,background:`${accentColor}04`}}>
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{p.tags.map((t,i)=><span key={i} className="rounded px-1.5 py-0.5 text-xs font-mono" style={{color:accentColor,background:`${accentColor}15`}}>#{t}</span>)}</div>
                  <div className="mt-2.5 flex gap-4">
                    {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:opacity-70" style={{color:accentColor}}>Live ↗</a>}
                    {p.repoUrl&&<a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-500 hover:text-white">Repo ↗</a>}
                    {p.caseStudyUrl&&<a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-500 hover:text-white">Case Study ↗</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length>0&&(
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3"><div className="h-px flex-1" style={{background:`${accentColor}25`}}/><span className="text-xs font-semibold uppercase tracking-widest" style={{color:`${accentColor}70`}}>Expertise</span><div className="h-px flex-1" style={{background:`${accentColor}25`}}/></div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {data.skills.map((g,i)=>(
                <div key={i} className="rounded-xl border p-4" style={{borderColor:`${accentColor}12`,background:`${accentColor}04`}}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{color:accentColor}}>{g.category}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{g.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience timeline */}
        {experience.length>0&&(
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3"><div className="h-px flex-1" style={{background:`${accentColor}25`}}/><span className="text-xs font-semibold uppercase tracking-widest" style={{color:`${accentColor}70`}}>Experience</span><div className="h-px flex-1" style={{background:`${accentColor}25`}}/></div>
            <div className="relative border-l pl-6" style={{borderColor:`${accentColor}20`}}>
              {experience.map((e,i)=>(
                <div key={i} className="mb-6 relative">
                  <div className="absolute -left-8 top-1 h-3 w-3 rounded-full border-2" style={{background:"#06101f",borderColor:accentColor}}/>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="font-bold text-white">{e.role}</h3>
                    <span className="text-sm text-slate-500">@ {e.company}</span>
                    <span className="text-xs text-slate-700 font-mono">{e.startDate.slice(0,7)}—{e.endDate?e.endDate.slice(0,7):"present"}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials&&testimonials.length>0&&(
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3"><div className="h-px flex-1" style={{background:`${accentColor}25`}}/><span className="text-xs font-semibold uppercase tracking-widest" style={{color:`${accentColor}70`}}>Testimonials</span><div className="h-px flex-1" style={{background:`${accentColor}25`}}/></div>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.slice(0,4).map((t,i)=>(
                <div key={i} className="rounded-xl border p-4" style={{borderColor:`${accentColor}12`,background:`${accentColor}04`}}>
                  <p className="text-sm leading-relaxed text-slate-400 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{borderColor:`${accentColor}10`}}>
                    {t.avatarUrl&&<div className="relative h-8 w-8 overflow-hidden rounded-full"><Image src={t.avatarUrl} alt={t.author} fill className="object-cover" sizes="32px"/></div>}
                    <div><p className="text-xs font-bold text-white">{t.author}</p><p className="text-xs text-slate-600">{t.role}{t.company&&` · ${t.company}`}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="border-t pt-6 flex flex-wrap justify-between items-center gap-4" style={{borderColor:`${accentColor}20`}}>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-slate-600 hover:text-white transition-colors">{SP_EMOJI[s.platform]} {s.label??s.platform}</a>)}
          </div>
          <p className="text-xs font-mono text-slate-800">// PresenceCard</p>
        </footer>
      </div>
    </main>
  );
}