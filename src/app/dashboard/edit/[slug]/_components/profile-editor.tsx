// src/app/dashboard/edit/[slug]/_components/profile-editor.tsx
"use client";

import { useState, useRef, useActionState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink, Lock, Check, AlertCircle, Save,
  Eye, EyeOff, ChevronDown, ChevronUp, Plus, Trash2, QrCode,
} from "lucide-react";
import {
  updateProfileAction,
  type UpdateProfileState,
} from "@/lib/actions/profile-actions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileEditorProps {
  profile: {
    id: string;
    slug: string;
    isPublished: boolean;
    templateLocked: boolean;
    dynamicJsonData: unknown;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImageUrl: string | null;
    qrLocked: boolean;
    updatedAt: Date;
    category: { id: string; name: string; slug: string };
    template: {
      id: string;
      name: string;
      codeIdentifier: string;
      thumbnailUrl: string;
      accentColor: string | null;
    };
  };
  categorySlug: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD CONFIGS PER CATEGORY
// Defines which sections/fields appear in the editor per category slug
// ─────────────────────────────────────────────────────────────────────────────

interface FieldSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

interface FieldDef {
  key: string;       // dot-notation path in the JSON, e.g. "contacts.0.value"
  label: string;
  type: "text" | "textarea" | "url" | "email" | "tel" | "color" | "image-upload" | "array-contacts" | "array-social" | "array-skills" | "array-projects" | "array-experience" | "array-services" | "array-milestones" | "array-events" | "array-gallery";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
}

