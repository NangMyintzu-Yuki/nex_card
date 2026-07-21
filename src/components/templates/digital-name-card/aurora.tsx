// src/components/templates/digital-name-card/aurora.tsx
// AURORA — Premium glassmorphism digital name card / Universal persona design

"use client";
import { useState } from "react";
import Image from "next/image";
import type { DigitalNameCardData } from "@/lib/validators/template-schemas";

interface Props { data: DigitalNameCardData; accentColor?: string; }

// ── vCard builder (RFC 6350) — #1 feature per industry research ────────────
function buildVCard(d: DigitalNameCardData): string {
  return [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${d.fullName}`,
    d.jobTitle ? `TITLE:${d.jobTitle}` : null,
    d.company   ? `ORG:${d.company}` : null,
    ...d.contacts.map(c => {
      if (c.type === "email")   return `EMAIL;TYPE=INTERNET:${c.value}`;
      if (c.type === "phone")   return `TEL;TYPE=CELL:${c.value}`;
      if (c.type === "website") return `URL:${c.value.startsWith("http") ? c.value : "https://" + c.value}`;
      if (c.type === "address") return `ADR:;;${c.value};;;;`;
      return null;
    }),
    ...d.socialLinks.map(s => `URL;TYPE=${s.platform.toUpperCase()}:${s.url}`),
    d.avatarUrl ? `PHOTO;VALUE=URI:${d.avatarUrl}` : null,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

function saveVCard(d: DigitalNameCardData) {
  const blob = new Blob([buildVCard(d)], { type: "text/vcard;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${d.fullName.replace(/\s+/g, "_")}.vcf` });
  a.click();
  URL.revokeObjectURL(url);
}

async function nativeShare(d: DigitalNameCardData) {
  const url = window.location.href;
  const phone = d.contacts.find(c => c.type === "phone")?.value ?? "";
  const email = d.contacts.find(c => c.type === "email")?.value ?? "";
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${d.fullName}${d.jobTitle ? " — " + d.jobTitle : ""}`,
        text: [d.fullName, d.company, phone, email].filter(Boolean).join("\n"),
        url,
      });
    } catch { /* cancelled */ }
  } else {
    await navigator.clipboard?.writeText(url);
  }
}

// ── Social platform config ──────────────────────────────────────────────────
const SP: Record<string, { label: string; bg: string; text: string; emoji: string }> = {
  whatsapp:      { label: "WhatsApp",  bg: "#25d36620", text: "#25d366", emoji: "💬" },
  telegram:      { label: "Telegram",  bg: "#2aabee20", text: "#2aabee", emoji: "✈️"  },
  viber:         { label: "Viber",     bg: "#7360f220", text: "#7360f2", emoji: "📲" },
  linkedin:      { label: "LinkedIn",  bg: "#0077b520", text: "#0077b5", emoji: "💼" },
  twitter:       { label: "X / Twitter", bg: "#ffffff15", text: "#ffffff", emoji: "𝕏" },
  instagram:     { label: "Instagram", bg: "#e1306c20", text: "#e1306c", emoji: "📸" },
  facebook:      { label: "Facebook",  bg: "#1877f220", text: "#1877f2", emoji: "👥" },
  youtube:       { label: "YouTube",   bg: "#ff000020", text: "#ff5555", emoji: "▶️"  },
  tiktok:        { label: "TikTok",    bg: "#69c9d020", text: "#69c9d0", emoji: "🎵" },
  snapchat:      { label: "Snapchat",  bg: "#fffc0020", text: "#d4c800", emoji: "👻" },
  discord:       { label: "Discord",   bg: "#5865f220", text: "#5865f2", emoji: "🎮" },
  twitch:        { label: "Twitch",    bg: "#9146ff20", text: "#9146ff", emoji: "🟣" },
  pinterest:     { label: "Pinterest", bg: "#e6002320", text: "#e60023", emoji: "📌" },
  behance:       { label: "Behance",   bg: "#1769ff20", text: "#1769ff", emoji: "🅱️"  },
  dribbble:      { label: "Dribbble",  bg: "#ea4c8920", text: "#ea4c89", emoji: "🏀" },
  medium:        { label: "Medium",    bg: "#ffffff15", text: "#ffffff", emoji: "📝" },
  website:       { label: "Website",   bg: "#a78bfa20", text: "#a78bfa", emoji: "🌐" },
};

// ── Contact type config ─────────────────────────────────────────────────────
const CT: Record<string, { label: string; emoji: string; href: (v: string) => string }> = {
  phone:    { label: "Phone",    emoji: "📱", href: v => `tel:${v.replace(/\s/g, "")}` },
  email:    { label: "Email",    emoji: "✉️",  href: v => `mailto:${v}` },
  whatsapp: { label: "WhatsApp", emoji: "💬", href: v => `https://wa.me/${v.replace(/[^0-9+]/g, "")}` },
  viber:    { label: "Viber",    emoji: "📲", href: v => `viber://chat?number=${v.replace(/[^0-9+]/g, "")}` },
  telegram: { label: "Telegram", emoji: "✈️",  href: v => v.startsWith("@") ? `https://t.me/${v.slice(1)}` : `https://t.me/${v}` },
  skype:    { label: "Skype",    emoji: "💻", href: v => `skype:${v}?chat` },
  website:  { label: "Website",  emoji: "🌐", href: v => v.startsWith("http") ? v : `https://${v}` },
  address:  { label: "Address",  emoji: "📍", href: v => `https://maps.google.com/?q=${encodeURIComponent(v)}` },
};

