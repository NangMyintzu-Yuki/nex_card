// src/app/admin/users/[userId]/profiles/[profileId]/admin-profile-editor.tsx
// Admin wrapper around ProfileEditor — uses adminUpdateProfileAction instead of user action

"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import {
  ExternalLink, Lock, Check, AlertCircle, Save,
  Eye, EyeOff, ChevronDown, ChevronUp, Plus, Trash2, QrCode,
} from "lucide-react";
import {
  adminUpdateProfileAction,
  type UpdateProfileState,
} from "@/lib/actions/profile-actions";
import { resolveImageUrl } from "@/lib/utils/image-url";

// ─────────────────────────────────────────────────────────────────────────────
// FIELD CONFIGS PER CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

interface FieldSection {
  label: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "email" | "tel" | "color" | "select" | "image-upload" | "datetime-local";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  options?: string[];
}

const CATEGORY_FIELD_SECTIONS: Record<string, FieldSection[]> = {
  "digital-name-card": [
    {
      label: "Identity",
      fields: [
        { key: "fullName", label: "Full Name", type: "text", required: true, maxLength: 30 },
        { key: "jobTitle", label: "Job Title", type: "text", required: true, maxLength: 120 },
        { key: "company", label: "Company", type: "text", maxLength: 30 },
        { key: "companyLogoUrl", label: "Company Logo URL", type: "url" },
        { key: "tagline", label: "Tagline", type: "text", maxLength: 150 },
        { key: "bio", label: "Bio", type: "textarea", maxLength: 1000 },
        { key: "avatarUrl", label: "Avatar URL", type: "url" },
      ],
    },
    {
      label: "Styling",
      fields: [
        { key: "accentColor", label: "Accent Color", type: "color" },
        { key: "backgroundStyle", label: "Background Style", type: "select", options: ["gradient", "solid", "mesh", "noise"] },
        { key: "featuredQuote", label: "Featured Quote", type: "textarea", maxLength: 300 },
      ],
    },
  ],
  "portfolio": [
    {
      label: "Identity",
      fields: [
        { key: "fullName", label: "Full Name", type: "text", required: true, maxLength: 50 },
        { key: "headline", label: "Headline", type: "text", required: true, maxLength: 200 },
        { key: "bio", label: "Bio", type: "textarea", required: true, maxLength: 2000 },
        { key: "avatarUrl", label: "Avatar URL", type: "url" },
        { key: "resumeUrl", label: "Resume URL", type: "url" },
      ],
    },
  ],
  "business-ad": [
    {
      label: "Business Info",
      fields: [
        { key: "businessName", label: "Business Name", type: "text", required: true, maxLength: 60 },
        { key: "tagline", label: "Tagline", type: "text", required: true, maxLength: 120 },
        { key: "description", label: "Description", type: "textarea", required: true, maxLength: 2000 },
        { key: "logoUrl", label: "Logo URL", type: "url" },
        { key: "heroImageUrl", label: "Hero Image URL", type: "url" },
        { key: "primaryCtaLabel", label: "CTA Button Text", type: "text", required: true, maxLength: 30 },
        { key: "primaryCtaUrl", label: "CTA Button URL", type: "url", required: true },
      ],
    },
  ],
  "wedding-invitation": [
    {
      label: "Couple",
      fields: [
        { key: "partner1.name", label: "Partner 1 Name", type: "text", required: true, maxLength: 40 },
        { key: "partner1.nickname", label: "Partner 1 Nickname", type: "text", maxLength: 20 },
        { key: "partner1.photoUrl", label: "Partner 1 Photo URL", type: "url" },
        { key: "partner2.name", label: "Partner 2 Name", type: "text", required: true, maxLength: 40 },
        { key: "partner2.nickname", label: "Partner 2 Nickname", type: "text", maxLength: 20 },
        { key: "partner2.photoUrl", label: "Partner 2 Photo URL", type: "url" },
      ],
    },
    {
      label: "Wedding Details",
      fields: [
        { key: "weddingDate", label: "Wedding Date", type: "datetime-local", required: true },
        { key: "headline", label: "Headline", type: "text", maxLength: 100 },
        { key: "coupleMessage", label: "Couple's Message", type: "textarea", maxLength: 500 },
        { key: "hashtag", label: "Hashtag", type: "text", maxLength: 40 },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: get nested value from object
// ─────────────────────────────────────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    const next = keys[i + 1]!;
    const isNextIndex = /^\d+$/.test(next);
    if (current[key] && typeof current[key] === "object") {
      current[key] = Array.isArray(current[key])
        ? [...(current[key] as unknown[])]
        : { ...(current[key] as Record<string, unknown>) };
    } else {
      current[key] = isNextIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = keys[keys.length - 1]!;
  current[lastKey] = value;
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
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
    () => (profile.dynamicJsonData as Record<string, unknown>) ?? {}
  );
  const [metaTitle, setMetaTitle] = useState(profile.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(profile.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(profile.ogImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(profile.isPublished);
  const [openSections, setOpenSections] = useState(new Set(["Identity", "Business Info", "Couple", "Wedding Details", "Styling"]));
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

  function renderField(field: FieldConfig) {
    const value = getNestedValue(formData, field.key);
    const strValue = typeof value === "string" ? value : "";

    switch (field.type) {
      case "text":
      case "url":
      case "email":
      case "tel":
        return (
          <input
            type={field.type}
            value={strValue}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder ?? field.label}
            maxLength={field.maxLength}
            className="nc-input w-full rounded-xl px-3 py-2 text-sm"
          />
        );
      case "textarea":
        return (
          <textarea
            value={strValue}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder ?? field.label}
            maxLength={field.maxLength}
            rows={3}
            className="nc-input w-full rounded-xl px-3 py-2 text-sm resize-y"
          />
        );
      case "color":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strValue || "#000000"}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="h-9 w-9 rounded-lg border cursor-pointer"
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
            className="nc-input w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "datetime-local":
        return (
          <input
            type="datetime-local"
            value={strValue}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="nc-input w-full rounded-xl px-3 py-2 text-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={strValue}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder ?? field.label}
            maxLength={field.maxLength}
            className="nc-input w-full rounded-xl px-3 py-2 text-sm"
          />
        );
    }
  }

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="profileId" value={profile.id} />
      <input type="hidden" name="dynamicJsonData" value={JSON.stringify(formData)} />
      <input type="hidden" name="metaTitle" value={metaTitle} />
      <input type="hidden" name="metaDescription" value={metaDescription} />
      <input type="hidden" name="ogImageUrl" value={ogImageUrl} />
      <input type="hidden" name="isPublished" value={String(isPublished)} />

      {/* Status toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-400"
          }`}
        >
          {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isPublished ? "Published" : "Draft"}
        </button>
        <a
          href={`/${profile.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: "var(--nc-brand)" }}
        >
          View live <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Field sections */}
      {sections.map((section) => (
        <div key={section.label} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--nc-border)" }}>
          <button
            type="button"
            onClick={() => toggleSection(section.label)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold"
            style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text)" }}
          >
            {section.label}
            {openSections.has(section.label) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openSections.has(section.label) && (
            <div className="space-y-3 p-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-3)" }}>
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {renderField(field)}
                  {field.maxLength && (
                    <p className="mt-0.5 text-[10px]" style={{ color: "var(--nc-text-3)" }}>
                      Max {field.maxLength} characters
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

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
          className="nc-btn-brand flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg"
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
