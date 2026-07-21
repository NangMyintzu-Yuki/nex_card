// CORAL — Warm, approachable, bio-link layout. For all professionals and freelancers.
"use client";
import { useState } from "react";
import Image from "next/image";
import type { DigitalNameCardData } from "@/lib/validators/template-schemas";

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

const CT: Record<string,{emoji:string;label:string;href:(v:string)=>string}> = {
  phone:{emoji:"📱",label:"Phone",href:v=>`tel:${v.replace(/\s/g,"")}`},
  email:{emoji:"✉️",label:"Email",href:v=>`mailto:${v}`},
  whatsapp:{emoji:"💬",label:"WhatsApp",href:v=>`https://wa.me/${v.replace(/[^0-9+]/g,"")}`},
  viber:{emoji:"📲",label:"Viber",href:v=>`viber://chat?number=${v.replace(/[^0-9+]/g,"")}`},
  telegram:{emoji:"✈️",label:"Telegram",href:v=>`https://t.me/${v.replace("@","")}`},
  website:{emoji:"🌐",label:"Website",href:v=>v.startsWith("http")?v:`https://${v}`},
  address:{emoji:"📍",label:"Address",href:v=>`https://maps.google.com/?q=${encodeURIComponent(v)}`},
};
const SOCIAL_EMOJI: Record<string,string>={linkedin:"💼",twitter:"𝕏",instagram:"📸",facebook:"👥",youtube:"▶️",tiktok:"🎵",whatsapp:"💬",telegram:"✈️",viber:"📲",discord:"🎮",website:"🌐",behance:"🎨",dribbble:"🏀",medium:"📝",snapchat:"👻",pinterest:"📌"};
const PRIORITY=["phone","email","whatsapp","viber","telegram","website","address"];

export function CoralNameCard({ data, accentColor="#f97316" }: Props) {
  const [copied,setCopied]=useState(false);
  const {fullName,jobTitle,company,avatarUrl,bio,tagline,contacts,socialLinks,skills,featuredQuote}=data;
  const sorted=[...contacts].sort((a,b)=>{const ai=PRIORITY.indexOf(a.type),bi=PRIORITY.indexOf(b.type);return(ai<0?99:ai)-(bi<0?99:bi);});
  const w1=accentColor,w2="#dc2626";

  return (
    <main className="min-h-screen" style={{background:`radial-gradient(ellipse 100% 60% at 50% 0%,${w1}20,transparent 60%),linear-gradient(180deg,#120500,#0a0200)`}}>
      <div className="mx-auto max-w-sm px-4 py-10">
        {/* Avatar centred */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-4 relative">
            <div className="h-24 w-24 overflow-hidden rounded-full" style={{padding:"3px",background:`linear-gradient(135deg,${w1},${w2})`,boxShadow:`0 0 40px ${w1}50`}}>
              <div className="h-full w-full overflow-hidden rounded-full">
                {avatarUrl?<Image src={avatarUrl} alt={fullName} width={90} height={90} className="h-full w-full object-cover" priority/>:
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white" style={{background:`linear-gradient(135deg,${w1},${w2})`}}>{fullName.charAt(0)}</div>}
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">{fullName}</h1>
          <p className="mt-0.5 text-sm font-semibold" style={{color:w1}}>{jobTitle}</p>
          <p className="text-xs text-white/40">{company}</p>
          {tagline&&<p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">{tagline}</p>}
          {bio&&<p className="mt-2 max-w-xs text-xs leading-relaxed text-white/40">{bio}</p>}
        </div>

        {/* Quote */}
        {featuredQuote&&(
          <div className="mb-5 rounded-2xl px-5 py-4 text-center" style={{background:`${w1}15`,border:`1px solid ${w1}25`}}>
            <p className="text-sm leading-relaxed text-white/70 italic">&ldquo;{featuredQuote}&rdquo;</p>
          </div>
        )}

        {/* PRIMARY: Save Contact */}
        <button onClick={()=>saveVCard(data)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all hover:opacity-90 active:scale-95"
          style={{background:`linear-gradient(135deg,${w1},${w2})`,boxShadow:`0 8px 28px ${w1}40`}}>
          💾 Save to Contacts
        </button>

        {/* Share row */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <button onClick={()=>{if(navigator.share){navigator.share({title:fullName,url:window.location.href}).catch(()=>{});}else{navigator.clipboard?.writeText(window.location.href);}}}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white/70 transition-all hover:text-white" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
            📤 Share
          </button>
          <button onClick={()=>{navigator.clipboard?.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white/70 transition-all hover:text-white" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
            {copied?"✅ Copied":"🔗 Copy Link"}
          </button>
        </div>

        {/* Contact pills */}
        {sorted.length>0&&(
          <div className="mb-4 space-y-2">
            {sorted.map((c,i)=>{
              const m=CT[c.type];
              return(
                <a key={i} href={m?m.href(c.value):"#"} target={c.type==="website"?"_blank":undefined} rel={c.type==="website"?"noopener noreferrer":undefined}
                  className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 transition-all hover:scale-[1.02]" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <span className="text-xl">{m?.emoji??"📋"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/30">{c.label??m?.label??c.type}</p>
                    <p className="truncate text-sm font-medium text-white/80">{c.value}</p>
                  </div>
                  <svg className="shrink-0 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              );
            })}
          </div>
        )}

        {/* Social grid 2-col */}
        {socialLinks.length>0&&(
          <div className="mb-4 grid grid-cols-2 gap-2">
            {socialLinks.map((s,i)=>(
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.02]" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <span className="text-base">{SOCIAL_EMOJI[s.platform]??"🔗"}</span>
                <span className="text-xs font-medium text-white/65 truncate">{s.label??s.platform}</span>
              </a>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills&&skills.length>0&&(
          <div className="mb-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {skills.map((s,i)=>(
                <span key={i} className="rounded-full px-3 py-1 text-xs text-white/65" style={{background:`${w1}18`,border:`1px solid ${w1}30`}}>
                  {s.name}{s.level!==undefined&&` ${s.level}%`}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-[10px] text-white/15">NEX CARD</p>
      </div>
    </main>
  );
}