// src/app/dashboard/onboarding/_components/onboarding-client.tsx
"use client";

import { useState, useEffect, useRef, useActionState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock, Check, ArrowRight, ChevronRight, Sparkles,
  AlertTriangle, ExternalLink,
} from "lucide-react";
import {
  selectTemplateAction,
  type SelectTemplateState,
} from "@/lib/actions/profile-actions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryTemplate {
  id: string;
  codeIdentifier: string;
  name: string;
  description: string | null;
  thumbnailUrl: string;
  accentColor: string | null;
  isPremium: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  templates: CategoryTemplate[];
}

interface ExistingProfile {
  categoryId: string;
  templateLocked: boolean;
  slug: string;
  template: { codeIdentifier: string; name: string };
}

interface OnboardingClientProps {
  categories: Category[];
  lockedCategoryIds: string[];
  existingProfiles: ExistingProfile[];
  userId: string;
  initialCategoryId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  "digital-name-card": "💼",
  "portfolio": "🎨",
  "business-ad": "🏢",
  "wedding-invitation": "💍",
};

const CATEGORY_COLOR: Record<string, string> = {
  "digital-name-card": "#6366f1",
  "portfolio": "#0ea5e9",
  "business-ad": "#f59e0b",
  "wedding-invitation": "#ec4899",
};

// ─────────────────────────────────────────────────────────────────────────────
// SLUG SUGGESTION
// ─────────────────────────────────────────────────────────────────────────────