const CONTACT_PRIORITY = ["phone","email","whatsapp","viber","telegram","website","skype","address"];

export function AuroraNameCard({ data, accentColor = "#6366f1" }: Props) {
  const [copied, setCopied] = useState(false);
  const { fullName, jobTitle, company, companyLogoUrl,
    tagline, bio, avatarUrl, contacts, socialLinks, skills, featuredQuote } = data;

  const sortedContacts = [...contacts].sort((a, b) => {
    const ai = CONTACT_PRIORITY.indexOf(a.type), bi = CONTACT_PRIORITY.indexOf(b.type);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  return (
    <main className="min-h-screen w-full" style={{
      background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${accentColor}35 0%, transparent 60%),
                   radial-gradient(ellipse 50% 40% at 90% 90%, #06b6d420 0%, transparent 50%),
                   linear-gradient(160deg, #050508 0%, #080812 100%)`,
    }}>
      <div className="mx-auto max-w-sm px-4 py-8">

        {/* Card */}
        <div className="overflow-hidden rounded-3xl" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: `0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}>

          {/* Hero band */}
          <div className="relative h-28 overflow-hidden" style={{
            background: `linear-gradient(135deg, ${accentColor}70, ${accentColor}25 45%, #06b6d430)`,
          }}>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(${accentColor}50 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }} />
            {companyLogoUrl && (
              <div className="absolute bottom-3 right-4">
                <Image src={companyLogoUrl} alt={company} width={80} height={28}
                  className="h-7 w-auto object-contain brightness-0 invert opacity-70" />
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="-mt-14 px-5">
            <div className="mb-3 w-fit">
              <div className="h-[88px] w-[88px] overflow-hidden rounded-2xl ring-4 ring-neutral-950"
                style={{ outline: `2px solid ${accentColor}` }}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={fullName} width={88} height={88} className="h-full w-full object-cover" priority />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #06b6d4)` }}>
                    {fullName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-black leading-tight text-white">
              {fullName}
            </h1>
            <p className="text-sm font-semibold" style={{ color: accentColor }}>{jobTitle}</p>
            <p className="text-xs text-white/45">{company}</p>
            {tagline && <p className="mt-2 text-[13px] leading-relaxed text-white/55 italic">&ldquo;{tagline}&rdquo;</p>}
          </div>

          {/* ── ACTION BUTTONS ─────────────────────────────────────── */}
          <div className="mt-4 grid grid-cols-3 gap-2 px-5">
            <button onClick={() => saveVCard(data)}
              className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-all hover:scale-105 active:scale-95"
              style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}35` }}>
              <span className="text-xl">👤</span>
              <span className="text-[10px] font-bold text-white/70">Save Contact</span>
            </button>
            <button onClick={() => nativeShare(data)}
              className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="text-xl">📤</span>
              <span className="text-[10px] font-bold text-white/70">Share</span>
            </button>
            <button onClick={async () => {
              await navigator.clipboard?.writeText(window.location.href);
              setCopied(true); setTimeout(() => setCopied(false), 2000);
            }}
              className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="text-xl">{copied ? "✅" : "🔗"}</span>
              <span className="text-[10px] font-bold text-white/70">{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 my-4 h-px" style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
          }} />

          {bio && <p className="px-5 pb-2 text-[13px] leading-relaxed text-white/60">{bio}</p>}

          {/* ── CONTACTS ───────────────────────────────────────────── */}
          {sortedContacts.length > 0 && (
            <div className="mt-2 space-y-2 px-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Contact</p>
              {sortedContacts.map((c, i) => {
                const m = CT[c.type];
                const href = m ? m.href(c.value) : "#";
                return (
                  <a key={i} href={href}
                    target={c.type === "website" ? "_blank" : undefined}
                    rel={c.type === "website" ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.01]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-lg shrink-0">{m?.emoji ?? "📋"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-white/30">{c.label ?? m?.label ?? c.type}</p>
                      <p className="truncate text-[13px] font-medium text-white/80">{c.value}</p>
                    </div>
                    <svg className="shrink-0 text-white/20 group-hover:text-white/50 transition-colors"
                      width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}

          {/* ── SOCIAL LINKS ────────────────────────────────────────── */}
          {socialLinks.length > 0 && (
            <div className="mt-5 px-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Social & Online</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s, i) => {
                  const m = SP[s.platform] ?? { label: s.platform, bg: "#ffffff10", text: "#ffffff80", emoji: "🔗" };
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
                      style={{ background: m.bg, border: `1px solid ${m.text}25`, color: m.text }}>
                      <span>{m.emoji}</span>
                      {s.label ?? m.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="mt-5 px-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-xs text-white/65"
                    style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
                    {s.name}{s.level !== undefined && ` · ${s.level}%`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {featuredQuote && (
            <div className="mx-5 mt-5 rounded-xl px-4 py-3"
              style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}20` }}>
              <p className="text-[13px] leading-relaxed text-white/60 italic">&ldquo;{featuredQuote}&rdquo;</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3.5">
            <span className="text-[10px] text-white/20">NEX CARD</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-white/30">Active</span>
            </div>
          </div>
        </div>

        {/* Sticky save CTA */}
        <div className="mt-4 text-center">
          <button onClick={() => saveVCard(data)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-black shadow-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #06b6d4)`, boxShadow: `0 8px 24px ${accentColor}40` }}>
            💾 Save to Contacts
          </button>
          <p className="mt-2 text-[10px] text-white/25">Downloads a .vcf file — works on iPhone & Android</p>
        </div>
      </div>
    </main>
  );
}