const CATEGORY_FIELD_SECTIONS: Record<string, FieldSection[]> = {
  "digital-name-card": [
    {
      id: "identity",
      title: "Identity",
      fields: [
        { key: "fullName",   label: "Full Name",   type: "text",     placeholder: "Alex Rivera",           required: true, maxLength: 120 },
        { key: "pronouns",   label: "Pronouns",    type: "text",     placeholder: "they/them",                              maxLength: 30  },
        { key: "jobTitle",   label: "Job Title",   type: "text",     placeholder: "Senior Product Designer", required: true, maxLength: 120 },
        { key: "company",    label: "Company",     type: "text",     placeholder: "Horizon Labs",            required: true, maxLength: 120 },
        { key: "tagline",    label: "Tagline",     type: "text",     placeholder: "Designing systems that scale.",           maxLength: 200 },
        { key: "bio",        label: "Bio",         type: "textarea", placeholder: "A short paragraph about yourself.",       maxLength: 1000 },
        { key: "avatarUrl",  label: "Profile Photo", type: "image-upload", placeholder: "https://...", hint: "Upload a photo or paste a direct image URL" },
      ],
    },
    {
      id: "cta",
      title: "Call to Action",
      fields: [
        { key: "ctaLabel", label: "Button Label", type: "text", placeholder: "Book a Call",       maxLength: 60 },
        { key: "ctaUrl",   label: "Button URL",   type: "url",  placeholder: "https://cal.com/…" },
      ],
    },
    {
      id: "contacts",
      title: "Contact Info",
      description: "Email, phone, website, or address entries.",
      fields: [
        { key: "contacts", label: "Contacts", type: "array-contacts" },
      ],
    },
    {
      id: "social",
      title: "Social Links",
      fields: [
        { key: "socialLinks", label: "Social Links", type: "array-social" },
      ],
    },
    {
      id: "skills",
      title: "Skills",
      fields: [
        { key: "skills", label: "Skills", type: "array-skills" },
      ],
    },
    {
      id: "style",
      title: "Style",
      fields: [
        { key: "accentColor",      label: "Accent Color",      type: "color" },
        { key: "featuredQuote",    label: "Featured Quote",    type: "textarea", placeholder: "An inspiring quote…", maxLength: 300 },
      ],
    },
  ],

  portfolio: [
    {
      id: "identity",
      title: "About",
      fields: [
        { key: "fullName",    label: "Full Name",   type: "text",     required: true,  maxLength: 120 },
        { key: "headline",    label: "Headline",    type: "text",     required: true,  maxLength: 200, placeholder: "Full-stack developer & open-source contributor" },
        { key: "bio",         label: "Bio",         type: "textarea", required: true,  maxLength: 2000 },
        { key: "avatarUrl",   label: "Avatar URL",  type: "url" },
        { key: "resumeUrl",   label: "Resume URL",  type: "url",      placeholder: "https://…/resume.pdf" },
        { key: "availability",label: "Availability",type: "text",     placeholder: "available / limited / unavailable" },
        { key: "availabilityNote", label: "Availability Note", type: "text", maxLength: 200 },
      ],
    },
    {
      id: "contacts", title: "Contact",
      fields: [{ key: "contacts", label: "Contacts", type: "array-contacts" }],
    },
    {
      id: "social", title: "Social",
      fields: [{ key: "socialLinks", label: "Social Links", type: "array-social" }],
    },
    {
      id: "projects", title: "Projects",
      fields: [{ key: "projects", label: "Projects", type: "array-projects" }],
    },
    {
      id: "experience", title: "Experience",
      fields: [{ key: "experience", label: "Experience", type: "array-experience" }],
    },
  ],

  "business-ad": [
    {
      id: "identity", title: "Business Info",
      fields: [
        { key: "businessName",  label: "Business Name",  type: "text",     required: true, maxLength: 120 },
        { key: "tagline",       label: "Tagline",         type: "text",     required: true, maxLength: 200 },
        { key: "description",   label: "Description",     type: "textarea", required: true, maxLength: 2000 },
        { key: "logoUrl",       label: "Logo URL",        type: "url" },
        { key: "heroImageUrl",  label: "Hero Image URL",  type: "url" },
        { key: "industry",      label: "Industry",        type: "text",     maxLength: 80 },
        { key: "founded",       label: "Year Founded",    type: "text",     placeholder: "2018" },
        { key: "primaryCtaLabel", label: "CTA Button Label", type: "text",  required: true, maxLength: 60 },
        { key: "primaryCtaUrl",   label: "CTA Button URL",   type: "url",   required: true },
      ],
    },
    {
      id: "contacts", title: "Contact",
      fields: [{ key: "contacts", label: "Contacts", type: "array-contacts" }],
    },
    {
      id: "social", title: "Social",
      fields: [{ key: "socialLinks", label: "Social Links", type: "array-social" }],
    },
    {
      id: "services", title: "Services / Products",
      fields: [{ key: "services", label: "Services", type: "array-services" }],
    },
    {
      id: "gallery", title: "Gallery",
      fields: [{ key: "gallery", label: "Gallery Images", type: "array-gallery" }],
    },
  ],

  "wedding-invitation": [
    {
      id: "couple", title: "The Couple",
      fields: [
        { key: "partner1.name",     label: "Partner 1 Name",     type: "text", required: true },
        { key: "partner1.nickname", label: "Partner 1 Nickname", type: "text" },
        { key: "partner1.photoUrl", label: "Partner 1 Photo URL",type: "url"  },
        { key: "partner1.bio",      label: "Partner 1 Bio",      type: "textarea", maxLength: 600 },
        { key: "partner2.name",     label: "Partner 2 Name",     type: "text", required: true },
        { key: "partner2.nickname", label: "Partner 2 Nickname", type: "text" },
        { key: "partner2.photoUrl", label: "Partner 2 Photo URL",type: "url"  },
        { key: "partner2.bio",      label: "Partner 2 Bio",      type: "textarea", maxLength: 600 },
      ],
    },
    {
      id: "wedding", title: "Wedding Details",
      fields: [
        { key: "weddingDate",   label: "Wedding Date & Time", type: "text",     placeholder: "2025-11-15T14:00:00+08:00", required: true },
        { key: "headline",      label: "Headline",            type: "text",     placeholder: "Together at last", maxLength: 200 },
        { key: "coupleMessage", label: "Message from the Couple", type: "textarea", maxLength: 1000 },
        { key: "hashtag",       label: "Wedding Hashtag",     type: "text",     placeholder: "AlexAndJordanForever" },
        { key: "songTitle",     label: "Song Title",          type: "text" },
        { key: "songArtist",    label: "Song Artist",         type: "text" },
        { key: "spotifyUrl",    label: "Spotify URL",         type: "url" },
      ],
    },
    {
      id: "loveHistory", title: "Love Story",
      fields: [{ key: "loveHistory", label: "Milestones", type: "array-milestones" }],
    },
    {
      id: "events", title: "Events",
      fields: [{ key: "events", label: "Events", type: "array-events" }],
    },
    {
      id: "gallery", title: "Gallery",
      fields: [{ key: "gallery", label: "Photos", type: "array-gallery" }],
    },
    {
      id: "rsvp", title: "RSVP",
      fields: [
        { key: "rsvp.formUrl",       label: "RSVP Form URL",     type: "url" },
        { key: "rsvp.contactEmail",  label: "RSVP Contact Email",type: "email" },
        { key: "rsvp.contactPhone",  label: "RSVP Contact Phone",type: "tel" },
        { key: "rsvp.deadline",      label: "RSVP Deadline",     type: "text", placeholder: "2025-11-01T00:00:00+08:00" },
        { key: "rsvp.note",          label: "RSVP Note",         type: "textarea", maxLength: 400 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown> ?? {}) };
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRAY FIELD EDITORS
// ─────────────────────────────────────────────────────────────────────────────

function ContactsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const contacts = (value as Array<Record<string, string>>) ?? [];
  const TYPES = ["email", "phone", "website", "address"];
  return (
    <div className="space-y-2">
      {contacts.map((c, i) => (
        <div key={i} className="flex gap-2 items-start">
          <select value={c.type ?? "email"} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], type: e.target.value }; onChange(n); }}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white w-24 shrink-0">
            {TYPES.map((t) => <option key={t} value={t} className="bg-neutral-900">{t}</option>)}
          </select>
          <input value={c.value ?? ""} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], value: e.target.value }; onChange(n); }}
            placeholder="Value" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <input value={c.label ?? ""} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            placeholder="Label (optional)" className="w-28 shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <button onClick={() => onChange(contacts.filter((_, j) => j !== i))} className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-500 hover:border-red-500/30 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...contacts, { type: "email", value: "", label: "" }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Contact
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOAD FIELD — Upload file to R2 OR paste a URL directly
// ─────────────────────────────────────────────────────────────────────────────

