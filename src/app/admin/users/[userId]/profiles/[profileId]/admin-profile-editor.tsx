// src/app/admin/users/[userId]/profiles/[profileId]/admin-profile-editor.tsx
// Admin profile editor — full CRUD matching user dashboard capabilities

"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import {
  ExternalLink, Lock, Check, AlertCircle, Save,
  Eye, EyeOff, ChevronDown, ChevronUp, CreditCard, Moon, Sun, Loader2,
} from "lucide-react";
import {
  adminUpdateProfileAction,
  type UpdateProfileState,
} from "@/lib/actions/profile-actions";
import {
  CATEGORY_FIELD_SECTIONS,
  getNestedValue,
  setNestedValue,
  type FieldDef,
} from "@/components/profile-editors/field-configs";
import {
  ContactsEditor,
  SocialLinksEditor,
  SkillsEditor,
  CategorySkillsEditor,
  GalleryEditor,
  MilestonesEditor,
  EventsEditor,
  ServicesEditor,
  ProjectsEditor,
  ExperienceEditor,
  ImageUploadField,
} from "@/components/profile-editors/field-editors";

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO UPLOAD FIELD (admin-specific, simpler version)
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
          className="nc-btn-ghost flex items-center gap-2 rounded-lg border-dashed px-2 py-1.5 sm:px-3 sm:py-2 text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors disabled:opacity-50">
          {uploading ? (
            <><div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" /> Uploading...</>
          ) : (
            <>Upload Audio</>
          )}
        </button>
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className="flex-1 nc-input rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-sm min-w-0" />
      </div>
      {hint && <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{hint}</p>}
      {value && (
        <div className="nc-card flex items-center gap-3 rounded-xl p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs" style={{ color: "var(--nc-text-2)" }}>{value}</p>
            <p className="text-xs text-emerald-400 mt-0.5">Audio set</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// INLINE CARD EXPORT (for admin profile editor)
// ─────────────────────────────────────────────────────────────────────────────

const CARD_W = 2000;
const CARD_H = 1271;
const THEMES = {
  dark: { border: "/brand/dark_border.png", qr: "#000000", qrX: 993, qrY: 515, qrSize: 310 },
  light: { border: "/brand/white_border.png", qr: "#1a3a6b", qrX: 1034, qrY: 550, qrSize: 320 },
} as const;

async function generateQR(url: string, color: string): Promise<HTMLCanvasElement> {
  const QRCode = (await import("qrcode")).default;
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, { width: 400, margin: 0, color: { dark: color, light: "#ffffff00" }, errorCorrectionLevel: "H" });
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

function CardExportInline({ slug, profileId }: { slug: string; profileId: string }) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(theme: "dark" | "light") {
    setExporting(theme);
    try {
      const c = THEMES[theme];
      const profileUrl = `${window.location.origin}/p/${slug}`;
      const qrCanvas = await generateQR(profileUrl, c.qr);
      const borderImg = await loadImage(c.border);
      const canvas = document.createElement("canvas");
      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(borderImg, 0, 0, CARD_W, CARD_H);
      ctx.drawImage(qrCanvas, c.qrX - c.qrSize / 2, c.qrY - c.qrSize / 2, c.qrSize, c.qrSize);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nex-card-${slug}-${theme}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silent fail — user can retry
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleExport("dark")}
        disabled={exporting !== null}
        className="flex items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-bold transition-all sm:px-3 sm:text-xs"
        style={{ background: "#1a1a2e", color: "#d4af37", border: "1px solid #d4af3730", opacity: exporting !== null && exporting !== "dark" ? 0.5 : 1 }}
      >
        {exporting === "dark" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Moon className="h-3 w-3" />}
        <span className="hidden sm:inline">Dark</span>
      </button>
      <button
        onClick={() => handleExport("light")}
        disabled={exporting !== null}
        className="flex items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-bold transition-all sm:px-3 sm:text-xs"
        style={{ background: "#f0f4f8", color: "#1e3c6e", border: "1px solid #1e3c6e30", opacity: exporting !== null && exporting !== "light" ? 0.5 : 1 }}
      >
        {exporting === "light" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sun className="h-3 w-3" />}
        <span className="hidden sm:inline">Light</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface AdminProfileEditorProps {
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

export function AdminProfileEditor({ profile, categorySlug }: AdminProfileEditorProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    () => {
      const data = (profile.dynamicJsonData as Record<string, unknown>) ?? {};
      if (data.rsvp && typeof data.rsvp === "object" && !(data.rsvp as Record<string, unknown>)._enabled) {
        return { ...data, rsvp: { ...(data.rsvp as Record<string, unknown>), _enabled: "true" } };
      }
      return data;
    }
  );
  const [metaTitle, setMetaTitle] = useState(profile.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(profile.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(profile.ogImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(profile.isPublished);
  const [openSections, setOpenSections] = useState(new Set(["identity", "contacts", "couple", "wedding", "style"]));
  const [saveMessage, setSaveMessage] = useState("");

  const [state, dispatch, isPending] = useActionState<UpdateProfileState, FormData>(
    adminUpdateProfileAction,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }, [state.status]);

  const sections = CATEGORY_FIELD_SECTIONS[categorySlug] ?? [];

  function updateField(key: string, value: unknown) {
    setFormData((prev) => setNestedValue(prev, key, value));
  }

  function toggleSection(label: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function renderField(field: FieldDef) {
    const value = getNestedValue(formData, field.key);
    const strValue = typeof value === "string" ? value : "";
    const base = "nc-input w-full px-2 py-1.5 sm:px-3 sm:py-2.5 text-sm transition-colors";
    const charCount = typeof value === "string" ? value.length : 0;
    const nearLimit = field.maxLength && charCount > field.maxLength * 0.9;

    const charCounter = field.maxLength ? (
      <p className="mt-1 text-right text-xs tabular-nums" style={{ color: nearLimit ? "var(--nc-danger)" : "var(--nc-text-3)" }}>
        {charCount}/{field.maxLength}
      </p>
    ) : null;

    switch (field.type) {
      case "text":
      case "url":
      case "email":
      case "tel":
        return (
          <div>
            <input
              type={field.type}
              value={strValue}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder ?? field.label}
              maxLength={field.maxLength}
              className={base}
            />
            {charCounter}
          </div>
        );
      case "textarea":
        return (
          <div>
            <textarea
              value={strValue}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder ?? field.label}
              maxLength={field.maxLength}
              rows={3}
              className={`${base} resize-y`}
            />
            {charCounter}
          </div>
        );
      case "color":
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={strValue || "#000000"}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="nc-input h-10 w-16 cursor-pointer rounded-lg p-1"
            />
            <input
              type="text"
              value={strValue}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder="#000000"
              className="nc-input flex-1 rounded-xl px-3 py-2 text-sm font-mono"
            />
          </div>
        );
      case "select":
        return (
          <select
            value={strValue}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={base}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        );
      case "array-contacts":
        return <ContactsEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-social":
        return <SocialLinksEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-skills":
        return <SkillsEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-category-skills":
        return <CategorySkillsEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-gallery":
        return <GalleryEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-milestones":
        return <MilestonesEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-events":
        return <EventsEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-services":
        return <ServicesEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-projects":
        return <ProjectsEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "array-experience":
        return <ExperienceEditor value={(value as unknown[]) ?? []} onChange={(v) => updateField(field.key, v)} />;
      case "image-upload":
        return <ImageUploadField value={strValue} onChange={(v) => updateField(field.key, v)} placeholder={field.placeholder} />;
      case "audio-upload":
        return <AudioUploadField value={strValue} onChange={(v) => updateField(field.key, v)} placeholder={field.placeholder} hint={field.hint} />;
      case "datetime-local":
        return (
          <input
            type="datetime-local"
            value={strValue.slice(0, 16)}
            onChange={(e) => updateField(field.key, e.target.value ? new Date(e.target.value).toISOString() : "")}
            className={base}
          />
        );
      default:
        return (
          <div>
            <input
              type="text"
              value={strValue}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder ?? field.label}
              maxLength={field.maxLength}
              className={base}
            />
            {charCounter}
          </div>
        );
    }
  }

  return (
    <form action={dispatch} className="space-y-6">
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

      {/* Status toggle + Card Export */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold transition-colors ${
            isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-400"
          }`}
        >
          {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="hidden sm:inline">{isPublished ? "Published" : "Draft"}</span>
          <span className="sm:hidden">{isPublished ? "Live" : "Draft"}</span>
        </button>
        <a
          href={`/${profile.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-colors nc-btn-ghost"
          style={{ color: "var(--nc-brand)" }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">View live</span>
          <span className="sm:hidden">Preview</span>
        </a>
        <CardExportInline slug={profile.slug} profileId={profile.id} />
      </div>

      {/* Field sections */}
      {sections.map((section) => {
        const isOpen = openSections.has(section.id);
        return (
          <div key={section.id} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--nc-border)" }}>
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold"
              style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text)" }}
            >
              <div>
                {section.title}
                {section.description && (
                  <p className="mt-0.5 text-xs font-normal" style={{ color: "var(--nc-text-3)" }}>{section.description}</p>
                )}
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen && (
              <div className="space-y-3 p-3 sm:p-4">
                {section.fields.map((field) => {
                  if (section.id === "rsvp" && field.key !== "rsvp._enabled") {
                    const rsvpEnabled = getNestedValue(formData, "rsvp._enabled");
                    if (rsvpEnabled !== "true") return null;
                  }
                  return (
                    <div key={field.key}>
                      <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {renderField(field)}
                      {field.hint && (
                        <p className="mt-0.5 text-[10px]" style={{ color: "var(--nc-text-3)" }}>{field.hint}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* SEO */}
      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--nc-border)" }}>
        <h3 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>SEO & Social</h3>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>Meta Title</label>
          <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={60}
            className="nc-input w-full rounded-xl px-3 py-2 text-sm" placeholder="Page title for search engines" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>Meta Description</label>
          <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} rows={2}
            className="nc-input w-full rounded-xl px-3 py-2 text-sm resize-y" placeholder="Page description for search engines" />
        </div>
      </div>

      {/* Messages */}
      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </div>
      )}
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          {saveMessage}
        </div>
      )}

      {/* Save */}
      <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-6 flex justify-end rounded-t-xl border-t px-3 sm:px-6 py-3"
        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)" }}>
        <button
          type="submit"
          disabled={isPending}
          className="nc-btn-brand flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg sm:w-auto"
        >
          {isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}