function generateSlugSuggestion(userId: string, categorySuffix: string): string {
  const base = userId.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${base}-${categorySuffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function OnboardingClient({
  categories,
  lockedCategoryIds,
  existingProfiles,
  userId,
  initialCategoryId,
}: OnboardingClientProps) {
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId ?? ""
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [slug, setSlug]                 = useState<string>("");
  const [slugError, setSlugError]       = useState<string>("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [step, setStep] = useState<"category" | "template" | "confirm">(
    initialCategoryId ? "template" : "category"
  );

  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formState, submitAction, isPending] = useActionState<
    SelectTemplateState,
    FormData
  >(selectTemplateAction, { status: "idle" });

  // Redirect after successful creation — must be in useEffect, not render
  useEffect(() => {
    if (formState.status === "success") {
      router.push(`/dashboard?new=${formState.slug}`);
    }
  }, [formState, router]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedTemplate = selectedCategory?.templates.find(
    (t) => t.id === selectedTemplateId
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (lockedCategoryIds.includes(categoryId)) return;
      setSelectedCategoryId(categoryId);
      setSelectedTemplateId("");
      setStep("template");
    },
    [lockedCategoryIds]
  );

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplateId((prev) => (prev === templateId ? prev : templateId));
  }, []);

  const handleSlugChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(clean);
    setSlugAvailable(null);

    if (clean.length > 0 && clean.length < 3) {
      setSlugError("Slug must be at least 3 characters.");
      return;
    }
    if (clean.length > 60) {
      setSlugError("Slug must be under 60 characters.");
      return;
    }
    setSlugError("");

    if (clean.length >= 3) {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current);
      setSlugChecking(true);
      slugTimerRef.current = setTimeout(async () => {
        try {
          const res  = await fetch(`/api/slug/check?slug=${encodeURIComponent(clean)}`);
          const data = await res.json() as { available: boolean; message: string };
          setSlugAvailable(data.available);
          if (!data.available) setSlugError(data.message);
        } catch {
          setSlugAvailable(null);
        } finally {
          setSlugChecking(false);
        }
      }, 400);
    }
  };

  const handleProceedToConfirm = () => {
    if (!selectedTemplateId) return;
    if (!slug) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      setSlug(generateSlugSuggestion(userId, cat?.slug.slice(0, 4) ?? "card"));
    }
    setStep("confirm");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">PresenceCard</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {(["category", "template", "confirm"] as const).map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={step === s ? "font-semibold text-white" : ""}>
                  {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* ══════════════════════════════════════════════════════════════
            STEP 1 — Category selection
        ══════════════════════════════════════════════════════════════ */}
        {step === "category" && (
          <div>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-black md:text-4xl">
                Choose Your Profile Category
              </h1>
              <p className="mt-3 text-neutral-400">
                Each category gives you access to 5 exclusive premium templates.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {categories.map((category) => {
                const isLocked       = lockedCategoryIds.includes(category.id);
                const existingProfile = existingProfiles.find(
                  (p) => p.categoryId === category.id
                );
                const color = CATEGORY_COLOR[category.slug] ?? "#6366f1";
                const emoji = CATEGORY_EMOJI[category.slug] ?? "📄";

                return (
                  /* ── Use <div role="button"> so we can safely nest a <Link> ── */
                  <div
                    key={category.id}
                    role={isLocked ? undefined : "button"}
                    tabIndex={isLocked ? undefined : 0}
                    onClick={() => !isLocked && handleCategorySelect(category.id)}
                    onKeyDown={(e) => {
                      if (!isLocked && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleCategorySelect(category.id);
                      }
                    }}
                    className={`group relative rounded-2xl border p-6 transition-all select-none ${
                      isLocked
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    }`}
                    style={{
                      borderColor: isLocked ? "rgba(255,255,255,0.05)" : `${color}30`,
                      background: isLocked ? "rgba(255,255,255,0.02)" : `${color}08`,
                    }}
                  >
                    {/* Active badge */}
                    {isLocked && (
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-500">
                        <Lock className="h-3 w-3" />
                        Active
                      </div>
                    )}

                    <div className="mb-3 text-4xl">{emoji}</div>
                    <h3 className="text-xl font-black text-white">{category.name}</h3>
                    {category.description && (
                      <p className="mt-1.5 text-sm text-neutral-400">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color }}>
                        {category.templates.length} Templates
                      </span>

                      {/* 
                        ── FIX: Link is a sibling of the card div, NOT nested inside a button.
                           We stop propagation so clicking "Manage" doesn't also fire handleCategorySelect.
                      */}
                      {isLocked && existingProfile ? (
                        <Link
                          href="/dashboard"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-neutral-400 hover:border-white/20 hover:text-white transition-all"
                        >
                          <Check className="h-3 w-3 text-emerald-400" />
                          Manage
                        </Link>
                      ) : (
                        <ArrowRight className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STEP 2 — Template selection
        ══════════════════════════════════════════════════════════════ */}
        {step === "template" && selectedCategory && (
          <div>
            <div className="mb-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("category")}
                className="text-sm text-neutral-500 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <div className="h-4 w-px bg-white/10" />
              <h1 className="text-2xl font-black">
                {CATEGORY_EMOJI[selectedCategory.slug]}{" "}
                {selectedCategory.name} Templates
              </h1>
            </div>

            {/* Lock-in warning */}
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  This choice is permanent
                </p>
                <p className="mt-0.5 text-xs text-amber-400/70">
                  Your template selection is locked once confirmed to maintain brand
                  consistency. You can always update your content, photos, and links
                  — but not the template.
                </p>
              </div>
            </div>

            {/* Template grid */}
            <div
              role="radiogroup"
              aria-label="Select a template"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {selectedCategory.templates.map((template) => {
                const isSelected  = selectedTemplateId === template.id;
                const accent      = template.accentColor ?? CATEGORY_COLOR[selectedCategory.slug] ?? "#6366f1";
                const previewHref = `/dashboard/onboarding/preview/${template.codeIdentifier}?from=onboarding&categoryId=${selectedCategoryId}`;

                return (
                  /*
                    ── FIX: The card is a <div role="radio"> — NOT a <button>.
                       This allows the Preview <Link> to live INSIDE it without
                       violating HTML's "interactive content inside button" rule.
                       Accessibility is preserved via role, aria-checked, tabIndex,
                       and keyboard handler.
                  */
                  <div
                    key={template.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => handleTemplateSelect(template.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTemplateSelect(template.id);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "shadow-xl"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10"
                    }`}
                    style={
                      isSelected
                        ? { borderColor: `${accent}60`, background: `${accent}10` }
                        : {}
                    }
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                      <Image
                        src={template.thumbnailUrl}
                        alt={template.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={template.thumbnailUrl.includes("placehold.co")}
                      />

                      {/* PRO badge */}
                      {template.isPremium && (
                        <div className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
                          PRO
                        </div>
                      )}

                      {/* Selected overlay */}
                      {isSelected && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: `${accent}40` }}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                            <Check className="h-5 w-5 text-neutral-900" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white">{template.name}</h3>
                        {isSelected && (
                          <div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                            style={{ background: accent }}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      {template.description && (
                        <p className="mb-3 text-xs leading-relaxed text-neutral-500 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      {/* Footer row: accent dot + code + preview link */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: accent }}
                          />
                          <span className="truncate text-xs font-mono text-neutral-600">
                            {template.codeIdentifier}
                          </span>
                        </div>

                        {/*
                          ── Preview link — valid because parent is <div>, not <button>.
                             stopPropagation prevents the card's onClick from also firing.
                        */}
                        <Link
                          href={previewHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex shrink-0 items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          aria-label={`Preview ${template.name} template`}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue CTA */}
            {selectedTemplateId && (
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToConfirm}
                  className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  Continue with {selectedTemplate?.name}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STEP 3 — Confirm & claim slug
        ══════════════════════════════════════════════════════════════ */}
        {step === "confirm" && selectedCategory && selectedTemplate && (
          <div className="mx-auto max-w-xl">
            <div className="mb-8">
              <button
                type="button"
                onClick={() => setStep("template")}
                className="text-sm text-neutral-500 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>

            <h1 className="mb-2 text-3xl font-black">Almost there!</h1>
            <p className="mb-8 text-neutral-400">
              Claim your public URL slug, then confirm your template.
            </p>

            {/* Summary card */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-28 overflow-hidden rounded-xl bg-neutral-800">
                  <Image
                    src={selectedTemplate.thumbnailUrl}
                    alt={selectedTemplate.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized={selectedTemplate.thumbnailUrl.includes("placehold.co")}
                  />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">{selectedCategory.name}</p>
                  <p className="font-bold text-white">{selectedTemplate.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-neutral-600">
                    {selectedTemplate.codeIdentifier}
                  </p>
                </div>
              </div>
            </div>

            {/* Slug input */}
            <div className="mb-6">
              <label htmlFor="slug-input" className="mb-2 block text-sm font-semibold text-neutral-300">
                Choose your public URL
              </label>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:border-indigo-500/50 transition-colors">
                <span className="flex items-center border-r border-white/10 px-3 text-sm text-neutral-600 whitespace-nowrap">
                  presencecard.io/
                </span>
                <input
                  id="slug-input"
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="your-name"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-neutral-700 outline-none min-w-0"
                  maxLength={60}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Slug status messages — only show one at a time */}
              <div className="mt-1.5 min-h-[1.25rem]">
                {slugError ? (
                  <p className="text-xs text-red-400">{slugError}</p>
                ) : slugChecking ? (
                  <p className="text-xs text-neutral-500">Checking availability…</p>
                ) : slugAvailable === true ? (
                  <p className="text-xs text-emerald-400">
                    ✓ presencecard.io/{slug} is available
                  </p>
                ) : slugAvailable === false ? (
                  <p className="text-xs text-red-400">✗ That slug is already taken</p>
                ) : null}
              </div>

              <p className="mt-1 text-xs text-neutral-600">
                Lowercase letters, numbers, and hyphens only. 3–60 characters.
              </p>
            </div>

            {/* Final lock warning */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-400/80">
                By confirming,{" "}
                <strong className="text-amber-300">{selectedTemplate.name}</strong>{" "}
                will be permanently locked to this profile. Your content, links, and
                photos can still be edited anytime.
              </p>
            </div>

            {/* Server-action error */}
            {formState.status === "error" && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {formState.message}
              </div>
            )}

            {/* Submit form */}
            <form action={submitAction}>
              <input type="hidden" name="categoryId" value={selectedCategoryId} />
              <input type="hidden" name="templateId" value={selectedTemplateId} />
              <input type="hidden" name="slug"       value={slug} />

              <button
                type="submit"
                disabled={
                  isPending ||
                  !!slugError ||
                  slug.length < 3 ||
                  slugChecking ||
                  slugAvailable === false
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating your profile…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Confirm &amp; Lock Template
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}