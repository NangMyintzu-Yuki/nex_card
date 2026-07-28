// src/app/dashboard/onboarding/_components/onboarding-client.tsx
"use client";

import { useState, useEffect, useRef, useActionState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock, Check, ArrowRight, ChevronRight, Sparkles,
  AlertTriangle, ExternalLink, CreditCard, Upload, QrCode, Smartphone,
  Package, Clock, CheckCircle, XCircle,
} from "lucide-react";
import {
  selectTemplateAction,
  type SelectTemplateState,
} from "@/lib/actions/profile-actions";
import {
  submitPaymentAction,
  type SubmitPaymentState,
} from "@/lib/actions/payment-actions";

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
  priceQrOnly: number | null;
  priceNfcCard: number | null;
  priceNfcQr: number | null;
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

const TIER_INFO = {
  QR_ONLY: {
    label: "QR Only",
    icon: QrCode,
    description:
      "Digital QR code only — no physical card needed. Share your profile anywhere, instantly.",
    features: [
      "Pure digital QR code",
      "No physical card required",
      "Instant activation",
      "Share anywhere, anytime",
    ],
  },
  NFC_CARD: {
    label: "NFC Only",
    icon: Smartphone,
    description:
      "Physical NFC card — just tap to share. Note: some phones don't support NFC, so it won't work on those devices.",
    features: [
      "NFC tap-to-share",
      "Premium physical card",
      "Custom design",
      "Requires an NFC-enabled phone",
    ],
  },
  PHYSICAL_CARD: {
    label: "NFC + QR",
    icon: Package,
    description:
      "Physical card with both NFC and QR. If a device has no NFC, they can simply scan the QR code instead.",
    features: [
      "Physical card",
      "NFC tap-to-share",
      "QR code printed on card",
      "Works on any phone via QR scan",
    ],
  },
};

const PAYMENT_METHODS = {
  KBZPay: {
    label: "KBZPay",
    accountName: "NEX CARD",
    accountNumber: "09-123456789",
    phone: "09 123 456 789",
    details: "KBZPay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
  },
  AYAPay: {
    label: "AYA Pay",
    accountName: "NEX CARD",
    accountNumber: "09-987654321",
    phone: "09 987 654 321",
    details: "AYA Pay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
  },
};

const STEP_LABELS = {
  category: "Category",
  template: "Template",
  pricing: "Pricing",
  payment: "Payment",
  confirm: "Confirm",
};

// ─────────────────────────────────────────────────────────────────────────────
// SLUG SUGGESTION
// ─────────────────────────────────────────────────────────────────────────────

