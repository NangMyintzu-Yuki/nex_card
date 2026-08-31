// TITANIUM — Metallic enterprise. For executives and corporate professionals.
"use client";
import type { DigitalNameCardData } from "@/lib/validators/template-schemas";
import { AvatarZoom } from "@/components/templates/avatar-zoom";
import { safeHref } from "@/lib/security/safe-href";
import { getBackground, type BackgroundStyle } from "@/components/templates/background-styles";

interface Props { data: DigitalNameCardData; accentColor?: string; backgroundStyle?: BackgroundStyle; }

function buildVCard(d: DigitalNameCardData) {
  return ["BEGIN:VCARD","VERSION:3.0",`FN:${d.fullName}`,
    d.jobTitle?`TITLE:${d.jobTitle}`:null,d.company?`ORG:${d.company}`:null,
    ...d.contacts.map(c=>c.type==="email"?`EMAIL:${c.value}`:c.type==="phone"?`TEL;TYPE=CELL:${c.value}`:c.type==="website"?`URL:${c.value.startsWith("http")?c.value:"https://"+c.value}`:null),
    ...d.socialLinks.map(s=>`URL;TYPE=${s.platform.toUpperCase()}:${s.url}`),
    "END:VCARD"].filter(Boolean).join("\r\n");
}
function saveVCard(d: DigitalNameCardData) {
  const b=new Blob([buildVCard(d)],{type:"text/vcard;charset=utf-8"});
  const u=URL.createObjectURL(b);
  Object.assign(document.createElement("a"),{href:u,download:`${d.fullName.replace(/\s+/g,"_")}.vcf`}).click();
  URL.revokeObjectURL(u);
}

const CT: Record<string,{emoji:string;label:string;href:(v:string)=>string}> = {
  phone:{emoji:"📱",label:"Phone",href:v=>`tel:${v.replace(/\s/g,"")}`},
  email:{emoji:"✉️",label:"Email",href:v=>`mailto:${v}`},
  whatsapp:{emoji:"💬",label:"WhatsApp",href:v=>`https://wa.me/${v.replace(/[^0-9+]/g,"")}`},
  viber:{emoji:"📲",label:"Viber",href:v=>`viber://chat?number=${v.replace(/[^0-9+]/g,"")}`},
  telegram:{emoji:"✈️",label:"Telegram",href:v=>`https://t.me/${v.replace("@","")}`},
  website:{emoji:"🌐",label:"Website",href:v=>safeHref(v)},
  address:{emoji:"📍",label:"Address",href:v=>`https://maps.google.com/?q=${encodeURIComponent(v)}`},
};
const PRIORITY=["phone","email","whatsapp","viber","telegram","website","address"];

