// PRISM — Spectrum gradients, skill bars, universal persona
"use client";
import type { DigitalNameCardData } from "@/lib/validators/template-schemas";
import { AvatarZoom } from "@/components/templates/avatar-zoom";

interface Props { data: DigitalNameCardData; accentColor?: string; }

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

const SPECTRUM=["#6366f1","#8b5cf6","#a855f7","#ec4899","#f43f5e","#f97316","#f59e0b","#22c55e","#06b6d4","#0ea5e9"];
const CT: Record<string,{emoji:string;href:(v:string)=>string}> = {
  phone:{emoji:"📱",href:v=>`tel:${v.replace(/\s/g,"")}`},
  email:{emoji:"✉️",href:v=>`mailto:${v}`},
  whatsapp:{emoji:"💬",href:v=>`https://wa.me/${v.replace(/[^0-9+]/g,"")}`},
  viber:{emoji:"📲",href:v=>`viber://chat?number=${v.replace(/[^0-9+]/g,"")}`},
  telegram:{emoji:"✈️",href:v=>`https://t.me/${v.replace("@","")}`},
  website:{emoji:"🌐",href:v=>v.startsWith("http")?v:`https://${v}`},
  address:{emoji:"📍",href:v=>`https://maps.google.com/?q=${encodeURIComponent(v)}`},
};
const SP_COLORS: Record<string,string>={linkedin:"#0077b5",twitter:"#ffffff",instagram:"#e1306c",facebook:"#1877f2",youtube:"#ff5555",tiktok:"#69c9d0",whatsapp:"#25d366",telegram:"#2aabee",viber:"#7360f2",discord:"#5865f2",website:"#a78bfa",behance:"#1769ff",dribbble:"#ea4c89",medium:"#ffffff"};
const PRIORITY=["phone","email","whatsapp","viber","telegram","website","address"];

export function PrismNameCard({ data, accentColor="#a855f7" }: Props) {
  const {fullName,jobTitle,company,avatarUrl,bio,tagline,contacts,socialLinks,skills}=data;
  const sorted=[...contacts].sort((a,b)=>{const ai=PRIORITY.indexOf(a.type),bi=PRIORITY.indexOf(b.type);return(ai<0?99:ai)-(bi<0?99:bi);});

  return (
    <main className="min-h-screen" style={{background:"linear-gradient(160deg,#05001a,#000d1a 50%,#0a0005)"}}>
      {/* Spectrum bar */}
      <div className="h-1" style={{background:`linear-gradient(90deg,${SPECTRUM.join(",")})`}} />

      <div className="mx-auto max-w-sm px-4 py-8">
        {/* Hero card */}
        <div className="mb-4 overflow-hidden rounded-3xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div className="relative h-20 overflow-hidden" style={{background:`linear-gradient(135deg,${SPECTRUM[0]}40,${SPECTRUM[4]}30,${SPECTRUM[8]}25)`}}>
            <div className="absolute inset-0 opacity-25" style={{backgroundImage:`repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.02) 8px,rgba(255,255,255,0.02) 9px)`}} />
          </div>
          <div className="-mt-10 px-5 pb-5 relative" style={{zIndex:10}}>
            <div className="mb-3 w-fit" style={{padding:"2px",background:`linear-gradient(135deg,${SPECTRUM[0]},${SPECTRUM[4]},${SPECTRUM[8]})`,borderRadius:"16px"}}>
              <div className="overflow-hidden rounded-[14px] h-[68px] w-[68px]">
                {avatarUrl?<AvatarZoom src={avatarUrl} alt={fullName} className="h-full w-full" />:
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white" style={{background:`linear-gradient(135deg,${accentColor},#06b6d4)`}}>{fullName.charAt(0)}</div>}
              </div>
            </div>
            <h1 className="text-xl font-black text-white">{fullName}</h1>
            <p className="text-sm font-semibold" style={{background:`linear-gradient(90deg,${accentColor},#06b6d4)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{jobTitle}</p>
            <p className="text-xs text-white/40">{company}</p>
            {tagline&&<p className="mt-2 text-xs text-white/50 italic">&ldquo;{tagline}&rdquo;</p>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button onClick={()=>saveVCard(data)} className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-all hover:scale-105" style={{background:`${accentColor}20`,border:`1px solid ${accentColor}35`}}>
            <span className="text-lg">👤</span><span className="text-[10px] font-bold text-white/70">Save Contact</span>
          </button>
          <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);}}
            className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-all hover:scale-105" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <span className="text-lg">🔗</span><span className="text-[10px] font-bold text-white/70">Copy Link</span>
          </button>
        </div>

        {bio&&<div className="mb-4 rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}><p className="text-xs leading-relaxed text-white/55">{bio}</p></div>}

        {/* Contacts */}
        {sorted.length>0&&(
          <div className="mb-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Contact</p>
            {sorted.map((c,i)=>{
              const m=CT[c.type];const color=SPECTRUM[i%SPECTRUM.length];
              return(
                <a key={i} href={m?m.href(c.value):"#"} target={c.type==="website"?"_blank":undefined} rel={c.type==="website"?"noopener noreferrer":undefined}
                  className="flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{background:color}}/>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider" style={{color}}>{c.label??c.type}</p>
                    <p className="truncate text-sm text-white/80 font-medium">{c.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Skill bars */}
        {skills&&skills.length>0&&(
          <div className="mb-4 rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/25">Expertise</p>
            <div className="space-y-2.5">
              {skills.slice(0,6).map((s,i)=>(
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-white/70">{s.name}</span>
                    {s.level!==undefined&&<span className="text-xs font-bold text-white/40">{s.level}%</span>}
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{width:`${s.level??80}%`,background:`linear-gradient(90deg,${SPECTRUM[i%SPECTRUM.length]},${SPECTRUM[(i+3)%SPECTRUM.length]})`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social grid */}
        {socialLinks.length>0&&(
          <div className="mb-4 grid grid-cols-2 gap-2">
            {socialLinks.map((s,i)=>{
              const color=SP_COLORS[s.platform]??"#a78bfa";
              return(
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.02]"
                  style={{background:`${color}12`,border:`1px solid ${color}25`}}>
                  <div className="h-2 w-2 rounded-full" style={{background:color}}/>
                  <span className="text-xs font-medium text-white/70 truncate">{s.label ? s.label : s.platform}</span>
                </a>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center text-[10px] text-white/15">NEX CARD</p>
      </div>
    </main>
  );
}