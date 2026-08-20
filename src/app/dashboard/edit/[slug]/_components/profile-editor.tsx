// src/app/dashboard/edit/[slug]/_components/profile-editor.tsx
"use client";

import { useState, useRef, useEffect, useActionState, useCallback } from "react";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import {
  ExternalLink, Lock, Check, AlertCircle, Save,
  Eye, EyeOff, ChevronDown, ChevronUp, Plus, Trash2, QrCode,
} from "lucide-react";
import {
  updateProfileAction,
  type UpdateProfileState,
} from "@/lib/actions/profile-actions";
import { resolveImageUrl } from "@/lib/utils/image-url";
import BusinessCardScanner from "@/components/ocr/business-card-scanner";

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
  type: "text" | "textarea" | "url" | "email" | "tel" | "color" | "select" | "image-upload" | "audio-upload" | "datetime-local" | "array-contacts" | "array-social" | "array-skills" | "array-projects" | "array-experience" | "array-services" | "array-milestones" | "array-events" | "array-gallery" | "array-category-skills";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  options?: string[];
}

const CATEGORY_FIELD_SECTIONS: Record<string, FieldSection[]> = {
  "digital-name-card": [
    {
      id: "identity",
      title: "Identity",
      fields: [
        { key: "fullName",   label: "Full Name",   type: "text",     placeholder: "Alex Rivera",           required: true, maxLength: 30 },
        { key: "jobTitle",   label: "Job Title",   type: "text",     placeholder: "Senior Product Designer", required: true, maxLength: 120 },
        { key: "company",    label: "Company",     type: "text",     placeholder: "Horizon Labs",            maxLength: 30 },
        { key: "tagline",    label: "Tagline",     type: "text",     placeholder: "Designing systems that scale.",           maxLength: 150 },
        { key: "bio",        label: "Bio",         type: "textarea", placeholder: "A short paragraph about yourself.",       maxLength: 1000 },
        { key: "avatarUrl",  label: "Profile Photo", type: "image-upload", placeholder: "https://...", hint: "Upload a photo or paste a direct image URL" },
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
        { key: "fullName",    label: "Full Name",           type: "text",           required: true,  maxLength: 120, placeholder: "Your display name" },
        { key: "headline",    label: "Headline",            type: "text",           required: true,  maxLength: 200, placeholder: "Full-stack developer & open-source contributor" },
        { key: "bio",         label: "Bio",                 type: "textarea",       required: true,  maxLength: 2000, placeholder: "Tell visitors what you do, your experience, and what you're looking for…" },
        { key: "avatarUrl",   label: "Profile Photo",       type: "image-upload",   placeholder: "https://...", hint: "Upload a photo or paste a direct image URL" },
        { key: "resumeUrl",   label: "Resume / CV URL",     type: "url",            placeholder: "https://…/resume.pdf" },
        { key: "availability",label: "Availability Status",  type: "select",         placeholder: "available", options: ["available", "limited", "unavailable"], hint: "Shown as a badge on your profile" },
        { key: "availabilityNote", label: "Availability Note", type: "text",         placeholder: "Open to freelance projects", maxLength: 200, hint: "Optional note next to your status badge" },
      ],
    },
    {
      id: "contacts", title: "Contact Info",
      description: "Email, phone, website, or address entries.",
      fields: [{ key: "contacts", label: "Contacts", type: "array-contacts" }],
    },
    {
      id: "social", title: "Social Links",
      fields: [{ key: "socialLinks", label: "Social Links", type: "array-social" }],
    },
    {
      id: "projects", title: "Projects",
      description: "Showcase your best work. Mark projects as featured to highlight them.",
      fields: [{ key: "projects", label: "Projects", type: "array-projects" }],
    },
    {
      id: "experience", title: "Work Experience",
      description: "Your professional background and roles.",
      fields: [{ key: "experience", label: "Experience", type: "array-experience" }],
    },
    {
      id: "skills", title: "Skills",
      description: "Group your skills into categories (e.g. Frontend, Backend, Tools).",
      fields: [{ key: "skills", label: "Skills", type: "array-category-skills" }],
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
        { key: "founded",       label: "Year Founded",    type: "text",     placeholder: "2018", maxLength: 4 },
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
        { key: "partner1.name",     label: "Partner 1 Name",     type: "text", required: true, maxLength: 80 },
        { key: "partner1.nickname", label: "Partner 1 Nickname", type: "text", maxLength: 40 },
        { key: "partner1.photoUrl", label: "Partner 1 Photo",    type: "image-upload", placeholder: "https://...", hint: "Upload a photo or paste a URL" },
        { key: "partner1.bio",      label: "Partner 1 Bio",      type: "textarea", maxLength: 600 },
        { key: "partner2.name",     label: "Partner 2 Name",     type: "text", required: true, maxLength: 80 },
        { key: "partner2.nickname", label: "Partner 2 Nickname", type: "text", maxLength: 40 },
        { key: "partner2.photoUrl", label: "Partner 2 Photo",    type: "image-upload", placeholder: "https://...", hint: "Upload a photo or paste a URL" },
        { key: "partner2.bio",      label: "Partner 2 Bio",      type: "textarea", maxLength: 600 },
      ],
    },
    {
      id: "wedding", title: "Wedding Details",
      fields: [
        { key: "weddingDate",   label: "Wedding Date & Time", type: "datetime-local", required: true },
        { key: "headline",      label: "Headline",            type: "text",     placeholder: "Together at last", maxLength: 200 },
        { key: "coupleMessage", label: "Message from the Couple", type: "textarea", maxLength: 1000 },
        { key: "hashtag",       label: "Wedding Hashtag",     type: "text",     placeholder: "AlexAndJordanForever", maxLength: 60 },
        { key: "songTitle",     label: "Song Title",          type: "text", maxLength: 120 },
        { key: "songArtist",    label: "Song Artist",         type: "text", maxLength: 120 },
        { key: "spotifyUrl",    label: "Background Music",    type: "audio-upload", placeholder: "https://...", hint: "Upload an audio file or paste a Spotify/embed URL" },
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
      description: "Industry best practice: collect attendance, dietary needs, meal choice, plus-one name, and song request in a single form.",
      fields: [
        { key: "rsvp._enabled", label: "Enable RSVP", type: "select", options: ["false", "true"], hint: "Toggle on to include an RSVP form on your wedding page" },
        { key: "rsvp.formUrl",           label: "RSVP Form URL",           type: "url" },
        { key: "rsvp.contactEmail",      label: "RSVP Contact Email",      type: "email" },
        { key: "rsvp.contactPhone",      label: "RSVP Contact Phone",      type: "tel" },
        { key: "rsvp.deadline",          label: "RSVP Deadline",           type: "datetime-local" },
        { key: "rsvp.maxGuestsPerInvite",label: "Max Guests per Invite",  type: "text", placeholder: "2", maxLength: 2 },
        { key: "rsvp.plusOneAllowed",    label: "Allow Plus-One",          type: "select", options: ["true", "false"] },
        { key: "rsvp.mealOptions",       label: "Meal Options",            type: "text", placeholder: "Chicken, Beef, Vegetarian, Vegan", maxLength: 200, hint: "Comma-separated meal choices for guests" },
        { key: "rsvp.dietaryNotes",      label: "Dietary Notes Prompt",    type: "text", placeholder: "Any allergies or dietary needs?", maxLength: 200, hint: "Prompt shown to guests for dietary restrictions" },
        { key: "rsvp.songRequest",       label: "Allow Song Requests",     type: "select", options: ["true", "false"] },
        { key: "rsvp.note",              label: "RSVP Note",               type: "textarea", maxLength: 400 },
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
  const TYPE_LABELS: Record<string, string> = { email: "✉ Email", phone: "📱 Phone", website: "🌐 Website", address: "📍 Address" };

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
    <div className="space-y-2">
      {contacts.map((c, i) => {
        const usedTypes = new Set(contacts.filter((_, j) => j !== i).map((x) => x.type).filter(Boolean));
        const availableTypes = TYPES.filter((t) => !usedTypes.has(t));
        return (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex gap-2 min-w-0 sm:flex-1">
              {c.type ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-2 text-xs font-semibold text-indigo-400 shrink-0">
                  {TYPE_LABELS[c.type] ?? c.type}
                  <button type="button" onClick={() => clearType(i)}
                    className="ml-0.5 text-indigo-400/50 hover:text-red-400 transition-colors">&times;</button>
                </span>
              ) : (
                <select value="" onChange={(e) => setType(i, e.target.value)}
                  className="rounded-lg px-2 py-2 text-xs w-24 shrink-0 nc-input">
                  <option value="" disabled>Type…</option>
                  {availableTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              <input value={c.value ?? ""} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], value: e.target.value }; onChange(n); }}
                placeholder={c.type === "email" ? "you@example.com" : c.type === "phone" ? "+95 9xxx" : c.type === "website" ? "https://…" : "Full address"}
                className="min-w-0 flex-1 nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 items-center">
              <input value={c.label ?? ""} onChange={(e) => { const n = [...contacts]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
                placeholder="Label (optional)" className="min-w-0 flex-1 sm:w-28 sm:flex-initial nc-input rounded-lg px-3 py-2 text-sm" />
              <button onClick={() => onChange(contacts.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      <button onClick={() => onChange([...contacts, { type: "", value: "", label: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
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
  const [tab, setTab] = useState<"upload" | "camera" | "url">("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Delete old image from R2 when uploading a new one or clearing
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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? err.message ?? "Upload failed");
      }

      const data = await res.json();
      const newUrl = data.publicUrl ?? data.url;

      // Delete old image from R2 after successful upload
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

  const inputCls = "nc-input w-full px-3 py-2.5 text-sm";

  return (
    <div className="space-y-2">
      {/* Tab switcher */}
      <div className="flex gap-1 nc-card rounded-xl p-1">
        {(["upload", "camera", "url"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === t
                ? "bg-indigo-500 text-white shadow"
                : "nc-btn-ghost"
            }`}>
            {t === "upload" ? "📁 Upload" : t === "camera" ? "📷 Camera" : "🔗 URL"}
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
                Uploading…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Take a photo with your camera
              </>
            )}
          </button>
        </div>
      ) : (
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={inputCls} />
      )}

      {/* Preview + clear */}
      {value && (
        <div className="nc-card flex items-center gap-3 rounded-xl p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg" style={{ border: "1px solid var(--nc-border)" }}>
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={resolveImageUrl(value)} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs" style={{ color: "var(--nc-text-2)" }}>{value}</p>
            <p className="text-xs text-emerald-400 mt-0.5">✓ Image set</p>
          </div>
          <button type="button" onClick={() => { deleteOldImage(value); onChange(""); }}
            className="nc-btn-ghost shrink-0 rounded-lg px-2 py-1 text-xs hover:border-red-500/30 hover:text-red-400 transition-colors">
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

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO UPLOAD FIELD — Upload audio file or paste URL
// ─────────────────────────────────────────────────────────────────────────────

function AudioUploadField({
  value,
  onChange,
  placeholder = "https://...",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  function deleteOldAudio(url: string) {
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

    const ALLOWED = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/x-m4a", "audio/mp4"];
    if (!ALLOWED.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) {
      setUploadError("Only MP3, WAV, OGG, AAC, FLAC, or M4A files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }

      const data = await res.json();
      const newUrl = data.publicUrl ?? data.url;
      if (value && value !== newUrl) deleteOldAudio(value);
      onChange(newUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input ref={inputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="nc-btn-ghost flex items-center gap-2 rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors disabled:opacity-50">
          {uploading ? (
            <><div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" /> Uploading…</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" /></svg> Upload Audio</>
          )}
        </button>
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className="flex-1 nc-input rounded-lg px-3 py-2 text-sm min-w-0" />
      </div>
      {hint && <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{hint}</p>}
      {value && (
        <div className="nc-card flex items-center gap-3 rounded-xl p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" /></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs" style={{ color: "var(--nc-text-2)" }}>{value}</p>
            <p className="text-xs text-emerald-400 mt-0.5">✓ Audio set</p>
          </div>
          <button type="button" onClick={() => { deleteOldAudio(value); onChange(""); }}
            className="nc-btn-ghost shrink-0 rounded-lg px-2 py-1 text-xs hover:border-red-500/30 hover:text-red-400 transition-colors">
            Clear
          </button>
        </div>
      )}
      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
    </div>
  );
}

function SocialLinksEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const links = (value as Array<Record<string, string>>) ?? [];
const PLATFORMS = ["linkedin","github","twitter","instagram","facebook","youtube","tiktok","website","whatsapp","telegram","viber","discord"];
const PLATFORM_ICONS: Record<string, string> = { linkedin:"💼", github:"🐙", twitter:"𝕏", instagram:"📸", facebook:"👥", youtube:"▶️", tiktok:"🎵", whatsapp:"💬", telegram:"✈️", viber:"📲", discord:"🎮", website:"🌐" };
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
    <div className="space-y-2">
      {links.map((l, i) => {
        const usedPlatforms = new Set(links.filter((_, j) => j !== i).map((x) => x.platform).filter(Boolean));
        const availablePlatforms = PLATFORMS.filter((p) => !usedPlatforms.has(p));
        return (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-2 min-w-0 sm:flex-1">
              {l.platform ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-2 text-xs font-semibold text-indigo-400 shrink-0">
                  {PLATFORM_ICONS[l.platform] ?? "🔗"} {l.platform}
                  <button type="button" onClick={() => clearPlatform(i)}
                    className="ml-0.5 text-indigo-400/50 hover:text-red-400 transition-colors">&times;</button>
                </span>
              ) : (
                <select value="" onChange={(e) => setPlatform(i, e.target.value)}
                  className="nc-input rounded-lg px-2 py-2 text-xs w-24 shrink-0">
                  <option value="" disabled>Platform…</option>
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
                placeholder={l.platform ? PLATFORM_PLACEHOLDERS[l.platform] ?? "https://..." : "https://..."} className="min-w-0 flex-1 nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 items-center">
              <input value={l.label ?? ""} onChange={(e) => { const n = [...links]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
                placeholder="Label" className="min-w-0 flex-1 sm:w-24 sm:flex-initial nc-input rounded-lg px-3 py-2 text-sm" />
              <button onClick={() => onChange(links.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      <button onClick={() => onChange([...links, { platform: "", url: "", label: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
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
        <div key={i} className="flex items-center gap-2">
          <input value={String(s.name ?? "")} onChange={(e) => { const n = [...skills]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }}
            placeholder="Skill name" className="min-w-0 flex-1 nc-input rounded-lg px-3 py-2 text-sm" />
          <input type="number" min={1} max={100} value={Number(s.level ?? 80)} onChange={(e) => { const n = [...skills]; n[i] = { ...n[i], level: parseInt(e.target.value) }; onChange(n); }}
            className="nc-input w-14 shrink-0 rounded-lg px-2 py-2 text-sm text-center" />
          <span className="text-xs shrink-0" style={{ color: "var(--nc-text-3)" }}>%</span>
          <button onClick={() => onChange(skills.filter((_, j) => j !== i))} className="flex h-8 w-8 shrink-0 items-center justify-center nc-btn-ghost rounded-lg hover:border-red-500/30 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...skills, { name: "", level: 80 }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Skill
      </button>
    </div>
  );
}

function CategorySkillsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
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
            placeholder="Category name (e.g. Frontend, Backend, Tools)" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
          <div className="space-y-1.5">
            {g.items.map((item, j) => (
              <div key={j} className="flex gap-2 items-center">
                <input value={item} onChange={(e) => { const n = [...groups]; const items = [...n[i].items]; items[j] = e.target.value; n[i] = { ...n[i], items }; onChange(n); }}
                  placeholder="Skill name" className="min-w-0 flex-1 nc-input rounded-lg px-3 py-2 text-sm" />
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
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Category
      </button>
    </div>
  );
}

function GalleryEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
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
              placeholder="Alt text (e.g. 'First dance')" className="nc-input rounded-lg px-3 py-2 text-sm" />
            <input value={img.label ?? ""} onChange={(e) => { const n = [...images]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
              placeholder="Label (e.g. 'Ceremony')" className="nc-input rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...images, { url: "", alt: "", label: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Photo
      </button>
    </div>
  );
}

function MilestonesEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
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
                className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Title *</label>
              <input value={m.title ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
                placeholder="How We Met" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Location</label>
              <input value={m.location ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], location: e.target.value }; onChange(n); }}
                placeholder="Kuala Lumpur, Malaysia" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Emoji</label>
              <input value={m.emoji ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], emoji: e.target.value }; onChange(n); }}
                placeholder="💕" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Story *</label>
            <textarea value={m.story ?? ""} onChange={(e) => { const n = [...milestones]; n[i] = { ...n[i], story: e.target.value }; onChange(n); }}
              placeholder="Tell the story of this milestone…" rows={3}
              className="w-full nc-input rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Photo</label>
            <ImageUploadField value={m.imageUrl ?? ""} onChange={(url) => { const n = [...milestones]; n[i] = { ...n[i], imageUrl: url }; onChange(n); }}
              placeholder="Upload a photo or paste a URL" folder="gallery" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...milestones, { date: "", title: "", story: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
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
        <div key={i} className="nc-card rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Event {i + 1}</span>
            <button onClick={() => onChange(events.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Event Name *</label>
              <input value={e.name ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], name: ev.target.value }; onChange(n); }}
                placeholder="Ceremony / Reception" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Date & Time *</label>
              <input type="datetime-local" value={(e.date ?? "").slice(0, 16)} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], date: ev.target.value ? new Date(ev.target.value).toISOString() : "" }; onChange(n); }}
                className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Venue *</label>
              <input value={e.venue ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], venue: ev.target.value }; onChange(n); }}
                placeholder="The Grand Ballroom" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Address *</label>
              <input value={e.address ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], address: ev.target.value }; onChange(n); }}
                placeholder="123 Wedding Lane, KL" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Dress Code</label>
              <input value={e.dressCode ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], dressCode: ev.target.value }; onChange(n); }}
                placeholder="Formal / Smart Casual" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Google Maps URL</label>
              <input value={e.googleMapsUrl ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], googleMapsUrl: ev.target.value }; onChange(n); }}
                placeholder="https://maps.google.com/…" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Notes</label>
            <input value={e.notes ?? ""} onChange={(ev) => { const n = [...events]; n[i] = { ...n[i], notes: ev.target.value }; onChange(n); }}
              placeholder="Additional notes…" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...events, { name: "", date: "", venue: "", address: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
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
        <div key={i} className="nc-card rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Service {i + 1}</span>
            <button onClick={() => onChange(services.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <input value={String(s.title ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
            placeholder="Service title" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
          <textarea value={String(s.description ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }}
            placeholder="Description" rows={2} className="w-full nc-input rounded-lg px-3 py-2 text-sm resize-none" />
          <div className="flex gap-2">
            <input value={String(s.price ?? "")} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], price: e.target.value }; onChange(n); }}
              placeholder="Price (e.g. $99)" className="flex-1 nc-input rounded-lg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={Boolean(s.highlighted)} onChange={(e) => { const n = [...services]; n[i] = { ...n[i], highlighted: e.target.checked }; onChange(n); }} className="rounded" />
              <span className="text-xs" style={{ color: "var(--nc-text-2)" }}>Featured</span>
            </label>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...services, { title: "", description: "", highlighted: false }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Service
      </button>
    </div>
  );
}

function ProjectsEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
  const projects = (value as Array<Record<string, unknown>>) ?? [];
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({});

  function addProject() {
    const newId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    onChange([...projects, {
      id: newId,
      title: "",
      description: "",
      coverImageUrl: "",
      tags: [],
      liveUrl: "",
      repoUrl: "",
      caseStudyUrl: "",
      year: undefined,
      featured: false,
    }]);
  }

  function updateProject(index: number, updates: Record<string, unknown>) {
    const n = [...projects];
    n[index] = { ...n[index], ...updates };
    onChange(n);
  }

  function removeProject(index: number) {
    onChange(projects.filter((_, j) => j !== index));
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
              <button onClick={() => removeProject(i)} className="hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Project Title *</label>
              <input value={String(p.title ?? "")} onChange={(e) => updateProject(i, { title: e.target.value })}
                placeholder="My Awesome Project" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Description</label>
              <textarea value={String(p.description ?? "")} onChange={(e) => updateProject(i, { description: e.target.value })}
                placeholder="Briefly describe what this project does and your role…" rows={3}
                className="w-full nc-input rounded-lg px-3 py-2 text-sm resize-none" />
              <p className="mt-0.5 text-right text-xs tabular-nums" style={{ color: "var(--nc-text-3)" }}>
                {(p.description as string)?.length ?? 0}/600
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Cover Image</label>
              <ImageUploadField
                value={String(p.coverImageUrl ?? "")}
                onChange={(url) => updateProject(i, { coverImageUrl: url })}
                placeholder="https://…/project-screenshot.png"
                folder="gallery"
              />
            </div>

            {/* URLs row */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Live URL</label>
                <input value={String(p.liveUrl ?? "")} onChange={(e) => updateProject(i, { liveUrl: e.target.value })}
                  placeholder="https://myproject.com" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Repo URL</label>
                <input value={String(p.repoUrl ?? "")} onChange={(e) => updateProject(i, { repoUrl: e.target.value })}
                  placeholder="https://github.com/…" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Case Study URL</label>
                <input value={String(p.caseStudyUrl ?? "")} onChange={(e) => updateProject(i, { caseStudyUrl: e.target.value })}
                  placeholder="https://…/case-study" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Year + Featured */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Year</label>
                <input type="number" min={1990} max={2100} value={p.year != null ? String(p.year) : ""} onChange={(e) => updateProject(i, { year: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="2024" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input type="checkbox" checked={Boolean(p.featured)} onChange={(e) => updateProject(i, { featured: e.target.checked })} className="rounded" />
                <span className="text-xs font-medium" style={{ color: "var(--nc-text-2)" }}>Featured</span>
              </label>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Tags <span style={{ color: "var(--nc-text-3)" }}>(max 8)</span></label>
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
                  placeholder="Add a tag and press Enter" className="flex-1 nc-input rounded-lg px-3 py-2 text-sm" />
                <button type="button" onClick={() => addTag(i)}
                  className="nc-btn-ghost rounded-lg px-3 py-2 text-xs font-semibold hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={addProject}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Project
      </button>
    </div>
  );
}

function ExperienceEditor({ value, onChange }: { value: unknown[]; onChange: (v: unknown[]) => void }) {
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
                placeholder="Senior Engineer" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Company *</label>
              <input value={e.company ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], company: ev.target.value }; onChange(n); }}
                placeholder="Acme Corp" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Start Date *</label>
              <input value={e.startDate ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], startDate: ev.target.value }; onChange(n); }}
                placeholder="2022-01" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>End Date</label>
              <input value={e.endDate ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], endDate: ev.target.value }; onChange(n); }}
                placeholder="2024-06 (leave blank if current)" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Location</label>
              <input value={e.location ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], location: ev.target.value }; onChange(n); }}
                placeholder="Remote / Kuala Lumpur" className="w-full nc-input rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Company Logo</label>
              <ImageUploadField
                value={e.logoUrl ?? ""}
                onChange={(url) => { const n = [...experience]; n[i] = { ...n[i], logoUrl: url }; onChange(n); }}
                placeholder="https://…/company-logo.png"
                folder="logos"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--nc-text-3)" }}>Description</label>
            <textarea value={e.description ?? ""} onChange={(ev) => { const n = [...experience]; n[i] = { ...n[i], description: ev.target.value }; onChange(n); }}
              placeholder="What you accomplished in this role…" rows={3}
              className="w-full nc-input rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...experience, { role: "", company: "", startDate: "", description: "" }])}
        className="flex items-center gap-1.5 nc-btn-ghost rounded-lg border-dashed px-3 py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors">
        <Plus className="h-3 w-3" /> Add Experience
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileEditor({ profile, categorySlug }: ProfileEditorProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const data = (profile.dynamicJsonData as Record<string, unknown>) ?? {};
    if (data.rsvp && typeof data.rsvp === "object" && !(data.rsvp as Record<string, unknown>)._enabled) {
      return { ...data, rsvp: { ...(data.rsvp as Record<string, unknown>), _enabled: "true" } };
    }
    return data;
  });
  const [metaTitle, setMetaTitle] = useState(profile.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(profile.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(profile.ogImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(profile.isPublished);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["identity", "couple", "wedding"]));

  const [formState, submitAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateProfileAction,
    { status: "idle" }
  );

  const [successVisible, setSuccessVisible] = useState(false);
  const [showOcrScanner, setShowOcrScanner] = useState(false);

  useEffect(() => {
    if (formState.status === "success") {
      setSuccessVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => setSuccessVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [formState.status]);

  const sections = CATEGORY_FIELD_SECTIONS[categorySlug] ?? [];

  const getFieldValue = useCallback((key: string) => getNestedValue(formData, key), [formData]);

  const setFieldValue = useCallback((key: string, value: unknown) => {
    setFormData((prev) => {
      const next = setNestedValue(prev, key, value);
      if (key === "rsvp._enabled" && value === "false") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rsvp, ...rest } = next;
        return rest;
      }
      return next;
    });
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  function handleOcrResult(result: { fullName?: string; jobTitle?: string; company?: string; email?: string; phone?: string; website?: string; address?: string }) {
    if (result.fullName) setFieldValue("fullName", result.fullName);
    if (result.jobTitle) setFieldValue("jobTitle", result.jobTitle);
    if (result.company) setFieldValue("company", result.company);
    if (result.email) {
      const existingContacts = (getFieldValue("contacts") as Array<Record<string, string>>) ?? [];
      const hasEmail = existingContacts.some((c) => c.type === "email");
      if (!hasEmail) {
        setFieldValue("contacts", [...existingContacts, { type: "email", value: result.email, label: "" }]);
      }
    }
    if (result.phone) {
      const existingContacts = (getFieldValue("contacts") as Array<Record<string, string>>) ?? [];
      const hasPhone = existingContacts.some((c) => c.type === "phone");
      if (!hasPhone) {
        setFieldValue("contacts", [...existingContacts, { type: "phone", value: result.phone, label: "" }]);
      }
    }
    if (result.website) {
      const existingContacts = (getFieldValue("contacts") as Array<Record<string, string>>) ?? [];
      const hasWebsite = existingContacts.some((c) => c.type === "website");
      if (!hasWebsite) {
        setFieldValue("contacts", [...existingContacts, { type: "website", value: result.website, label: "" }]);
      }
    }
    if (result.address) {
      const existingContacts = (getFieldValue("contacts") as Array<Record<string, string>>) ?? [];
      const hasAddress = existingContacts.some((c) => c.type === "address");
      if (!hasAddress) {
        setFieldValue("contacts", [...existingContacts, { type: "address", value: result.address, label: "" }]);
      }
    }
    setShowOcrScanner(false);
  }

  const renderField = (field: FieldDef) => {
    const val = getFieldValue(field.key);
    const base = "nc-input w-full px-3 py-2.5 text-sm transition-colors";
    const charCount = typeof val === "string" ? val.length : 0;
    const nearLimit = field.maxLength && charCount > field.maxLength * 0.9;

    const charCounter = field.maxLength ? (
      <p className="mt-1 text-right text-xs tabular-nums" style={{ color: nearLimit ? "var(--nc-danger)" : "var(--nc-text-3)" }}>
        {charCount}/{field.maxLength}
      </p>
    ) : null;

    switch (field.type) {
      case "textarea":
        return (
          <div>
            <textarea value={String(val ?? "")} onChange={(e) => setFieldValue(field.key, e.target.value)}
              placeholder={field.placeholder} maxLength={field.maxLength} rows={4}
              className={`${base} resize-none`} />
            {charCounter}
          </div>
        );
      case "color":
        return (
          <div className="flex items-center gap-3">
            <input type="color" value={String(val ?? "#6366f1")} onChange={(e) => setFieldValue(field.key, e.target.value)}
              className="nc-input h-10 w-16 cursor-pointer rounded-lg p-1" />
            <input type="text" value={String(val ?? "#6366f1")} onChange={(e) => setFieldValue(field.key, e.target.value)}
              placeholder="#6366f1" className="nc-input flex-1 rounded-xl px-3 py-2.5 text-sm font-mono" />
          </div>
        );
      case "select":
        return (
          <select value={String(val ?? field.placeholder ?? "")} onChange={(e) => setFieldValue(field.key, e.target.value)}
            className="nc-input w-full px-3 py-2.5 text-sm">
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
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
      case "array-category-skills":
        return <CategorySkillsEditor value={(val as unknown[]) ?? []} onChange={(v) => setFieldValue(field.key, v)} />;
      case "image-upload":
        return <ImageUploadField value={String(val ?? "")} onChange={(v) => setFieldValue(field.key, v)} placeholder={field.placeholder} />;
      case "audio-upload":
        return <AudioUploadField value={String(val ?? "")} onChange={(v) => setFieldValue(field.key, v)} placeholder={field.placeholder} hint={field.hint} />;
      case "datetime-local":
        return (
          <input type="datetime-local" value={String(val ?? "").slice(0, 16)} onChange={(e) => setFieldValue(field.key, e.target.value ? new Date(e.target.value).toISOString() : "")}
            className={base} />
        );
      default:
        return (
          <div>
            <input type={field.type} value={String(val ?? "")} onChange={(e) => setFieldValue(field.key, e.target.value)}
              placeholder={field.placeholder} maxLength={field.maxLength}
              className={base} />
            {charCounter}
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-3xl nc-page">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/dashboard" className="nc-btn-ghost mb-2 inline-block text-xs transition-colors">
            ← Back to Profiles
          </Link>
          <h1 className="break-all text-xl font-black sm:text-2xl">
            Edit <span className="text-indigo-400">/{profile.slug}</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
            {profile.category.name} · {profile.template.name}
            {profile.templateLocked && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-400">
                <Lock className="h-3 w-3" /> Template locked
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/qr/${profile.slug}`}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm ${
              profile.qrLocked
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                : "nc-btn-ghost"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            {profile.qrLocked ? "QR Locked" : "QR"}
          </Link>
          <Link href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer"
            className="nc-btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:px-4 sm:text-sm">
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </Link>
        </div>
      </div>

      {/* Success/error banner */}
      {successVisible && (
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
      <div className={`mb-6 rounded-2xl border px-4 py-3 transition-all sm:px-5 sm:py-4 ${
        isPublished
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-amber-500/20 bg-amber-500/5"
      }`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
              <p className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>
                {isPublished ? "Live — anyone with the link can view this" : "Draft — your profile is hidden from the public"}
              </p>
            </div>
            <p className="ml-4 break-all text-xs" style={{ color: "var(--nc-text-2)" }}>
              {isPublished
                ? <>www.nexcard.wetechmm.com/<strong className="text-indigo-400">{profile.slug}</strong> is accessible</>
                : <>Toggle to <strong>Publish</strong> so your URL goes live</>
              }
            </p>
          </div>
          <button type="button" onClick={() => setIsPublished((p) => !p)}
            className={`shrink-0 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
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
      {categorySlug === "digital-name-card" && (
        <div className="mb-4">
          <button type="button" onClick={() => setShowOcrScanner(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-sm font-semibold text-indigo-400 transition-all hover:bg-indigo-500/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Scan Business Card to Auto-Fill (OCR)
          </button>
        </div>
      )}

      {showOcrScanner && (
        <BusinessCardScanner
          onResult={handleOcrResult}
          onClose={() => setShowOcrScanner(false)}
        />
      )}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id} className="nc-card overflow-hidden rounded-2xl">
              <button onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--nc-text)" }}>{section.title}</p>
                  {section.description && (
                    <p className="mt-0.5 text-xs" style={{ color: "var(--nc-text-3)" }}>{section.description}</p>
                  )}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />}
              </button>

              {isOpen && (
                <div className="px-5 py-5 space-y-5">
                  {section.fields.map((field) => {
                    if (section.id === "rsvp" && field.key !== "rsvp._enabled") {
                      const rsvpEnabled = getFieldValue("rsvp._enabled");
                      if (rsvpEnabled !== "true") return null;
                    }
                    return (
                      <div key={field.key}>
                        <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                          {field.label}
                          {field.required && <span className="ml-1 text-red-400">*</span>}
                        </label>
                        {renderField(field)}
                        {field.hint && (
                          <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>{field.hint}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* SEO section */}
        <div className="nc-card overflow-hidden rounded-2xl">
          <button onClick={() => toggleSection("seo")}
            className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div>
              <p className="font-semibold text-sm">SEO & Social Sharing</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--nc-text-3)" }}>Override meta title, description, and OG image</p>
            </div>
            {openSections.has("seo") ? <ChevronUp className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />}
          </button>
          {openSections.has("seo") && (
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Meta Title <span style={{ color: "var(--nc-text-3)" }}>(max 160 chars)</span></label>
                <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={160} placeholder="Your Name · Job Title"
                  className="nc-input w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Meta Description <span style={{ color: "var(--nc-text-3)" }}>(max 320 chars)</span></label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={320} rows={3} placeholder="A short description for search engines and social sharing…"
                  className="nc-input w-full px-3 py-2.5 text-sm resize-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>OG / Social Preview Image <span style={{ color: "var(--nc-text-3)" }}>(1200×630 recommended)</span></label>
                <ImageUploadField value={ogImageUrl} onChange={setOgImageUrl} placeholder="https://…/og-image.jpg" folder="og-images" />
                <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>Leave blank to use the auto-generated branded OG image.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <form action={submitAction} className="mt-8">
        <input type="hidden" name="profileId" value={profile.id} />
        <input type="hidden" name="dynamicJsonData" value={(() => {
          const clean = { ...formData };
          if (clean.rsvp && typeof clean.rsvp === "object") {
            const r = { ...clean.rsvp } as Record<string, unknown>;
            const enabled = r._enabled;
            delete r._enabled;
            if (enabled === "true" && Object.keys(r).length > 0) {
              clean.rsvp = r;
            } else {
              delete clean.rsvp;
            }
          }
          return JSON.stringify(clean);
        })()} />
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

      <p className="mt-4 text-center text-xs" style={{ color: "var(--nc-text-3)" }}>
        Last saved: {new Date(profile.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}