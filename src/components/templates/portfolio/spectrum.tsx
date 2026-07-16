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

export function SpectrumPortfolio({ data, accentColor="#f59e0b" }: PP) {
  const {fullName,headline,bio,avatarUrl,projects,skills,socialLinks,contacts,testimonials,gallery,resumeUrl,availability} = data;
  const avail=availability?AVAIL_MAP[availability]:null;

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Hero */}
      <section className="px-6 py-16 border-b-4 border-zinc-900">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2 w-12 rounded-full" style={{background:accentColor}}/>
            {avail&&<div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium" style={{borderColor:`${accentColor}30`,background:`${accentColor}10`,color:accentColor}}><span className={`h-2 w-2 rounded-full ${avail.dot}`}/>{avail.text}</div>}
          </div>
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-5xl font-black leading-none tracking-tighter md:text-7xl">{fullName}</h1>
              <p className="mt-3 text-xl font-bold text-zinc-500">{headline}</p>
              <p className="mt-3 leading-relaxed text-zinc-500 max-w-sm">{bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {contacts.map((c,i)=>(
                  <a key={i} href={cHref(c.type,c.value)} className="rounded-full border-2 border-zinc-900 px-4 py-2 text-sm font-bold hover:bg-zinc-900 hover:text-white transition-all">
                    {c.label??c.value}
                  </a>
                ))}
                {resumeUrl&&<a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-sm font-bold text-white hover:opacity-90" style={{background:accentColor}}>Resume ↓</a>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map((s,i)=>(
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors">
                    {SP_EMOJI[s.platform]} {s.label??s.platform}
                  </a>
                ))}
              </div>
            </div>
            {avatarUrl&&<div className="relative aspect-square max-w-xs overflow-hidden rounded-3xl border-4 border-zinc-900 mx-auto md:mx-0"><Image src={avatarUrl} alt={fullName} fill className="object-cover" sizes="320px" priority/></div>}
          </div>
        </div>
      </section>

      {/* Bento projects */}
      {projects.length>0&&<section className="border-b-4 border-zinc-900 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-black">Work</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {projects.slice(0,6).map((p,i)=>(
              <div key={p.id} className={`group overflow-hidden rounded-2xl border-2 border-zinc-900 ${i===0?"col-span-2 row-span-2":""}`}>
                {p.coverImageUrl&&<div className={`relative overflow-hidden bg-zinc-100 ${i===0?"aspect-[4/3]":"aspect-square"}`}>
                  <Image src={p.coverImageUrl} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="400px"/>
                </div>}
                <div className="border-t-2 border-zinc-900 p-3">
                  <h3 className="font-black text-sm leading-tight">{p.title}</h3>
                  <div className="mt-1 flex gap-2">
                    {p.liveUrl&&<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold" style={{color:accentColor}}>Live ↗</a>}
                    {p.caseStudyUrl&&<a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500">Case ↗</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Skills dark */}
      {data.skills.length>0&&<section className="border-b-4 border-zinc-900 bg-zinc-950 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-black text-white">Stack</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.skills.map((g,i)=>{
              const colors=[accentColor,"#6366f1","#ec4899","#22c55e","#0ea5e9","#f97316"];
              const c=colors[i%colors.length];
              return(
                <div key={i} className="rounded-2xl p-5" style={{background:`${c}15`,border:`1px solid ${c}25`}}>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-wider" style={{color:c}}>{g.category}</h3>
                  <div className="flex flex-wrap gap-1.5">{g.items.map((item,j)=><span key={j} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)"}}>{item}</span>)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>}

      {/* Testimonials */}
      {testimonials&&testimonials.length>0&&<section className="border-b-4 border-zinc-900 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-black">What people say</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(0,4).map((t,i)=>(
              <div key={i} className="rounded-2xl border-2 border-zinc-100 p-5">
                <p className="text-sm leading-relaxed text-zinc-600 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3">
                  {t.avatarUrl&&<div className="relative h-8 w-8 overflow-hidden rounded-full"><Image src={t.avatarUrl} alt={t.author} fill className="object-cover" sizes="32px"/></div>}
                  <div><p className="text-xs font-bold">{t.author}</p><p className="text-xs text-zinc-400">{t.role}{t.company&&` · ${t.company}`}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      <footer className="border-t-2 border-zinc-200 px-6 py-8 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4 flex-wrap">
          {socialLinks.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-zinc-400 hover:text-zinc-900 transition-colors">{SP_EMOJI[s.platform]} {s.label??s.platform}</a>)}
        </div>
        <p className="text-xs text-zinc-300">NEX CARD</p>
      </footer>
    </main>
  );
}