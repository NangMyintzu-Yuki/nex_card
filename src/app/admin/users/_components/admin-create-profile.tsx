// src/app/admin/users/_components/admin-create-profile.tsx
// Modal for admin to create a new profile for any user

"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  adminCreateProfileAction,
  type AdminCreateProfileState,
} from "@/lib/actions/profile-actions";

type Template = {
  id: string;
  codeIdentifier: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPremium: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  templates: Template[];
};

type Props = {
  userId: string;
  userName: string;
  categories: Category[];
};

const CATEGORY_ICONS: Record<string, string> = {
  "digital-name-card": "🪪",
  portfolio: "🎨",
  "business-ad": "📢",
  "wedding-invitation": "💒",
};

const CATEGORY_COLORS: Record<string, string> = {
  "digital-name-card": "#3b82f6",
  portfolio: "#8b5cf6",
  "business-ad": "#f59e0b",
  "wedding-invitation": "#ec4899",
};

export function AdminCreateProfile({ userId, userName, categories }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"category" | "template" | "confirm">("category");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedTemplate = selectedCategory?.templates.find((t) => t.id === selectedTemplateId);

  const [state, formAction, isPending] = useActionState(
    async (_prev: AdminCreateProfileState, formData: FormData) => {
      return adminCreateProfileAction(_prev, formData);
    },
    { status: "idle" } as AdminCreateProfileState
  );

  function handleCategorySelect(catId: string) {
    setSelectedCategoryId(catId);
    setSelectedTemplateId(null);
    setStep("template");
  }

  function handleTemplateSelect(tplId: string) {
    setSelectedTemplateId(tplId);
    setSlug("");
    setSlugError("");
    setStep("confirm");
  }

  function handleSlugChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSlug(clean);
    setSlugError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (slug.length < 3) {
      e.preventDefault();
      setSlugError("Slug must be at least 3 characters");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      e.preventDefault();
      setSlugError("Only lowercase letters, numbers, and hyphens allowed");
      return;
    }
  }

  function reset() {
    setStep("category");
    setSelectedCategoryId(null);
    setSelectedTemplateId(null);
    setSlug("");
    setSlugError("");
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  if (state.status === "success") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="nc-btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="nc-card w-full max-w-md rounded-2xl p-6 text-center space-y-4">
              <div className="text-3xl">✅</div>
              <h3 className="text-lg font-bold" style={{ color: "var(--nc-text)" }}>Profile Created</h3>
              <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>
                <span className="font-semibold">{userName}</span> now has a profile at <code className="rounded bg-[var(--nc-bg-hover)] px-1.5 py-0.5 font-mono text-xs">/{state.slug}</code>
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleClose} className="nc-btn-ghost rounded-xl px-4 py-2 text-sm">Close</button>
                <a href={`/admin/users/${userId}/profiles/${state.profileId}`} className="nc-btn-brand rounded-xl px-4 py-2 text-sm font-bold">
                  Edit Profile
                </a>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nc-btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
      >
        <Plus className="h-3.5 w-3.5" />
        Create
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="nc-card w-full max-w-lg rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <div>
                <h3 className="font-bold" style={{ color: "var(--nc-text)" }}>
                  Create Profile for {userName}
                </h3>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  {step === "category" && "Choose a category"}
                  {step === "template" && "Pick a template"}
                  {step === "confirm" && "Enter a unique slug"}
                </p>
              </div>
              <button onClick={handleClose} className="nc-btn-ghost rounded-lg p-2 text-sm">✕</button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 px-4 py-3">
              {(["category", "template", "confirm"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      step === s ? "text-white" : ""
                    }`}
                    style={{
                      background: step === s ? "var(--nc-brand)" : "var(--nc-bg-hover)",
                      color: step === s ? "#fff" : "var(--nc-text-3)",
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && <div className="w-6 h-px" style={{ background: "var(--nc-border)" }} />}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {/* Step 1: Category */}
              {step === "category" && (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: "var(--nc-bg-hover)",
                        border: `2px solid transparent`,
                      }}
                    >
                      <div className="text-2xl mb-2">{CATEGORY_ICONS[cat.slug] ?? "📄"}</div>
                      <div className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>{cat.name}</div>
                      <div className="text-[11px] mt-1" style={{ color: "var(--nc-text-3)" }}>
                        {cat.templates.length} template{cat.templates.length !== 1 && "s"}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Template */}
              {step === "template" && selectedCategory && (
                <div>
                  <button onClick={() => { setStep("category"); setSelectedTemplateId(null); }} className="mb-3 text-xs font-bold" style={{ color: "var(--nc-brand)" }}>
                    ← Back to categories
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {selectedCategory.templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleTemplateSelect(tpl.id)}
                        className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.01]"
                        style={{ background: "var(--nc-bg-hover)", border: "2px solid transparent" }}
                      >
                        {tpl.thumbnailUrl ? (
                          <img src={tpl.thumbnailUrl} alt={tpl.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-xl" style={{ background: "var(--nc-bg)" }}>
                            {CATEGORY_ICONS[selectedCategory.slug] ?? "📄"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm truncate" style={{ color: "var(--nc-text)" }}>
                            {tpl.name}
                            {tpl.isPremium && <span className="ml-1 text-[10px]" style={{ color: CATEGORY_COLORS[selectedCategory.slug] ?? "var(--nc-brand)" }}>★ Premium</span>}
                          </div>
                          {tpl.description && (
                            <div className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--nc-text-3)" }}>
                              {tpl.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Slug */}
              {step === "confirm" && selectedCategory && selectedTemplate && (
                <div>
                  <button onClick={() => setStep("template")} className="mb-3 text-xs font-bold" style={{ color: "var(--nc-brand)" }}>
                    ← Back to templates
                  </button>

                  <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="userId" value={userId} />
                    <input type="hidden" name="categoryId" value={selectedCategoryId!} />
                    <input type="hidden" name="templateId" value={selectedTemplateId!} />

                    <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "var(--nc-bg-hover)" }}>
                      {selectedTemplate.thumbnailUrl ? (
                        <img src={selectedTemplate.thumbnailUrl} alt={selectedTemplate.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--nc-bg)" }}>
                          {CATEGORY_ICONS[selectedCategory.slug] ?? "📄"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs" style={{ color: "var(--nc-text-3)" }}>{selectedCategory.name}</div>
                        <div className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>{selectedTemplate.name}</div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                        Page URL
                      </label>
                      <div className="flex items-center rounded-xl" style={{ background: "var(--nc-bg-hover)", border: "1px solid var(--nc-border)" }}>
                        <span className="pl-3 text-xs" style={{ color: "var(--nc-text-3)" }}>nexcard.me/</span>
                        <input
                          type="text"
                          name="slug"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          placeholder="your-name"
                          className="w-full bg-transparent px-1 py-2.5 pr-3 text-sm font-mono outline-none"
                          style={{ color: "var(--nc-text)" }}
                        />
                      </div>
                      {(slugError || (state.status === "error" && state.message)) && (
                        <p className="mt-1.5 text-xs text-red-400">{slugError || (state.status === "error" ? state.message : "")}</p>
                      )}
                    </div>

                    {slug.length >= 3 && (
                      <div className="rounded-lg p-2 text-center text-xs font-mono" style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-2)" }}>
                        nexcard.me/{slug}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPending || slug.length < 3}
                      className="nc-btn-brand w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                    >
                      {isPending ? "Creating…" : "Create Profile"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