function generateSlugSuggestion(userId: string, categorySuffix: string): string {
  const base = userId.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${base}-${categorySuffix}`;
}

function formatMMK(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount) + " MMK";
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
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<keyof typeof PAYMENT_METHODS>("KBZPay");
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>("");
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [paymentUploadError, setPaymentUploadError] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [slugError, setSlugError] = useState<string>("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [step, setStep] = useState<"category" | "template" | "pricing" | "payment" | "confirm">(
    initialCategoryId ? "template" : "category"
  );

  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, submitAction, isPending] = useActionState<
    SelectTemplateState,
    FormData
  >(selectTemplateAction, { status: "idle" });

  const [paymentFormState, submitPayment, paymentPending] = useActionState<
    SubmitPaymentState,
    FormData
  >(submitPaymentAction, { status: "idle" });

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedTemplate = selectedCategory?.templates.find(
    (t) => t.id === selectedTemplateId
  );
  const isPremium = selectedTemplate?.isPremium ?? false;

  // Redirect after successful creation — also auto-submit payment for premium templates
  const [profileCreated, setProfileCreated] = useState(false);
  const [paymentAutoError, setPaymentAutoError] = useState<string>("");
  useEffect(() => {
    if (formState.status === "success" && !profileCreated) {
      setProfileCreated(true);
      if (isPremium && selectedTier && paymentScreenshotUrl) {
        const paymentFormData = new FormData();
        paymentFormData.append("profileId", formState.profileId);
        paymentFormData.append("tier", selectedTier);
        paymentFormData.append("amount",
          selectedTier === "QR_ONLY" ? String(selectedTemplate?.priceQrOnly)
            : selectedTier === "NFC_CARD" ? String(selectedTemplate?.priceNfcCard)
            : String(selectedTemplate?.priceNfcQr)
        );
        paymentFormData.append("screenshotUrl", paymentScreenshotUrl);
        submitPayment(paymentFormData);
      } else {
        router.push(`/dashboard?new=${formState.slug}`);
      }
    }
  }, [formState, router, isPremium, selectedTier, paymentScreenshotUrl, selectedTemplate, profileCreated, submitPayment]);

  // After payment submitted successfully, redirect
  useEffect(() => {
    if (profileCreated && paymentFormState.status === "success") {
      router.push(`/dashboard?pending=true`);
    }
    if (profileCreated && paymentFormState.status === "error") {
      setPaymentAutoError(paymentFormState.message);
    }
  }, [profileCreated, paymentFormState, router]);

  // Determine which steps to show
  const steps: Array<"category" | "template" | "pricing" | "payment" | "confirm"> = [
    "category", "template", "pricing", "payment", "confirm"
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (lockedCategoryIds.includes(categoryId)) return;
      setSelectedCategoryId(categoryId);
      setSelectedTemplateId("");
      setSelectedTier("");
      setPaymentScreenshotUrl("");
      setStep("template");
    },
    [lockedCategoryIds]
  );

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplateId((prev) => (prev === templateId ? prev : templateId));
  }, []);

  const handleProceedToPricing = () => {
    if (!selectedTemplateId) return;
    if (!isPremium) {
      setStep("confirm");
      return;
    }
    setStep("pricing");
  };

  const handleProceedToPayment = () => {
    if (!selectedTier) return;
    setStep("payment");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPaymentUploading(true);
    setPaymentUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        setPaymentScreenshotUrl(data.url);
      } else {
        setPaymentUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setPaymentUploadError("Upload failed. Please try again.");
    } finally {
      setPaymentUploading(false);
    }
  };

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
          const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(clean)}`);
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

  const getBackStep = (): typeof step => {
    const idx = steps.indexOf(step);
    return idx > 0 ? steps[idx - 1] : "category";
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-5 sm:px-6" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div></div>
          {/* <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold" style={{ color: "var(--nc-text)" }}>NEX CARD</span>
          </Link> */}

          {/* Step indicator */}
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs" style={{ color: "var(--nc-text-3)" }}>
            {steps.map((s, i) => (
              <span key={s} className="flex items-center gap-1 sm:gap-2">
                {i > 0 && <ChevronRight className="h-3 w-3 hidden sm:block" />}
                <span
                  className={step === s ? "font-semibold" : ""}
                  style={{ color: step === s ? "var(--nc-text)" : undefined }}
                >
                  {i + 1}. {STEP_LABELS[s]}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-6">

        {/* ══════════════════════════════════════════════════════════════
            STEP 1 — Category selection
        ══════════════════════════════════════════════════════════════ */}
        {step === "category" && (
          <div>
            <div className="mb-8 sm:mb-10 text-center">
              <h1 className="text-2xl font-black sm:text-3xl md:text-4xl">
                Choose Your Profile Category
              </h1>
              <p className="mt-3" style={{ color: "var(--nc-text-2)" }}>
                Each category gives you access to exclusive premium templates.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {categories.map((category) => {
                const isLocked = lockedCategoryIds.includes(category.id);
                const existingProfile = existingProfiles.find(
                  (p) => p.categoryId === category.id
                );
                const color = CATEGORY_COLOR[category.slug] ?? "#6366f1";
                const emoji = CATEGORY_EMOJI[category.slug] ?? "📄";

                return (
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
                    className={`group relative rounded-2xl border p-5 sm:p-6 transition-all select-none ${
                      isLocked
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    }`}
                    style={{
                      borderColor: isLocked ? "rgba(255,255,255,0.05)" : `${color}30`,
                      background: isLocked ? "rgba(255,255,255,0.02)" : `${color}08`,
                    }}
                  >
                    {isLocked && (
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full nc-card px-2.5 py-1 text-xs" style={{ color: "var(--nc-text-2)" }}>
                        <Lock className="h-3 w-3" />
                        Active
                      </div>
                    )}

                    <div className="mb-3 text-3xl sm:text-4xl">{emoji}</div>
                    <h3 className="text-lg font-black sm:text-xl" style={{ color: "var(--nc-text)" }}>{category.name}</h3>
                    {category.description && (
                      <p className="mt-1.5 text-xs sm:text-sm" style={{ color: "var(--nc-text-2)" }}>
                        {category.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color }}>
                        {category.templates.length} Templates
                      </span>

                      {isLocked && existingProfile ? (
                        <Link
                          href="/dashboard"
                          onClick={(e) => e.stopPropagation()}
                          className="nc-btn-ghost flex items-center gap-1 rounded-lg px-3 py-1 text-xs"
                        >
                          <Check className="h-3 w-3 text-emerald-400" />
                          Manage
                        </Link>
                      ) : (
                        <ArrowRight className="h-4 w-4 transition-colors" style={{ color: "var(--nc-text-3)" }} />
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
            <div className="mb-6 sm:mb-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("category")}
                className="nc-btn-ghost text-sm transition-colors px-2 py-1"
              >
                ← Back
              </button>
              <div className="h-4 w-px hidden sm:block" style={{ background: "var(--nc-border)" }} />
              <h1 className="text-xl font-black sm:text-2xl">
                {CATEGORY_EMOJI[selectedCategory.slug]}{" "}
                {selectedCategory.name}
              </h1>
            </div>

            {/* Lock-in warning */}
            <div className="mb-6 sm:mb-8 flex items-start gap-3 rounded-xl border px-4 py-3"
              style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--nc-text-2)" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                  This choice is permanent
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--nc-text-3)" }}>
                  Your template selection is locked once confirmed. Content can be updated anytime.
                </p>
              </div>
            </div>

            {/* Template grid */}
            <div
              role="radiogroup"
              aria-label="Select a template"
              className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            >
              {selectedCategory.templates.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                const accent = template.accentColor ?? CATEGORY_COLOR[selectedCategory.slug] ?? "#6366f1";
                const previewHref = `/dashboard/onboarding/preview/${template.codeIdentifier}?from=onboarding&categoryId=${selectedCategoryId}`;

                return (
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
                      isSelected ? "shadow-xl" : ""
                    }`}
                    style={
                      isSelected
                        ? { borderColor: `${accent}60`, background: `${accent}10` }
                        : { borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }
                    }
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden" style={{ background: "var(--nc-bg-2)" }}>
                      <Image
                        src={template.thumbnailUrl}
                        alt={template.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={
                          template.thumbnailUrl.endsWith(".svg") ||
                          template.thumbnailUrl.includes("placehold.co")
                        }
                      />

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
                        <h3 className="font-bold" style={{ color: "var(--nc-text)" }}>{template.name}</h3>
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
                        <p className="mb-3 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--nc-text-2)" }}>
                          {template.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: accent }}
                          />
                          <span className="truncate text-xs font-mono" style={{ color: "var(--nc-text-3)" }}>
                            {template.codeIdentifier}
                          </span>
                        </div>

                        <Link
                          href={previewHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex shrink-0 items-center gap-1 text-xs transition-colors"
                          style={{ color: "var(--nc-brand-2)" }}
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
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToPricing}
                  className="nc-btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                >
                  Choose Pricing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STEP 3 — Pricing tier selection (premium only)
        ══════════════════════════════════════════════════════════════ */}
        {step === "pricing" && selectedTemplate && (
          <div>
            <div className="mb-6 sm:mb-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("template")}
                className="nc-btn-ghost text-sm transition-colors px-2 py-1"
              >
                ← Back
              </button>
              <div className="h-4 w-px hidden sm:block" style={{ background: "var(--nc-border)" }} />
              <h1 className="text-xl font-black sm:text-2xl">
                Choose Your Plan
              </h1>
            </div>

            <p className="mb-6 sm:mb-8 text-sm" style={{ color: "var(--nc-text-2)" }}>
              Select how you&apos;d like to use the <strong style={{ color: "var(--nc-text)" }}>{selectedTemplate.name}</strong> template.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {(["QR_ONLY", "NFC_CARD", "PHYSICAL_CARD"] as const).map((tier) => {
                const info = TIER_INFO[tier];
                const Icon = info.icon;
                const price = tier === "QR_ONLY" ? selectedTemplate.priceQrOnly
                  : tier === "NFC_CARD" ? selectedTemplate.priceNfcCard
                  : selectedTemplate.priceNfcQr;

                const isSelected = selectedTier === tier;

                return (
                  <div
                    key={tier}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedTier(tier)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedTier(tier);
                      }
                    }}
                    className={`relative rounded-2xl border p-5 sm:p-6 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected ? "shadow-xl" : ""
                    }`}
                    style={
                      isSelected
                        ? { borderColor: "var(--nc-brand-1)60", background: "var(--nc-brand-1)10" }
                        : { borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }
                    }
                  >
                    {isSelected && (
                      <div className="absolute right-3 top-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "var(--nc-brand-1)" }}>
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--nc-bg-2)" }}>
                      <Icon className="h-6 w-6" style={{ color: "var(--nc-brand-1)" }} />
                    </div>

                    <h3 className="text-lg font-bold" style={{ color: "var(--nc-text)" }}>{info.label}</h3>
                    <p className="mt-1 text-xs" style={{ color: "var(--nc-text-2)" }}>{info.description}</p>

                    <div className="mt-4 mb-4">
                      <span className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>
                        {formatMMK(price ?? 0)}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {info.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--nc-text-2)" }}>
                          <Check className="h-3 w-3 shrink-0" style={{ color: "var(--nc-brand-1)" }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {selectedTier && (
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="nc-btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STEP 4 — Payment screenshot upload (premium only)
        ══════════════════════════════════════════════════════════════ */}
        {step === "payment" && selectedTemplate && selectedTier && (
          <div className="mx-auto max-w-xl">
            <div className="mb-6 sm:mb-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("pricing")}
                className="nc-btn-ghost text-sm transition-colors px-2 py-1"
              >
                ← Back
              </button>
              <div className="h-4 w-px hidden sm:block" style={{ background: "var(--nc-border)" }} />
              <h1 className="text-xl font-black sm:text-2xl">
                Upload Payment Proof
              </h1>
            </div>

            {/* Order summary */}
            <div className="mb-6 rounded-2xl nc-card p-5">
              <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--nc-text)" }}>Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--nc-text-2)" }}>Template</span>
                  <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{selectedTemplate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--nc-text-2)" }}>Plan</span>
                  <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{TIER_INFO[selectedTier as keyof typeof TIER_INFO]?.label}</span>
                </div>
                <div className="my-2 h-px" style={{ background: "var(--nc-border)" }} />
                <div className="flex justify-between">
                  <span className="font-bold" style={{ color: "var(--nc-text)" }}>Total</span>
                  <span className="font-bold" style={{ color: "var(--nc-brand-1)" }}>
                    {formatMMK(
                      selectedTier === "QR_ONLY" ? selectedTemplate.priceQrOnly!
                        : selectedTier === "NFC_CARD" ? selectedTemplate.priceNfcCard!
                        : selectedTemplate.priceNfcQr!
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold" style={{ color: "var(--nc-text)" }}>Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(PAYMENT_METHODS) as Array<keyof typeof PAYMENT_METHODS>).map((key) => {
                  const pm = PAYMENT_METHODS[key];
                  const active = paymentMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className="flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all"
                      style={
                        active
                          ? { borderColor: "var(--nc-brand-1)", background: "var(--nc-brand-1)10" }
                          : { borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }
                      }
                    >
                      <span className="text-lg font-black" style={{ color: active ? "var(--nc-brand-1)" : "var(--nc-text)" }}>
                        {pm.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account details */}
            <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--nc-brand-2)30", background: "var(--nc-brand-2)05" }}>
              <p className="mb-3 text-sm font-semibold" style={{ color: "var(--nc-brand-2)" }}>
                {PAYMENT_METHODS[paymentMethod].label} Account Details
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--nc-text-2)" }}>Account Name</span>
                  <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{PAYMENT_METHODS[paymentMethod].accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--nc-text-2)" }}>Phone Number</span>
                  <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{PAYMENT_METHODS[paymentMethod].phone}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--nc-text-2)" }}>Account Number</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--nc-text)" }}>{PAYMENT_METHODS[paymentMethod].accountNumber}</span>
                </div>
              </div>
              <p className="mt-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
                {PAYMENT_METHODS[paymentMethod].details} ကျေးဇူးပြု၍ ငွေလွှဲပြီးပါက အောက်တွင် Screenshot တင်ပေးပါ။
              </p>
            </div>

            {/* Screenshot upload */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                Payment Screenshot
              </label>

              {paymentUploading ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8"
                  style={{ borderColor: "var(--nc-brand-1)40", background: "var(--nc-bg-card)" }}>
                  <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/20 border-t-indigo-400" />
                  <p className="mt-4 text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                    Uploading...
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    Please wait while your screenshot is uploaded
                  </p>
                  <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full" style={{ background: "var(--nc-bg-2)" }}>
                    <div className="h-full w-full origin-left animate-pulse rounded-full bg-indigo-400" style={{ animation: "none", background: "linear-gradient(90deg, var(--nc-brand-1), #6366f1)" }} />
                  </div>
                </div>
              ) : paymentScreenshotUrl ? (
                <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: "var(--nc-brand-1)40" }}>
                  <div className="flex items-center gap-3 p-4" style={{ background: "var(--nc-bg-card)" }}>
                    <CheckCircle className="h-8 w-8 shrink-0 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>Screenshot uploaded</p>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Ready to submit</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPaymentScreenshotUrl(""); setPaymentUploadError(""); }}
                      className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/5"
                    >
                      <XCircle className="h-5 w-5" style={{ color: "var(--nc-text-3)" }} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer hover:border-indigo-500/50"
                  style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}
                >
                  <Upload className="mb-3 h-8 w-8" style={{ color: "var(--nc-text-3)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                    Click to upload screenshot
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              )}

              {paymentUploadError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {paymentUploadError}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Pending state from server action */}
            {paymentFormState.status === "success" && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <Clock className="h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Payment Submitted!</p>
                  <p className="text-xs text-emerald-400/70">Your submission is pending admin approval. You&apos;ll be able to edit your profile once approved.</p>
                </div>
              </div>
            )}

            {paymentFormState.status === "error" && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {paymentFormState.message}
              </div>
            )}

            {/* Continue to confirm */}
            {paymentFormState.status !== "success" && (
              <button
                type="button"
                onClick={handleProceedToConfirm}
                disabled={!paymentScreenshotUrl}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Confirm
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STEP 5/3 — Confirm & claim slug
        ══════════════════════════════════════════════════════════════ */}
        {step === "confirm" && selectedCategory && selectedTemplate && (
          <div className="mx-auto max-w-xl">
            <div className="mb-6 sm:mb-8">
              <button
                type="button"
                onClick={() => setStep(isPremium ? "payment" : "template")}
                className="nc-btn-ghost text-sm transition-colors px-2 py-1"
              >
                ← Back
              </button>
            </div>

            <h1 className="mb-2 text-2xl font-black sm:text-3xl">Almost there!</h1>
            <p className="mb-6 sm:mb-8" style={{ color: "var(--nc-text-2)" }}>
              Claim your public URL slug, then confirm your template.
            </p>

            {/* Summary card */}
            <div className="mb-6 overflow-hidden rounded-2xl nc-card p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-24 overflow-hidden rounded-xl sm:h-16 sm:w-28" style={{ background: "var(--nc-bg-2)" }}>
                  <Image
                    src={selectedTemplate.thumbnailUrl}
                    alt={selectedTemplate.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized={
                      selectedTemplate.thumbnailUrl.endsWith(".svg") ||
                      selectedTemplate.thumbnailUrl.includes("placehold.co")
                    }
                  />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>{selectedCategory.name}</p>
                  <p className="font-bold" style={{ color: "var(--nc-text)" }}>{selectedTemplate.name}</p>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {selectedTemplate.codeIdentifier}
                  </p>
                  {isPremium && selectedTier && (
                    <p className="mt-1 text-xs font-semibold" style={{ color: "var(--nc-brand-1)" }}>
                      {TIER_INFO[selectedTier as keyof typeof TIER_INFO]?.label}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Slug input */}
            <div className="mb-6">
              <label htmlFor="slug-input" className="mb-2 block text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                Choose your public URL
              </label>
              <div className="nc-input flex overflow-hidden rounded-xl focus-within:border-indigo-500/50 transition-colors">
                <span className="flex items-center px-3 text-xs whitespace-nowrap sm:text-sm" style={{ borderRight: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}>
                  nexcard.io/
                </span>
                <input
                  id="slug-input"
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="your-name"
                  className="flex-1 bg-transparent px-3 py-3 text-sm outline-none min-w-0"
                  style={{ color: "var(--nc-text)" }}
                  maxLength={60}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="mt-1.5 min-h-[1.25rem]">
                {slugError ? (
                  <p className="text-xs text-red-400">{slugError}</p>
                ) : slugChecking ? (
                  <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>Checking availability…</p>
                ) : slugAvailable === true ? (
                  <p className="text-xs text-emerald-400">
                    ✓ nexcard.io/{slug} is available
                  </p>
                ) : slugAvailable === false ? (
                  <p className="text-xs text-red-400">✗ That slug is already taken</p>
                ) : null}
              </div>

              <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>
                Lowercase letters, numbers, and hyphens only. 3–60 characters.
              </p>
            </div>

            {/* Final lock warning */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
              style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
              <Lock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--nc-text-2)" }} />
              <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>
                By confirming,{" "}
                <strong style={{ color: "var(--nc-text)" }}>{selectedTemplate.name}</strong>{" "}
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

            {/* Payment auto-submit error */}
            {paymentAutoError && (
              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
                <p className="font-semibold">Profile created, but payment submission failed.</p>
                <p className="mt-1">{paymentAutoError}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <span className="text-xs text-amber-400/70">You can resubmit payment from there.</span>
                </div>
              </div>
            )}

            {/* Submit form */}
            <form action={submitAction}>
              <input type="hidden" name="categoryId" value={selectedCategoryId} />
              <input type="hidden" name="templateId" value={selectedTemplateId} />
              <input type="hidden" name="slug" value={slug} />

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
