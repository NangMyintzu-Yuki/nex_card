import type { PortfolioData } from "@/lib/validators/template-schemas";

interface PP { data: PortfolioData; accentColor?: string; }

export function BlueprintPortfolio({ data, accentColor = "#8b5cf6" }: PP) {
  const { fullName, headline, bio, avatarUrl, projects, socialLinks, contacts } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* CREATOR PROFILE CARD */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-2xl text-center space-y-6">
          {avatarUrl && (
            <div className="relative h-28 w-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-500 shadow-xl">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{fullName}</h1>
            <p className="text-sm font-semibold text-purple-400">{headline}</p>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">{bio}</p>
          </div>

          {/* Social Icons Pill Grid */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/20 transition-all">
                {s.label || s.platform}
              </a>
            ))}
          </div>
        </div>

        {/* CREATIVE SHOWCASE */}
        {projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-2">Featured Campaigns & Content</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 hover:bg-white/10 transition-all">
                  {p.coverImageUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                      <img src={p.coverImageUrl} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
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
        {data.experience.length>0&&(
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3"><div className="h-px flex-1" style={{background:`${accentColor}25`}}/><span className="text-xs font-semibold uppercase tracking-widest" style={{color:`${accentColor}70`}}>Experience</span><div className="h-px flex-1" style={{background:`${accentColor}25`}}/></div>
            <div className="relative border-l pl-6" style={{borderColor:`${accentColor}20`}}>
              {data.experience.map((e,i)=>(
                <div key={i} className="mb-6 relative">
                  <div className="absolute -left-8 top-1 h-3 w-3 rounded-full border-2" style={{background:"#06101f",borderColor:accentColor}}/>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="font-bold text-white">{e.role}</h3>
                    <span className="text-sm text-slate-500">@ {e.company}</span>
                    <span className="text-xs text-slate-700">{e.startDate.slice(0,7)}—{e.endDate?e.endDate.slice(0,7):"present"}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {data.testimonials && data.testimonials.length>0&&(
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3"><div className="h-px flex-1" style={{background:`${accentColor}25`}}/><span className="text-xs font-semibold uppercase tracking-widest" style={{color:`${accentColor}70`}}>Testimonials</span><div className="h-px flex-1" style={{background:`${accentColor}25`}}/></div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.testimonials.slice(0,4).map((t,i)=>(
                <div key={i} className="rounded-xl border p-4" style={{borderColor:`${accentColor}12`,background:`${accentColor}04`}}>
                  <p className="text-sm leading-relaxed text-slate-400 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{borderColor:`${accentColor}10`}}>
                    {t.avatarUrl&&<div className="relative h-8 w-8 overflow-hidden rounded-full"><img src={t.avatarUrl} alt={t.author} className="absolute inset-0 h-full w-full object-cover"/></div>}
                    <div><p className="text-xs font-bold text-white">{t.author}</p><p className="text-xs text-slate-600">{t.role}{t.company&&` · ${t.company}`}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="border-t pt-6 flex flex-wrap justify-between items-center gap-4" style={{borderColor:`${accentColor}20`}}>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-slate-600 hover:text-white transition-colors">{s.label??s.platform} ↗</a>)}
          </div>
          <p className="text-xs text-slate-800">NEX CARD</p>
        </footer>

      </div>
    </main>
  );
}
