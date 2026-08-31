// src/components/profile-editors/field-editors.tsx
// Shared array field editors used by both dashboard and admin profile editors

"use client";

import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";

// ── Image Upload ────────────────────────────────────────────────────────────

export function ImageUploadField({
  value,
  onChange,
  placeholder = "https://...",
  folder = "avatars",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: "avatars" | "gallery" | "logos" | "og-images";
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [tab, setTab] = useState<"upload" | "camera" | "url">("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function deleteOldImage(url: string) {
    if (!url || !url.startsWith("http")) return;
    fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => {});
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP, AVIF, or GIF files are accepted.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("File must be under 8 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? err.message ?? "Upload failed");
      }

      const data = await res.json();
      const newUrl = data.publicUrl ?? data.url;

      if (value && value !== newUrl) {
        deleteOldImage(value);
      }

      onChange(newUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const inputCls = "nc-input w-full px-2 py-1.5 sm:px-3 sm:py-2.5 text-sm";

  return (
    <div className="space-y-2">
      <div className="flex gap-1 nc-card rounded-xl p-1">
        {(["upload", "camera", "url"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === t ? "bg-indigo-500 text-white shadow" : "nc-btn-ghost"
            }`}>
            {t === "upload" ? "Upload" : t === "camera" ? "Camera" : "URL"}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFile} className="hidden" />
          <label onClick={() => inputRef.current?.click()}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-sm transition-all cursor-pointer ${
              uploading
                ? "border-indigo-500/30 bg-indigo-500/5 text-indigo-400"
                : "nc-btn-ghost border-dashed hover:border-indigo-500/30 hover:text-indigo-400"
            }`}>
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                Uploading...
              </>
            ) : (
              <>Click to upload image (JPG, PNG, WebP - max 8 MB)</>
            )}
          </label>
        </div>
      ) : tab === "camera" ? (
        <div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => cameraRef.current?.click()}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-sm transition-all ${
              uploading
                ? "border-indigo-500/30 bg-indigo-500/5 text-indigo-400"
                : "nc-btn-ghost border-dashed hover:border-indigo-500/30 hover:text-indigo-400"
            }`}
            disabled={uploading}>
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                Uploading...
              </>
            ) : (
              <>Take a photo with your camera</>
            )}
          </button>
        </div>
      ) : (
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={inputCls} />
      )}

      {value && (
        <div className="nc-card flex items-center gap-3 rounded-xl p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg" style={{ border: "1px solid var(--nc-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs" style={{ color: "var(--nc-text-2)" }}>{value}</p>
            <p className="text-xs text-emerald-400 mt-0.5">Image set</p>
          </div>
          <button type="button" onClick={() => { deleteOldImage(value); onChange(""); }}
            className="nc-btn-ghost shrink-0 rounded-lg px-2 py-1 text-xs hover:border-red-500/30 hover:text-red-400 transition-colors">
            Clear
          </button>
        </div>
      )}

      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
    </div>
  );
}

// ── Contacts ────────────────────────────────────────────────────────────────

export function ContactsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const contacts = (value as Array<Record<string, string>>) ?? [];
  const TYPES = ["email", "phone", "website", "address"];
  const TYPE_LABELS: Record<string, string> = { email: "Email", phone: "Phone", website: "Website", address: "Address" };

  function setType(index: number, type: string) {
    const n = [...contacts];
    n[index] = { ...n[index], type };
    onChange(n);
  }

  function clearType(index: number) {
    const n = [...contacts];
    n[index] = { ...n[index], type: "", value: "" };
    onChange(n);
  }

  return (
    <div className="space-y-1.5">
      {contacts.map((c, i) => {
        const usedTypes = new Set(contacts.filter((_, j) => j !== i).map((x) => x.type).filter(Boolean));
        const availableTypes = TYPES.filter((t) => !usedTypes.has(t));
        return (
          <div key={i} className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5" style={{ borderColor: "var(--nc-border)", background: "var(--nc-surface)" }}>
            {c.type ? (
              <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 shrink-0">
                {TYPE_LABELS[c.type] ?? c.type}
                <button type="button" onClick={() => clearType(i)}
                  className="text-indigo-400/50 hover:text-red-400 transition-colors">&times;</button>
              </span>
            ) : (
              <select value="" onChange={(e) => setType(i, e.target.value)}
                className="rounded-lg px-1.5 py-1.5 text-xs w-20 shrink-0 nc-input">
                <option value="" disabled>Type...</option>
                {availableTypes.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>)}
              </select>
            )}
            <input value={c.value ?? ""} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], value: e.target.value }; onChange(n); }}
              placeholder={c.type === "email" ? "you@example.com" : c.type === "phone" ? "+95 9xxx" : c.type === "website" ? "https://..." : "Address"}
              className="min-w-0 flex-1 nc-input rounded-lg px-2 py-1.5 text-xs" />
            <input value={c.label ?? ""} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
              placeholder="Label" className="w-16 shrink-0 nc-input rounded-lg px-2 py-1.5 text-xs hidden sm:block" />
            <button onClick={() => onChange(contacts.filter((_, j) => j !== i))} className="flex h-6 w-6 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      <button onClick={() => onChange([...contacts, { type: "", value: "", label: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Contact
      </button>
    </div>
  );
}

// ── Social Links ────────────────────────────────────────────────────────────

export function SocialLinksEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const links = (value as Array<Record<string, string>>) ?? [];
  const PLATFORMS = ["linkedin","github","twitter","instagram","facebook","youtube","tiktok","website","whatsapp","telegram","viber","discord"];
  const PLATFORM_ICONS: Record<string, string> = { linkedin:"L", github:"G", twitter:"X", instagram:"I", facebook:"F", youtube:"Y", tiktok:"T", whatsapp:"W", telegram:"T", viber:"V", discord:"D", website:"W" };
  const PLATFORM_PLACEHOLDERS: Record<string, string> = {
    linkedin: "https://linkedin.com/in/yourname",
    github: "https://github.com/yourname",
    twitter: "https://twitter.com/yourhandle",
    instagram: "https://instagram.com/yourname",
    facebook: "https://facebook.com/yourname",
    youtube: "https://youtube.com/@yourchannel",
    tiktok: "https://tiktok.com/@yourhandle",
    website: "https://yourwebsite.com",
    whatsapp: "https://wa.me/yournumber",
    telegram: "https://t.me/yourhandle",
    viber: "https://viber.me/yourname",
    discord: "https://discord.gg/invitecode",
  };

  function setPlatform(index: number, platform: string) {
    const n = [...links];
    n[index] = { ...n[index], platform };
    onChange(n);
  }

  function clearPlatform(index: number) {
    const n = [...links];
    n[index] = { ...n[index], platform: "", url: "" };
    onChange(n);
  }

  return (
    <div className="space-y-1.5">
      {links.map((l, i) => {
        const usedPlatforms = new Set(links.filter((_, j) => j !== i).map((x) => x.platform).filter(Boolean));
        const availablePlatforms = PLATFORMS.filter((p) => !usedPlatforms.has(p));
        return (
          <div key={i} className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5" style={{ borderColor: "var(--nc-border)", background: "var(--nc-surface)" }}>
            {l.platform ? (
              <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 shrink-0">
                {l.platform}
                <button type="button" onClick={() => clearPlatform(i)}
                  className="text-indigo-400/50 hover:text-red-400 transition-colors">&times;</button>
              </span>
            ) : (
              <select value="" onChange={(e) => setPlatform(i, e.target.value)}
                className="nc-input rounded-lg px-1.5 py-1.5 text-xs w-20 shrink-0">
                <option value="" disabled>Platform...</option>
                {availablePlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            <input value={l.url ?? ""} onChange={(e) => { const n = [...links]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && !v.startsWith("http://") && !v.startsWith("https://")) {
                  const n = [...links]; n[i] = { ...n[i], url: `https://${v}` }; onChange(n);
                }
              }}
              placeholder={l.platform ? PLATFORM_PLACEHOLDERS[l.platform] ?? "https://..." : "https://..."} className="min-w-0 flex-1 nc-input rounded-lg px-2 py-1.5 text-xs" />
            <input value={l.label ?? ""} onChange={(e) => { const n = [...links]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
              placeholder="Label" className="w-16 shrink-0 nc-input rounded-lg px-2 py-1.5 text-xs hidden sm:block" />
            <button onClick={() => onChange(links.filter((_, j) => j !== i))} className="flex h-6 w-6 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      <button onClick={() => onChange([...links, { platform: "", url: "", label: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Social Link
      </button>
    </div>
  );
}

