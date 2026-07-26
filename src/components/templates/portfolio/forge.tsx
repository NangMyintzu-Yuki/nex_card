import { ExternalLink, ArrowUpRight } from "lucide-react";
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

const SP_EMOJI: Record<string,string>={linkedin:"💼",twitter:"𝕏",instagram:"📸",facebook:"👥",youtube:"▶️",tiktok:"🎵",whatsapp:"💬",telegram:"✈️",viber:"📲",discord:"🎮",website:"🌐",behance:"🎨",dribbble:"🏀",medium:"📝"};

export function ForgePortfolio({ data, accentColor="#22c55e" }: PP) {
  const {fullName,headline,bio,projects,skills,experience,socialLinks,contacts,availability,resumeUrl} = data;
  const avail=availability?AVAIL_MAP[availability]:null;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <span className="text-sm font-bold text-white">{fullName}</span>
          <div className="flex gap-3">
            {contacts.slice(0,2).map((c,i)=><a key={i} href={cHref(c.type,c.value)} className="text-xs text-neutral-500 hover:text-white transition-colors">{c.label??c.type}</a>)}
            {resumeUrl&&<a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{color:accentColor}}>Resume <ArrowUpRight className="h-3 w-3"/></a>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">{fullName}</h1>
          <p className="mt-1 text-lg" style={{color:accentColor}}>{headline}</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500 max-w-xl">{bio}</p>
          {avail&&<div className="mt-3 inline-flex items-center gap-2 text-xs text-neutral-500"><span className={`h-2 w-2 rounded-full ${avail.dot}`}/>{avail.text}</div>}
        </div>

        {/* Contact cards */}
        {contacts.length>0&&(
          <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c,i)=>(
              <a key={i} href={cHref(c.type,c.value)} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-neutral-700 transition-all">
                <p className="text-xs text-neutral-600 mb-1">{c.label??c.type}</p>
                <p className="text-sm font-semibold text-white">{c.value}</p>
              </a>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length>0&&(
          <div className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-white">Projects</h2>
            <div className="space-y-3">
              {projects.slice(0,8).map(p=>(
                <div key={p.id} className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-700 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-white">{p.title}</h3>
                        {p.featured&&<span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{background:`${accentColor}20`,color:accentColor}}>Featured</span>}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{p.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">{p.tags.map((t,i)=><span key={i} className="rounded-md px-2 py-0.5 text-xs" style={{background:`${accentColor}12`,color:accentColor}}>{t}</span>)}</div>
                    </div>
                    <div className="flex gap-3 shrink-0 text-xs text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">Live ↗</a>}
                      {p.repoUrl&&<a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">Details ↗</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length>0&&(
          <div className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-white">Expertise</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {data.skills.map((g,i)=>(
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{color:accentColor}}>{g.category}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{g.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length>0&&(
          <div className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-white">Experience</h2>
            <div className="space-y-5">
              {experience.map((e,i)=>(
                <div key={i} className="border-l-2 border-neutral-800 pl-4" style={{borderColor:accentColor}}>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-white">{e.role}</span>
                    <span className="text-sm text-neutral-500">@ {e.company}</span>
                    <span className="text-xs text-neutral-700">{e.startDate.slice(0,7)}–{e.endDate?e.endDate.slice(0,7):"Present"}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social */}
        {socialLinks.length>0&&(
          <div className="mb-10">
            <h2 className="mb-4 text-sm font-bold text-white">Connect</h2>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((s,i)=>(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-500 hover:border-neutral-600 hover:text-white transition-all">
                  <span>{SP_EMOJI[s.platform]}</span> {s.label??s.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-neutral-800">
          <span>NEX CARD</span>
        </div>
      </div>
    </main>
  );
}
