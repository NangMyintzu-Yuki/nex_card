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

export function ForgePortfolio({ data, accentColor="#22c55e" }: PP) {
  const {fullName,headline,bio,projects,skills,experience,socialLinks,contacts,availability,resumeUrl} = data;
  const avail=availability?AVAIL_MAP[availability]:null;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300" style={{fontFamily:"'JetBrains Mono','Fira Code',monospace"}}>
      {/* Terminal header */}
      <div className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80"/><span className="h-3 w-3 rounded-full bg-amber-500/80"/><span className="h-3 w-3 rounded-full bg-emerald-500/80"/>
            </div>
            <span className="text-xs text-neutral-600">{fullName.toLowerCase().replace(/ /g,"-")}.portfolio</span>
          </div>
          <div className="flex gap-3">
            {contacts.slice(0,2).map((c,i)=><a key={i} href={cHref(c.type,c.value)} className="text-xs text-neutral-600 hover:text-white transition-colors">[{c.label??c.type}]</a>)}
            {resumeUrl&&<a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs" style={{color:accentColor}}>[resume.pdf]</a>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Prompt header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3"><span style={{color:accentColor}}>❯</span><span className="text-neutral-600 text-sm">whoami</span></div>
          <h1 className="text-4xl font-bold text-white">{fullName}</h1>
          <p className="mt-1 text-lg" style={{color:accentColor}}>{headline}</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500 max-w-xl">{bio}</p>
          {avail&&<div className="mt-3 inline-flex items-center gap-2 text-xs text-neutral-600"><span className={`h-2 w-2 rounded-full ${avail.dot}`}/>{avail.text}</div>}
        </div>

        {/* JSON contacts */}
        {contacts.length>0&&(
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3"><span style={{color:accentColor}}>❯</span><span className="text-neutral-600 text-sm">cat contact.json</span></div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
              <p className="text-neutral-700">{"{"}</p>
              {contacts.map((c,i)=>(
                <div key={i} className="ml-4 py-0.5">
                  <span className="text-sky-400">&quot;{c.label??c.type}&quot;</span>
                  <span className="text-neutral-600">: </span>
                  <a href={cHref(c.type,c.value)} className="hover:opacity-70" style={{color:accentColor}}>&quot;{c.value}&quot;</a>
                  {i<contacts.length-1&&<span className="text-neutral-700">,</span>}
                </div>
              ))}
              <p className="text-neutral-700">{"}"}</p>
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length>0&&(
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4"><span style={{color:accentColor}}>❯</span><span className="text-neutral-600 text-sm">ls ~/projects/</span></div>
            <div className="space-y-3">
              {projects.slice(0,8).map(p=>(
                <div key={p.id} className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-white">{p.title}</h3>
                        {p.featured&&<span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{background:`${accentColor}20`,color:accentColor}}>★ featured</span>}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-1">{p.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">{p.tags.map((t,i)=><span key={i} className="text-xs" style={{color:accentColor}}>#{t}</span>)}</div>
                    </div>
                    <div className="flex gap-3 shrink-0 text-xs text-neutral-600 opacity-60 group-hover:opacity-100 transition-opacity">
                      {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">[live]</a>}
                      {p.repoUrl&&<a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">[repo]</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills yaml */}
        {data.skills.length>0&&(
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4"><span style={{color:accentColor}}>❯</span><span className="text-neutral-600 text-sm">cat skills.yaml</span></div>
            <div className="space-y-2">
              {data.skills.map((g,i)=>(
                <div key={i} className="flex gap-4 text-sm flex-wrap">
                  <span className="w-32 shrink-0 text-right text-neutral-600">{g.category}:</span>
                  <span className="text-neutral-400">{g.items.join(" · ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length>0&&(
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4"><span style={{color:accentColor}}>❯</span><span className="text-neutral-600 text-sm">cat experience.log</span></div>
            <div className="space-y-4 border-l border-neutral-800 pl-4">
              {experience.map((e,i)=>(
                <div key={i}>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-white">{e.role}</span>
                    <span className="text-neutral-600">@{e.company}</span>
                    <span className="text-xs text-neutral-700">{e.startDate.slice(0,7)}–{e.endDate?e.endDate.slice(0,7):"now"}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3"><span style={{color:accentColor}}>❯</span><span className="text-neutral-600 text-sm">open ./links/</span></div>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((s,i)=>(
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-500 hover:border-neutral-600 hover:text-white transition-all">
                [{SP_EMOJI[s.platform]} {s.label??s.platform}]
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-800">
          <span style={{color:accentColor}}>✓</span>
          <span>powered by NEX CARD</span>
        </div>
      </div>
    </main>
  );
}