// ── Skills ──────────────────────────────────────────────────────────────────

export function SkillsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const skills = (value as Array<Record<string, unknown>>) ?? [];
  return (
    <div className="space-y-2">
      {skills.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={String(s.name ?? "")} onChange={(e) => { const n = [...skills]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }}
            placeholder="Skill name" className="min-w-0 flex-1 nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
          <input type="number" min={1} max={100} value={Number(s.level ?? 80)} onChange={(e) => { const n = [...skills]; n[i] = { ...n[i], level: parseInt(e.target.value) }; onChange(n); }}
            className="nc-input w-14 shrink-0 rounded-lg px-2 py-2 text-sm text-center" />
          <span className="text-xs shrink-0" style={{ color: "var(--nc-text-3)" }}>%</span>
          <button onClick={() => onChange(skills.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...skills, { name: "", level: 80 }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Skill
      </button>
    </div>
  );
}

// ── Category Skills ─────────────────────────────────────────────────────────

export function CategorySkillsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const groups = (value as Array<{ category: string; items: string[] }>) ?? [];
  return (
    <div className="space-y-4">
      {groups.map((g, i) => (
        <div key={i} className="nc-card rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Category {i + 1}</span>
            <button onClick={() => onChange(groups.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <input value={g.category ?? ""} onChange={(e) => { const n = [...groups]; n[i] = { ...n[i], category: e.target.value }; onChange(n); }}
            placeholder="Category name (e.g. Frontend, Backend, Tools)" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
          <div className="space-y-1.5">
            {g.items.map((item, j) => (
              <div key={j} className="flex gap-2 items-center">
                <input value={item} onChange={(e) => { const n = [...groups]; const items = [...n[i].items]; items[j] = e.target.value; n[i] = { ...n[i], items }; onChange(n); }}
                  placeholder="Skill name" className="min-w-0 flex-1 nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
                <button onClick={() => { const n = [...groups]; n[i] = { ...n[i], items: n[i].items.filter((_, k) => k !== j) }; onChange(n); }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button onClick={() => { const n = [...groups]; n[i] = { ...n[i], items: [...n[i].items, ""] }; onChange(n); }}
              className="flex items-center gap-1 text-xs nc-btn-ghost rounded-lg px-2 py-1 hover:text-indigo-400 transition-colors">
              <Plus className="h-3 w-3" /> Add skill
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...groups, { category: "", items: [""] }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Category
      </button>
    </div>
  );
}

// ── Gallery ─────────────────────────────────────────────────────────────────

export function GalleryEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const images = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-3">
      {images.map((img, i) => (
        <div key={i} className="nc-card rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Photo {i + 1}</span>
            <button onClick={() => onChange(images.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <ImageUploadField value={img.url ?? ""} onChange={(url) => { const n = [...images]; n[i] = { ...n[i], url: url }; onChange(n); }}
            placeholder="Upload image or paste URL" folder="gallery" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={img.alt ?? ""} onChange={(e) => { const n = [...images]; n[i] = { ...n[i], alt: e.target.value }; onChange(n); }}
              placeholder="Alt text (e.g. 'First dance')" className="nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            <input value={img.label ?? ""} onChange={(e) => { const n = [...images]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
              placeholder="Label (e.g. 'Ceremony')" className="nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...images, { url: "", alt: "", label: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Photo
      </button>
    </div>
  );
}

// ── Milestones ──────────────────────────────────────────────────────────────

export function MilestonesEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const milestones = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className="nc-card rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Milestone {i + 1}</span>
            <button onClick={() => onChange(milestones.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Date *</label>
              <input type="date" value={m.date ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], date: e.target.value }; onChange(n); }}
                className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Title *</label>
              <input value={m.title ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
                placeholder="How We Met" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Location</label>
              <input value={m.location ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], location: e.target.value }; onChange(n); }}
                placeholder="Kuala Lumpur, Malaysia" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Emoji</label>
              <input value={m.emoji ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], emoji: e.target.value }; onChange(n); }}
                placeholder="Heart" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Story *</label>
            <textarea value={m.story ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], story: e.target.value }; onChange(n); }}
              placeholder="Tell the story of this milestone..." rows={3}
              className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Photo</label>
            <ImageUploadField value={m.imageUrl ?? ""} onChange={(url) => { const n = [...milestones]; n[i] = { ...n[i], imageUrl: url }; onChange(n); }}
              placeholder="Upload a photo or paste a URL" folder="gallery" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...milestones, { date: "", title: "", story: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Milestone
      </button>
    </div>
  );
}

// ── Events ──────────────────────────────────────────────────────────────────

export function EventsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const events = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="nc-card rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Event {i + 1}</span>
            <button onClick={() => onChange(events.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Event Name *</label>
              <input value={e.name ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], name: ev.target.value }; onChange(n); }}
                placeholder="Ceremony / Reception" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Date & Time *</label>
              <input type="datetime-local" value={(e.date ?? "").slice(0, 16)} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], date: ev.target.value ? new Date(ev.target.value).toISOString() : "" }; onChange(n); }}
                className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Venue *</label>
              <input value={e.venue ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], venue: ev.target.value }; onChange(n); }}
                placeholder="The Grand Ballroom" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Address *</label>
              <input value={e.address ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], address: ev.target.value }; onChange(n); }}
                placeholder="123 Wedding Lane, KL" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Dress Code</label>
              <input value={e.dressCode ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], dressCode: ev.target.value }; onChange(n); }}
                placeholder="Formal / Smart Casual" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Google Maps URL</label>
              <input value={e.googleMapsUrl ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], googleMapsUrl: ev.target.value }; onChange(n); }}
                placeholder="https://maps.google.com/..." className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Notes</label>
            <input value={e.notes ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], notes: ev.target.value }; onChange(n); }}
              placeholder="Additional notes..." className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...events, { name: "", date: "", venue: "", address: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Event
      </button>
    </div>
  );
}