export function TitaniumNameCard({ data, accentColor="#94a3b8", backgroundStyle }: Props) {
  const {fullName,jobTitle,company,companyLogoUrl,avatarUrl,bio,tagline,contacts,socialLinks,skills,featuredQuote}=data;
  const sorted=[...contacts].sort((a,b)=>{const ai=PRIORITY.indexOf(a.type),bi=PRIORITY.indexOf(b.type);return(ai<0?99:ai)-(bi<0?99:bi);});
  const s=accentColor;

  return (
    <main className="min-h-screen" style={{
      background:getBackground(accentColor, backgroundStyle),
      backgroundImage:`linear-gradient(rgba(148,163,184,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.025) 1px,transparent 1px)`,
      backgroundSize:"40px 40px,40px 40px",
    }}>
      <div className="mx-auto max-w-sm px-4 py-10">
        <div className="overflow-hidden rounded-2xl" style={{
          background:"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
          border:"1px solid rgba(148,163,184,0.15)",
          boxShadow:`inset 0 1px 0 rgba(255,255,255,0.08),0 24px 60px rgba(0,0,0,0.6)`,
        }}>

          {/* Header */}
          <div className="flex items-center gap-4 px-5 py-5" style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
            {avatarUrl?<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl" style={{border:`1px solid ${s}40`}}>
              <AvatarZoom src={avatarUrl} alt={fullName} className="h-full w-full" />
            </div>:<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl font-black text-neutral-900" style={{background:`linear-gradient(135deg,${s},#64748b)`}}>{fullName.charAt(0)}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-lg font-black leading-tight text-white">{fullName}</h1>
                  <p className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{color:s}}>{jobTitle}</p>
                </div>
                {companyLogoUrl&&<img src={companyLogoUrl} alt={company ?? ""} className="h-5 w-auto object-contain opacity-50 shrink-0"/>} 
              </div>
              <p className="mt-0.5 text-xs text-slate-600">{company||""}</p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 px-5 py-2.5" style={{background:"rgba(148,163,184,0.04)",borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400"/><span className="text-[10px] text-slate-600 uppercase tracking-wider">Available</span></div>
            <div className="h-3 w-px bg-slate-800"/>
            {tagline&&<p className="text-[10px] text-slate-600 truncate flex-1">{tagline}</p>}
          </div>

          {bio&&<div className="px-5 py-4" style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}><p className="text-xs leading-relaxed text-slate-500">{bio}</p></div>}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 px-5 py-4" style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
            <button onClick={()=>saveVCard(data)} className="flex flex-col items-center gap-1 rounded-xl py-2.5 transition-all hover:scale-105" style={{background:`${s}12`,border:`1px solid ${s}25`}}>
              <span className="text-base">👤</span><span className="text-[9px] font-bold" style={{color:s}}>Save Contact</span>
            </button>
            <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);}}
              className="flex flex-col items-center gap-1 rounded-xl py-2.5 transition-all hover:scale-105" style={{background:"rgba(148,163,184,0.06)",border:"1px solid rgba(148,163,184,0.1)"}}>
              <span className="text-base">🔗</span><span className="text-[9px] font-bold text-slate-600">Copy</span>
            </button>
          </div>

          {/* Contact table */}
          {sorted.length>0&&(
            <div style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
              <p className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700">Contact</p>
              {sorted.map((c,i)=>{
                const m=CT[c.type];
                return(
                  <a key={i} href={m?m.href(c.value):"#"} target={c.type==="website"?"_blank":undefined} rel={c.type==="website"?"noopener noreferrer":undefined}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]" style={{borderBottom:i<sorted.length-1?"1px solid rgba(148,163,184,0.05)":undefined}}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{m?.emoji??"📋"}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-700">{c.label??m?.label??c.type}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">{c.value}</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Skills */}
          {skills&&skills.length>0&&(
            <div className="px-5 py-4" style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-700">Skills</p>
              <div className="grid grid-cols-2 gap-1.5">
                {skills.map((s2,i)=>(
                  <div key={i} className="rounded-lg px-2.5 py-2" style={{background:"rgba(148,163,184,0.05)",border:"1px solid rgba(148,163,184,0.08)"}}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{s2.name}</span>
                      {s2.level!==undefined&&<span className="text-[10px] font-mono text-slate-600">{s2.level}</span>}
                    </div>
                    {s2.level!==undefined&&<div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-900"><div className="h-full rounded-full" style={{width:`${s2.level}%`,background:`linear-gradient(90deg,${s},#64748b)`}}/></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social */}
          {socialLinks.length>0&&(
            <div className="px-5 py-4" style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700">Online</p>
              <div className="flex flex-wrap gap-1.5">
                {socialLinks.map((sl,i)=>(
                  <a key={i} href={sl.url} target="_blank" rel="noopener noreferrer"
                    className="rounded px-2.5 py-1.5 text-xs font-mono text-slate-500 transition-colors hover:text-white" style={{background:"rgba(148,163,184,0.06)",border:"1px solid rgba(148,163,184,0.1)"}}>
                    {sl.label ? sl.label : sl.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {featuredQuote&&<div className="px-5 py-4" style={{borderBottom:"1px solid rgba(148,163,184,0.08)"}}><p className="text-xs leading-relaxed text-slate-600 italic">&ldquo;{featuredQuote}&rdquo;</p></div>}

          <div className="flex items-center justify-between px-5 py-3" style={{background:"rgba(148,163,184,0.03)",borderTop:"1px solid rgba(148,163,184,0.08)"}}>
            <span className="font-mono text-[10px] text-slate-800">PRESENCECARD</span>
            <span className="font-mono text-[10px] text-slate-800">v2.0</span>
          </div>
        </div>
      </div>
    </main>
  );
}