// src/app/admin/users/_components/admin-create-user.tsx
// Modal for admin to create a new user + profile in one flow

"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import {
  adminCreateUserWithProfileAction,
  type AdminCreateUserWithProfileState,
} from "@/lib/actions/profile-actions";

type Template = {
  id: string;
  codeIdentifier: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPremium: boolean;
  priceQrOnly: number | null;
  priceNfcQr: number | null;
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
  categories: Category[];
};

const CATEGORY_ICONS: Record<string, string> = {
  "digital-name-card": "🪪",
  portfolio: "🎨",
  "business-ad": "📢",
  "wedding-invitation": "💒",
};

type Step = "user" | "category" | "template" | "pricing" | "confirm";

export function AdminCreateUser({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("user");

  // User fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  // Profile fields
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<"QR_ONLY" | "NFC_QR" | null>(null);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [createProfile, setCreateProfile] = useState(true);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedTemplate = selectedCategory?.templates.find((t) => t.id === selectedTemplateId);
  const showPricing = selectedTemplate?.isPremium && createProfile;

  const [state, formAction, isPending] = useActionState(
    async (_prev: AdminCreateUserWithProfileState, formData: FormData) => {
      return adminCreateUserWithProfileAction(_prev, formData);
    },
    { status: "idle" } as AdminCreateUserWithProfileState
  );

  function handleSlugChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSlug(clean);
    setSlugError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (createProfile) {
      if (slug.length < 3) {
        e.preventDefault();
        setSlugError("Slug must be at least 3 characters");
        return;
      }
    }
  }

  function reset() {
    setStep("user");
    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    setSelectedCategoryId(null);
    setSelectedTemplateId(null);
    setSelectedTier(null);
    setSlug("");
    setSlugError("");
    setCreateProfile(true);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  const allSteps: Step[] = showPricing
    ? ["user", "category", "template", "pricing", "confirm"]
    : ["user", "category", "template", "confirm"];
  const stepIdx = allSteps.indexOf(step);

  function goNext() {
    setStep(allSteps[stepIdx + 1]);
  }

  function goBack() {
    setStep(allSteps[stepIdx - 1]);
  }

  // Success state
  if (state.status === "success") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="nc-btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
        >
          <Plus className="h-3.5 w-3.5" />
          Create User
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="nc-card w-full max-w-md rounded-2xl p-6 text-center space-y-4">
              <div className="text-3xl">✅</div>
              <h3 className="text-lg font-bold" style={{ color: "var(--nc-text)" }}>User Created</h3>
              <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>
                <span className="font-semibold">{state.userName}</span> ({state.userEmail})
                {state.profileSlug && (
                  <> has a profile at <code className="rounded bg-[var(--nc-bg-hover)] px-1.5 py-0.5 font-mono text-xs">/{state.profileSlug}</code></>
                )}
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleClose} className="nc-btn-ghost rounded-xl px-4 py-2 text-sm">Close</button>
                <a href={`/admin/users/${state.userId}`} className="nc-btn-brand rounded-xl px-4 py-2 text-sm font-bold">
                  View User
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
        Create User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="nc-card w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <div>
                <h3 className="font-bold" style={{ color: "var(--nc-text)" }}>Create New User</h3>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  {step === "user" && "Enter account details"}
                  {step === "category" && "Choose a profile category"}
                  {step === "template" && "Pick a template"}
                  {step === "pricing" && "Choose pricing tier"}
                  {step === "confirm" && "Set a unique slug & confirm"}
                </p>
              </div>
              <button onClick={handleClose} className="nc-btn-ghost rounded-lg p-2 text-sm">✕</button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-1 px-4 py-3">
              {allSteps.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: i <= stepIdx ? "var(--nc-brand)" : "var(--nc-bg-hover)",
                      color: i <= stepIdx ? "#fff" : "var(--nc-text-3)",
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < allSteps.length - 1 && <div className="w-4 h-px" style={{ background: "var(--nc-border)" }} />}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              <form action={formAction} onSubmit={handleSubmit}>
                {/* Step 1: User Info */}
                {step === "user" && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="nc-input w-full rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="nc-input w-full rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                        minLength={8}
                        className="nc-input w-full rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                        className="nc-input w-full rounded-xl px-3 py-2.5 text-sm"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    {state.status === "error" && (
                      <p className="text-xs text-red-400">{state.message}</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={handleClose} className="nc-btn-ghost flex-1 rounded-xl py-2.5 text-sm">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!name || !email || password.length < 8}
                        className="nc-btn-brand flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Category */}
                {step === "category" && (
                  <div className="space-y-3">
                    <button type="button" onClick={goBack} className="text-xs font-bold" style={{ color: "var(--nc-brand)" }}>
                      ← Back
                    </button>

                    <label className="flex items-center gap-2 rounded-xl p-3 cursor-pointer" style={{ background: "var(--nc-bg-hover)" }}>
                      <input
                        type="checkbox"
                        checked={createProfile}
                        onChange={(e) => setCreateProfile(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm font-medium" style={{ color: "var(--nc-text)" }}>Also create a profile</span>
                    </label>

                    {createProfile && (
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setSelectedCategoryId(cat.id); setSelectedTemplateId(null); setSelectedTier(null); setStep("template"); }}
                            className="rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
                            style={{ background: "var(--nc-bg-hover)", border: "2px solid transparent" }}
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

                    {!createProfile && (
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={goBack} className="nc-btn-ghost flex-1 rounded-xl py-2.5 text-sm">
                          ← Back
                        </button>
                        <button type="submit" disabled={isPending} className="nc-btn-brand flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50">
                          {isPending ? "Creating…" : "Create User Only"}
                        </button>
                      </div>
                    )}

                    {createProfile && (
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={goBack} className="nc-btn-ghost flex-1 rounded-xl py-2.5 text-sm">
                          ← Back
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Template */}
                {step === "template" && selectedCategory && (
                  <div className="space-y-3">
                    <button type="button" onClick={goBack} className="text-xs font-bold" style={{ color: "var(--nc-brand)" }}>
                      ← Back to categories
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                      {selectedCategory.templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(tpl.id);
                            setSelectedTier(null);
                            setSlug("");
                            setSlugError("");
                            setStep(tpl.isPremium ? "pricing" : "confirm");
                          }}
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
                              {tpl.isPremium && <span className="ml-1 text-[10px] text-amber-400">★ Premium</span>}
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

                {/* Step 4: Pricing Tier (only for premium templates) */}
                {step === "pricing" && selectedTemplate && (
                  <div className="space-y-3">
                    <button type="button" onClick={goBack} className="text-xs font-bold" style={{ color: "var(--nc-brand)" }}>
                      ← Back to templates
                    </button>
                    <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                      This is a premium template. Choose a pricing tier:
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedTemplate.priceQrOnly != null && (
                        <button
                          type="button"
                          onClick={() => { setSelectedTier("QR_ONLY"); setStep("confirm"); }}
                          className="rounded-xl p-4 text-left transition-all hover:scale-[1.01] flex items-center justify-between"
                          style={{
                            background: "var(--nc-bg-hover)",
                            border: selectedTier === "QR_ONLY" ? "2px solid var(--nc-brand)" : "2px solid transparent",
                          }}
                        >
                          <div>
                            <div className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>QR Only</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "var(--nc-text-3)" }}>
                              Digital QR code card
                            </div>
                          </div>
                          <div className="text-lg font-black" style={{ color: "var(--nc-brand)" }}>
                            ${selectedTemplate.priceQrOnly}
                          </div>
                        </button>
                      )}
                      {selectedTemplate.priceNfcQr != null && (
                        <button
                          type="button"
                          onClick={() => { setSelectedTier("NFC_QR"); setStep("confirm"); }}
                          className="rounded-xl p-4 text-left transition-all hover:scale-[1.01] flex items-center justify-between"
                          style={{
                            background: "var(--nc-bg-hover)",
                            border: selectedTier === "NFC_QR" ? "2px solid var(--nc-brand)" : "2px solid transparent",
                          }}
                        >
                          <div>
                            <div className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>NFC + QR</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "var(--nc-text-3)" }}>
                              Physical NFC card + digital QR
                            </div>
                          </div>
                          <div className="text-lg font-black" style={{ color: "var(--nc-brand)" }}>
                            ${selectedTemplate.priceNfcQr}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Slug + Confirm */}
                {step === "confirm" && selectedCategory && selectedTemplate && (
                  <div className="space-y-4">
                    <button type="button" onClick={goBack} className="text-xs font-bold" style={{ color: "var(--nc-brand)" }}>
                      ← Back
                    </button>

                    {/* User summary */}
                    <div className="rounded-xl p-3 space-y-1" style={{ background: "var(--nc-bg-hover)" }}>
                      <div className="text-xs" style={{ color: "var(--nc-text-3)" }}>Creating account for</div>
                      <div className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>{name}</div>
                      <div className="text-xs font-mono" style={{ color: "var(--nc-text-3)" }}>{email} · {role}</div>
                    </div>

                    {/* Template + Tier summary */}
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
                      {selectedTier && (
                        <div className="text-right shrink-0">
                          <div className="text-xs" style={{ color: "var(--nc-text-3)" }}>{selectedTier === "QR_ONLY" ? "QR Only" : "NFC + QR"}</div>
                          <div className="font-bold text-sm" style={{ color: "var(--nc-brand)" }}>
                            ${selectedTier === "QR_ONLY" ? selectedTemplate.priceQrOnly : selectedTemplate.priceNfcQr}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slug */}
                    <input type="hidden" name="name" value={name} />
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="password" value={password} />
                    <input type="hidden" name="role" value={role} />
                    <input type="hidden" name="categoryId" value={selectedCategoryId!} />
                    <input type="hidden" name="templateId" value={selectedTemplateId!} />
                    <input type="hidden" name="createProfile" value={createProfile ? "true" : "false"} />
                    <input type="hidden" name="tier" value={selectedTier ?? ""} />

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

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={goBack} className="nc-btn-ghost flex-1 rounded-xl py-2.5 text-sm">
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={isPending || (createProfile && slug.length < 3)}
                        className="nc-btn-brand flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                      >
                        {isPending ? "Creating…" : "Create User & Profile"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