function ImageUploadField({
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
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const inputRef = useRef<HTMLInputElement>(null);

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
      // 1. Get presigned URL from our API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, folder, fileSize: file.size }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(err.message ?? "Upload failed");
      }

      const { uploadUrl, publicUrl } = await res.json();

      // 2. PUT the raw file directly to R2
      const upload = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!upload.ok) throw new Error("Upload to storage failed.");

      // 3. Store the public URL in the field
      onChange(publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none";

  return (
    <div className="space-y-2">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1">
        {(["upload", "url"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === t
                ? "bg-indigo-500 text-white shadow"
                : "text-neutral-500 hover:text-white"
            }`}>
            {t === "upload" ? "📁 Upload File" : "🔗 Paste URL"}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFile} className="hidden" id={`img-upload-${folder}`} />
          <label htmlFor={`img-upload-${folder}`}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-sm transition-all cursor-pointer ${
              uploading
                ? "border-indigo-500/30 bg-indigo-500/5 text-indigo-400"
                : "border-white/10 text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400"
            }`}>
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                Uploading…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Click to upload image (JPG, PNG, WebP · max 8 MB)
              </>
            )}
          </label>
        </div>
      ) : (
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={inputCls} />
      )}

      {/* Preview + clear */}
      {value && (
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-white/60">{value}</p>
            <p className="text-xs text-emerald-400 mt-0.5">✓ Image set</p>
          </div>
          <button type="button" onClick={() => onChange("")}
            className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-neutral-500 hover:border-red-500/30 hover:text-red-400 transition-colors">
            Clear
          </button>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  );
}

function SocialLinksEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const links = (value as Array<Record<string, string>>) ?? [];
  const PLATFORMS = ["linkedin","github","twitter","instagram","facebook","youtube","tiktok","website","whatsapp","telegram"];
  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="flex gap-2 items-center">
          <select value={l.platform ?? "website"} onChange={(e) => { const n = [...links]; n[i] = { ...n[i], platform: e.target.value }; onChange(n); }}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white w-28 shrink-0">
            {PLATFORMS.map((p) => <option key={p} value={p} className="bg-neutral-900">{p}</option>)}
          </select>
          <input value={l.url ?? ""} onChange={(e) => { const n = [...links]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }}
            onBlur={(e) => {
              // Auto-prepend https:// when user leaves the field
              const v = e.target.value.trim();
              if (v && !v.startsWith("http://") && !v.startsWith("https://")) {
                const n = [...links]; n[i] = { ...n[i], url: `https://${v}` }; onChange(n);
              }
            }}
            placeholder="https://linkedin.com/in/yourname" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <input value={l.label ?? ""} onChange={(e) => { const n = [...links]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            placeholder="Label" className="w-24 shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <button onClick={() => onChange(links.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-500 hover:border-red-500/30 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...links, { platform: "website", url: "", label: "" }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Social Link
      </button>
    </div>
  );
}

function SkillsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const skills = (value as Array<Record<string, unknown>>) ?? [];
  return (
    <div className="space-y-2">
      {skills.map((s, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={String(s.name ?? "")} onChange={(e) => { const n = [...skills]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }}
            placeholder="Skill name" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <input type="number" min={1} max={100} value={Number(s.level ?? 80)} onChange={(e) => { const n = [...skills]; n[i] = { ...n[i], level: parseInt(e.target.value) }; onChange(n); }}
            className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white text-center focus:border-indigo-500/50 focus:outline-none" />
          <span className="text-xs text-neutral-600 w-6">%</span>
          <button onClick={() => onChange(skills.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-500 hover:border-red-500/30 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...skills, { name: "", level: 80 }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Skill
      </button>
    </div>
  );
}

function GalleryEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const images = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-2">
      {images.map((img, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={img.url ?? ""} onChange={(e) => { const n = [...images]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }}
            placeholder="Image URL (https://...)" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <input value={img.alt ?? ""} onChange={(e) => { const n = [...images]; n[i] = { ...n[i], alt: e.target.value }; onChange(n); }}
            placeholder="Alt text" className="w-36 shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <button onClick={() => onChange(images.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-500 hover:border-red-500/30 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...images, { url: "", alt: "" }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Image
      </button>
    </div>
  );
}

function MilestonesEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const milestones = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-neutral-400">Milestone {i + 1}</span>
            <button onClick={() => onChange(milestones.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {[
            { key: "date", placeholder: "Spring 2019 / 2019-04-12" },
            { key: "title", placeholder: "How We Met" },
            { key: "location", placeholder: "Kuala Lumpur, Malaysia" },
            { key: "emoji", placeholder: "💕" },
          ].map(({ key, placeholder }) => (
            <input key={key} value={m[key] ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], [key]: e.target.value }; onChange(n); }}
              placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} (${placeholder})`}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          ))}
          <textarea value={m.story ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], story: e.target.value }; onChange(n); }}
            placeholder="Tell the story of this milestone…" rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none resize-none" />
          <input value={m.imageUrl ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], imageUrl: e.target.value }; onChange(n); }}
            placeholder="Photo URL (optional)" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
        </div>
      ))}
      <button onClick={() => onChange([...milestones, { date: "", title: "", story: "" }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Milestone
      </button>
    </div>
  );
}

function EventsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const events = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-neutral-400">Event {i + 1}</span>
            <button onClick={() => onChange(events.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {[
            { key: "name",    placeholder: "Ceremony / Reception" },
            { key: "date",    placeholder: "2025-11-15T14:00:00+08:00" },
            { key: "venue",   placeholder: "The Grand Ballroom" },
            { key: "address", placeholder: "123 Wedding Lane, KL" },
            { key: "dressCode", placeholder: "Formal / Smart Casual" },
            { key: "googleMapsUrl", placeholder: "https://maps.google.com/…" },
            { key: "notes",   placeholder: "Additional notes…" },
          ].map(({ key, placeholder }) => (
            <input key={key} value={e[key] ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], [key]: ev.target.value }; onChange(n); }}
              placeholder={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} (${placeholder})`}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          ))}
        </div>
      ))}
      <button onClick={() => onChange([...events, { name: "", date: "", venue: "", address: "" }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Event
      </button>
    </div>
  );
}

function ServicesEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const services = (value as Array<Record<string, unknown>>) ?? [];
  return (
    <div className="space-y-3">
      {services.map((s, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-neutral-400">Service {i + 1}</span>
            <button onClick={() => onChange(services.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <input value={String(s.title ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
            placeholder="Service title" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          <textarea value={String(s.description ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }}
            placeholder="Description" rows={2} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none resize-none" />
          <div className="flex gap-2">
            <input value={String(s.price ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], price: e.target.value }; onChange(n); }}
              placeholder="Price (e.g. $99)" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={Boolean(s.highlighted)} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], highlighted: e.target.checked }; onChange(n); }} className="rounded" />
              <span className="text-xs text-neutral-500">Featured</span>
            </label>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...services, { title: "", description: "", highlighted: false }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Service
      </button>
    </div>
  );
}

function ProjectsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const projects = (value as Array<Record<string, unknown>>) ?? [];
  return (
    <div className="space-y-3">
      {projects.map((p, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-neutral-400">Project {i + 1}</span>
            <button onClick={() => onChange(projects.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {["title","description","coverImageUrl","liveUrl","repoUrl"].map((key) => (
            <input key={key} value={String(p[key] ?? "")} onChange={(e) => { const n = [...projects]; n[i] = { ...n[i], [key]: e.target.value, id: (p.id as string) || `proj-${Date.now()}-${i}` }; onChange(n); }}
              placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={Boolean(p.featured)} onChange={(e) => { const n = [...projects]; n[i] = { ...n[i], featured: e.target.checked }; onChange(n); }} className="rounded" />
            <span className="text-xs text-neutral-500">Featured project</span>
          </label>
        </div>
      ))}
      <button onClick={() => onChange([...projects, { id: `proj-${Date.now()}`, title: "", description: "", coverImageUrl: "", tags: [] }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Project
      </button>
    </div>
  );
}

function ExperienceEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const experience = (value as Array<Record<string, string>>) ?? [];
  return (
    <div className="space-y-3">
      {experience.map((e, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-neutral-400">Role {i + 1}</span>
            <button onClick={() => onChange(experience.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {[
            { key: "role",        placeholder: "Senior Engineer" },
            { key: "company",     placeholder: "Acme Corp" },
            { key: "startDate",   placeholder: "2022-01" },
            { key: "endDate",     placeholder: "2024-06 (leave blank if current)" },
            { key: "location",    placeholder: "Remote / KL" },
            { key: "description", placeholder: "What you did there…" },
          ].map(({ key, placeholder }) => (
            key === "description"
              ? <textarea key={key} value={e[key] ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], [key]: ev.target.value }; onChange(n); }}
                  placeholder={placeholder} rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none resize-none" />
              : <input key={key} value={e[key] ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], [key]: ev.target.value }; onChange(n); }}
                  placeholder={placeholder} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
          ))}
        </div>
      ))}
      <button onClick={() => onChange([...experience, { role: "", company: "", startDate: "", description: "" }])}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-neutral-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Experience
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileEditor({ profile, categorySlug }: ProfileEditorProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    (profile.dynamicJsonData as Record<string, unknown>) ?? {}
  );
  const [metaTitle, setMetaTitle] = useState(profile.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(profile.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(profile.ogImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(profile.isPublished);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["identity", "couple", "wedding"]));

  const [formState, submitAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateProfileAction,
    { status: "idle" }
  );

  const sections = CATEGORY_FIELD_SECTIONS[categorySlug] ?? [];

  const getFieldValue = useCallback((key: string) => getNestedValue(formData, key), [formData]);

  const setFieldValue = useCallback((key: string, value: unknown) => {
    setFormData((prev) => setNestedValue(prev, key, value));
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderField = (field: FieldDef) => {
    const val = getFieldValue(field.key);
    const base = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none transition-colors";

    switch (field.type) {
      case "textarea":
        return (
          <textarea value={String(val ?? "")} onChange={(e) => setFieldValue(field.key, e.target.value)}
            placeholder={field.placeholder} maxLength={field.maxLength} rows={4}
            className={`${base} resize-none`} />
        );
      case "color":
        return (
          <div className="flex items-center gap-3">
            <input type="color" value={String(val ?? "#6366f1")} onChange={(e) => setFieldValue(field.key, e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1" />
            <input type="text" value={String(val ?? "#6366f1")} onChange={(e) => setFieldValue(field.key, e.target.value)}
              placeholder="#6366f1" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white font-mono focus:border-indigo-500/50 focus:outline-none" />
          </div>
        );
      case "array-contacts":
        return <ContactsEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-social":
        return <SocialLinksEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-skills":
        return <SkillsEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-gallery":
        return <GalleryEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-milestones":
        return <MilestonesEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-events":
        return <EventsEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-services":
        return <ServicesEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-projects":
        return <ProjectsEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "array-experience":
        return <ExperienceEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "image-upload":
        return <ImageUploadField value={String(val ?? "")} onChange={(v) => setFieldValue(field.key, v)} placeholder={field.placeholder} />;
      default:
        return (
          <input type={field.type} value={String(val ?? "")} onChange={(e) => setFieldValue(field.key, e.target.value)}
            placeholder={field.placeholder} maxLength={field.maxLength}
            className={base} />
        );
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="mb-2 inline-block text-xs text-neutral-500 hover:text-white transition-colors">
            ← Back to Profiles
          </Link>
          <h1 className="text-2xl font-black">
            Edit <span className="text-indigo-400">/{profile.slug}</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {profile.category.name} · {profile.template.name}
            {profile.templateLocked && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-400">
                <Lock className="h-3 w-3" /> Template locked
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/qr/${profile.slug}`}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              profile.qrLocked
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                : "border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            {profile.qrLocked ? "QR Locked" : "Generate QR"}
          </Link>
          <Link href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:border-white/20 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </Link>
        </div>
      </div>

      {/* Success/error banner */}
      {formState.status === "success" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3.5">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-300">Profile saved and published live!</p>
        </div>
      )}
      {formState.status === "error" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{formState.message}</p>
        </div>
      )}

      {/* Publish toggle — prominent card */}
      <div className={`mb-6 rounded-2xl border px-5 py-4 transition-all ${
        isPublished
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-amber-500/20 bg-amber-500/5"
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
              <p className="font-bold text-white text-sm">
                {isPublished ? "Live — anyone with the link can view this" : "Draft — your profile is hidden from the public"}
              </p>
            </div>
            <p className="text-xs text-neutral-500 ml-4">
              {isPublished
                ? <>presencecard.io/<strong className="text-indigo-400">{profile.slug}</strong> is accessible</>
                : <>Toggle to <strong>Publish</strong> so your URL goes live — required before generating a QR code</>
              }
            </p>
          </div>
          <button type="button" onClick={() => setIsPublished((p) => !p)}
            className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              isPublished
                ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25"
                : "bg-amber-500/15 border border-amber-500/25 text-amber-300 hover:bg-amber-500/25"
            }`}>
            {isPublished
              ? <><Eye className="h-3.5 w-3.5" /> Published</>
              : <><EyeOff className="h-3.5 w-3.5" /> Publish Now</>
            }
          </button>
        </div>
      </div>

      {/* Dynamic field sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
              <button onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div>
                  <p className="font-semibold text-white text-sm">{section.title}</p>
                  {section.description && (
                    <p className="mt-0.5 text-xs text-neutral-600">{section.description}</p>
                  )}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
              </button>

              {isOpen && (
                <div className="border-t border-white/5 px-5 py-5 space-y-5">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                        {field.label}
                        {field.required && <span className="ml-1 text-red-400">*</span>}
                      </label>
                      {renderField(field)}
                      {field.hint && (
                        <p className="mt-1 text-xs text-neutral-600">{field.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* SEO section */}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
          <button onClick={() => toggleSection("seo")}
            className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div>
              <p className="font-semibold text-white text-sm">SEO & Social Sharing</p>
              <p className="mt-0.5 text-xs text-neutral-600">Override meta title, description, and OG image</p>
            </div>
            {openSections.has("seo") ? <ChevronUp className="h-4 w-4 text-neutral-500" /> : <ChevronDown className="h-4 w-4 text-neutral-500" />}
          </button>
          {openSections.has("seo") && (
            <div className="border-t border-white/5 px-5 py-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Meta Title <span className="text-neutral-600">(max 160 chars)</span></label>
                <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={160} placeholder="Your Name · Job Title"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">Meta Description <span className="text-neutral-600">(max 320 chars)</span></label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={320} rows={3} placeholder="A short description for search engines and social sharing…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">OG / Social Preview Image <span className="text-neutral-600">(1200×630 recommended)</span></label>
                <ImageUploadField value={ogImageUrl} onChange={setOgImageUrl} placeholder="https://…/og-image.jpg" folder="og-images" />
                <p className="mt-1 text-xs text-neutral-600">Leave blank to use the auto-generated branded OG image.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code callout — shown after publishing */}
      {isPublished && !profile.qrLocked && (
        <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Ready to generate your QR code?</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Your profile is live. Generate a QR code for events, business cards, or your email signature.
                This will permanently lock your template and category.
              </p>
            </div>
            <Link href={`/dashboard/qr/${profile.slug}`}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-400 transition-all">
              <QrCode className="h-3.5 w-3.5" />
              Generate QR
            </Link>
          </div>
        </div>
      )}
      {profile.qrLocked && (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1">
              <p className="font-bold text-amber-300 text-sm">QR Code Active & Locked</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Your QR code is live and permanently set. Content edits are still saved normally.
              </p>
            </div>
            <Link href={`/dashboard/qr/${profile.slug}`}
              className="shrink-0 flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
              View QR
            </Link>
          </div>
        </div>
      )}

      {/* Save button */}
      <form action={submitAction} className="mt-8">
        <input type="hidden" name="profileId" value={profile.id} />
        <input type="hidden" name="dynamicJsonData" value={JSON.stringify(formData)} />
        <input type="hidden" name="metaTitle" value={metaTitle} />
        <input type="hidden" name="metaDescription" value={metaDescription} />
        <input type="hidden" name="ogImageUrl" value={ogImageUrl} />
        <input type="hidden" name="isPublished" value={String(isPublished)} />

        <button type="submit" disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving & Publishing…</>
          ) : (
            <><Save className="h-4 w-4" />Save &amp; Publish Changes</>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-neutral-700">
        Last saved: {new Date(profile.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}