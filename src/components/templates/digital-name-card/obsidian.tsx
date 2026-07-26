// src/components/templates/digital-name-card/obsidian.tsx
// OBSIDIAN — Editorial brutalism. Dark, bold, full contact suite. Suits all professionals.

"use client";
import type { DigitalNameCardData } from "@/lib/validators/template-schemas";
import { AvatarZoom } from "@/components/templates/avatar-zoom";

interface Props {
  data: DigitalNameCardData;
  accentColor?: string;
}

function buildVCard(d: DigitalNameCardData) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${d.fullName}`,
    d.jobTitle ? `TITLE:${d.jobTitle}` : null,
    d.company ? `ORG:${d.company}` : null,
    ...d.contacts.map((c) =>
      c.type === "email"
        ? `EMAIL:${c.value}`
        : c.type === "phone"
          ? `TEL;TYPE=CELL:${c.value}`
          : c.type === "website"
            ? `URL:${c.value.startsWith("http") ? c.value : "https://" + c.value}`
            : null
    ),
    ...d.socialLinks.map((s) => `URL;TYPE=${s.platform.toUpperCase()}:${s.url}`),
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function saveVCard(d: DigitalNameCardData) {
  const blob = new Blob([buildVCard(d)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), {
    href: url,
    download: `${d.fullName.replace(/\s+/g, "_")}.vcf`,
  }).click();
  URL.revokeObjectURL(url);
}

const CT: Record<string, { label: string; emoji: string; href: (v: string) => string }> = {
  phone: { label: "Phone", emoji: "📱", href: (v) => `tel:${v.replace(/\s/g, "")}` },
  email: { label: "Email", emoji: "✉️", href: (v) => `mailto:${v}` },
  whatsapp: {
    label: "WhatsApp",
    emoji: "💬",
    href: (v) => `https://wa.me/${v.replace(/[^0-9+]/g, "")}`,
  },
  viber: {
    label: "Viber",
    emoji: "📲",
    href: (v) => `viber://chat?number=${v.replace(/[^0-9+]/g, "")}`,
  },
  telegram: { label: "Telegram", emoji: "✈️", href: (v) => `https://t.me/${v.replace("@", "")}` },
  website: {
    label: "Website",
    emoji: "🌐",
    href: (v) => (v.startsWith("http") ? v : `https://${v}`),
  },
  address: {
    label: "Address",
    emoji: "📍",
    href: (v) => `https://maps.google.com/?q=${encodeURIComponent(v)}`,
  },
};

const SP: Record<string, string> = {
  linkedin: "#0077b5",
  twitter: "#ffffff",
  instagram: "#e1306c",
  facebook: "#1877f2",
  youtube: "#ff5555",
  tiktok: "#69c9d0",
  whatsapp: "#25d366",
  telegram: "#2aabee",
  viber: "#7360f2",
  discord: "#5865f2",
  website: "#a78bfa",
  behance: "#1769ff",
  dribbble: "#ea4c89",
  medium: "#ffffff",
};

const PRIORITY = ["phone", "email", "whatsapp", "viber", "telegram", "website", "address"];

export function ObsidianNameCard({ data, accentColor = "#f59e0b" }: Props) {
  const {
    fullName,
    jobTitle,
    company,
    avatarUrl,
    bio,
    tagline,
    contacts,
    socialLinks,
    skills,
    featuredQuote,
  } = data;

  const sorted = [...(contacts ?? [])].sort((a, b) => {
    const ai = PRIORITY.indexOf(a.type),
      bi = PRIORITY.indexOf(b.type);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  return (
    <main
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: "'Space Grotesk',system-ui,sans-serif" }}
    >
      <div className="mx-auto max-w-sm px-4 py-10">
        {/* Accent rule */}
        <div className="mb-6 h-1 w-14 rounded-full" style={{ background: accentColor }} />

        {/* Identity */}
        <div className="mb-6 flex items-start gap-4">
          {avatarUrl && (
            <div
              className="contrast-110 h-20 w-20 shrink-0 overflow-hidden grayscale"
              style={{ outline: `2px solid ${accentColor}` }}
            >
              <AvatarZoom
                src={avatarUrl}
                alt={fullName}
                className="h-full w-full"
                imageClassName="contrast-110 grayscale"
              />
            </div>
          )}
          <div>
            {company && (
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">
                {company}
              </p>
            )}
            <h1 className="text-3xl font-black leading-none tracking-tighter text-white">
              {fullName}
            </h1>
            {jobTitle && (
              <p
                className="mt-1 text-sm font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                {jobTitle}
              </p>
            )}
          </div>
        </div>

        {/* Tagline */}
        {tagline && (
          <p
            className="mb-5 border-l-2 pl-4 text-sm italic text-neutral-500"
            style={{ borderColor: accentColor }}
          >
            {tagline}
          </p>
        )}
        {bio && <p className="mb-5 text-sm leading-relaxed text-neutral-500">{bio}</p>}

        {/* Action row */}
        <div className="mb-5">
          <button
            onClick={() => saveVCard(data)}
            className="w-full py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:opacity-90"
            style={{ background: accentColor }}
          >
            💾 Save Contact
          </button>
        </div>

        <div className="mb-5 h-px bg-neutral-900" />

        {/* Contacts */}
        {sorted.length > 0 && (
          <div className="mb-5 space-y-px">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-800">
              Contact
            </p>
            {sorted.map((c, i) => {
              const m = CT[c.type];
              return (
                <a
                  key={i}
                  href={m ? m.href(c.value) : "#"}
                  target={c.type === "website" ? "_blank" : undefined}
                  rel={c.type === "website" ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between py-3 transition-opacity hover:opacity-70"
                  style={{ borderBottom: "1px solid #111" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{m?.emoji ?? "📋"}</span>
                    <span className="text-xs uppercase tracking-wider text-neutral-700">
                      {c.label ?? m?.label ?? c.type}
                    </span>
                  </div>
                  <span className="text-right text-sm font-medium text-white">{c.value}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Social */}
        {socialLinks && socialLinks.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-800">
              Social & Online
            </p>
            <div className="flex flex-wrap gap-1.5">
              {socialLinks.map((s, i) => {
                const baseColor = SP[s.platform] ?? "#a78bfa";
                return (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                    style={{ 
                      borderColor: `${baseColor}40`, 
                      color: baseColor as React.CSSProperties["color"] 
                    }}
                  >
                    {s.label ? s.label : s.platform}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-800">
              Expertise
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="border border-neutral-900 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-500"
                >
                  {s.name}
                  {s.level !== undefined && (
                    <span className="ml-1 font-bold text-white">{s.level}%</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        {featuredQuote && (
          <div className="mb-5">
            <p className="text-xl font-black italic leading-tight text-white">
              “{featuredQuote}”
            </p>
          </div>
        )}

        <div className="mb-5 h-px bg-neutral-900" />

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-900">
          NEX CARD
        </p>
      </div>
    </main>
  );
}