// ── Services ────────────────────────────────────────────────────────────────

export function ServicesEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const services = (value as Array<Record<string, unknown>>) ?? [];
  return (
    <div className="space-y-3">
      {services.map((s, i) => (
        <div key={i} className="nc-card rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Service {i + 1}</span>
            <button onClick={() => onChange(services.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <input value={String(s.title ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
            placeholder="Service title" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
          <textarea value={String(s.description ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }}
            placeholder="Description" rows={2} className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm resize-none" />
          <div className="flex gap-2">
            <input value={String(s.price ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], price: e.target.value }; onChange(n); }}
              placeholder="Price (e.g. $99)" className="flex-1 nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={Boolean(s.highlighted)} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], highlighted: e.target.checked }; onChange(n); }} className="rounded" />
              <span className="text-xs" style={{ color: "var(--nc-text-2)" }}>Featured</span>
            </label>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...services, { title: "", description: "", highlighted: false }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Service
      </button>
    </div>
  );
}

// ── Projects ────────────────────────────────────────────────────────────────

export function ProjectsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const projects = (value as Array<Record<string, unknown>>) ?? [];
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({});

  function addProject() {
    const newId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    onChange([...projects, {
      id: newId, title: "", description: "", coverImageUrl: "", tags: [],
      liveUrl: "", repoUrl: "", caseStudyUrl: "", year: undefined, featured: false,
    }]);
  }

  function updateProject(index: number, updates: Record<string, unknown>) {
    const n = [...projects];
    n[index] = { ...n[index], ...updates };
    onChange(n);
  }

  function addTag(projectIndex: number) {
    const raw = tagInputs[projectIndex] ?? "";
    const tag = raw.trim();
    if (!tag) return;
    const current = (projects[projectIndex]?.tags as string[]) ?? [];
    if (current.includes(tag) || current.length >= 8) return;
    updateProject(projectIndex, { tags: [...current, tag] });
    setTagInputs((prev) => ({ ...prev, [projectIndex]: "" }));
  }

  function removeTag(projectIndex: number, tagIndex: number) {
    const current = (projects[projectIndex]?.tags as string[]) ?? [];
    updateProject(projectIndex, { tags: current.filter((_, j) => j !== tagIndex) });
  }

  return (
    <div className="space-y-4">
      {projects.map((p, i) => {
        const tags = (p.tags as string[]) ?? [];
        return (
          <div key={i} className="nc-card rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Project {i + 1}</span>
              <button onClick={() => onChange(projects.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Project Title *</label>
              <input value={String(p.title ?? "")} onChange={(e) => updateProject(i, { title: e.target.value })}
                placeholder="My Awesome Project" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Description</label>
              <textarea value={String(p.description ?? "")} onChange={(e) => updateProject(i, { description: e.target.value })}
                placeholder="Briefly describe what this project does and your role..." rows={3}
                className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Cover Image</label>
              <ImageUploadField value={String(p.coverImageUrl ?? "")} onChange={(url) => updateProject(i, { coverImageUrl: url })}
                placeholder="https://.../project-screenshot.png" folder="gallery" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Live URL</label>
                <input value={String(p.liveUrl ?? "")} onChange={(e) => updateProject(i, { liveUrl: e.target.value })}
                  placeholder="https://myproject.com" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Repo URL</label>
                <input value={String(p.repoUrl ?? "")} onChange={(e) => updateProject(i, { repoUrl: e.target.value })}
                  placeholder="https://github.com/..." className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Case Study URL</label>
                <input value={String(p.caseStudyUrl ?? "")} onChange={(e) => updateProject(i, { caseStudyUrl: e.target.value })}
                  placeholder="https://.../case-study" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Year</label>
                <input type="number" min={1990} max={2100} value={p.year != null ? String(p.year) : ""} onChange={(e) => updateProject(i, { year: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="2024" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input type="checkbox" checked={Boolean(p.featured)} onChange={(e) => updateProject(i, { featured: e.target.checked })} className="rounded" />
                <span className="text-xs font-medium" style={{ color: "var(--nc-text-2)" }}>Featured</span>
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Tags (max 8)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t, ti) => (
                  <span key={ti} className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">
                    {t}
                    <button type="button" onClick={() => removeTag(i, ti)} className="hover:text-red-400">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInputs[i] ?? ""} onChange={(e) => setTagInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(i); } }}
                  placeholder="Add a tag and press Enter" className="flex-1 nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
                <button type="button" onClick={() => addTag(i)}
                  className="nc-btn-ghost rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={addProject}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Project
      </button>
    </div>
  );
}

// ── Experience ──────────────────────────────────────────────────────────────

export function ExperienceEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const experience = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-4">
      {experience.map((e, i) => (
        <div key={i} className="nc-card rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Role {i + 1}</span>
            <button onClick={() => onChange(experience.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Job Title / Role *</label>
              <input value={e.role ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], role: ev.target.value }; onChange(n); }}
                placeholder="Senior Engineer" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Company *</label>
              <input value={e.company ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], company: ev.target.value }; onChange(n); }}
                placeholder="Acme Corp" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Start Date *</label>
              <input value={e.startDate ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], startDate: ev.target.value }; onChange(n); }}
                placeholder="2022-01" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>End Date</label>
              <input value={e.endDate ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], endDate: ev.target.value }; onChange(n); }}
                placeholder="2024-06 (leave blank if current)" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Location</label>
              <input value={e.location ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], location: ev.target.value }; onChange(n); }}
                placeholder="Remote / Kuala Lumpur" className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Company Logo</label>
              <ImageUploadField value={e.logoUrl ?? ""} onChange={(url) => { const n = [...experience]; n[i] = { ...n[i], logoUrl: url }; onChange(n); }}
                placeholder="https://.../company-logo.png" folder="logos" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Description</label>
            <textarea value={e.description ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], description: ev.target.value }; onChange(n); }}
              placeholder="What you accomplished in this role..." rows={3}
              className="w-full nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm resize-none" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...experience, { role: "", company: "", startDate: "", description: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Experience
      </button>
    </div>
  );
}
