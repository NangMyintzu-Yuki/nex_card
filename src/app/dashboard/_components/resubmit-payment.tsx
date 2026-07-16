// src/app/dashboard/_components/resubmit-payment.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  Upload, X, QrCode, Smartphone, Package, ArrowRight,
  CheckCircle, XCircle, Clock, Loader2,
} from "lucide-react";
import { submitPaymentAction, type SubmitPaymentState } from "@/lib/actions/payment-actions";

interface Prices {
  priceQrOnly: number | null;
  priceNfcCard: number | null;
  priceNfcQr: number | null;
}

const TIER_OPTIONS: {
  value: "QR_ONLY" | "NFC_CARD" | "PHYSICAL_CARD";
  label: string;
  icon: typeof QrCode;
  priceKey: keyof Prices;
}[] = [
  { value: "QR_ONLY", label: "QR Only", icon: QrCode, priceKey: "priceQrOnly" },
  { value: "NFC_CARD", label: "NFC Only", icon: Smartphone, priceKey: "priceNfcCard" },
  { value: "PHYSICAL_CARD", label: "NFC + QR", icon: Package, priceKey: "priceNfcQr" },
];

function formatMMK(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount) + " MMK";
}

export function ResubmitPayment({
  profileId,
  templateName,
  prices,
  existingTier,
}: {
  profileId: string;
  templateName: string;
  prices: Prices;
  existingTier?: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<
    "QR_ONLY" | "NFC_CARD" | "PHYSICAL_CARD" | ""
  >(existingTier && (existingTier === "QR_ONLY" || existingTier === "NFC_CARD" || existingTier === "PHYSICAL_CARD")
      ? existingTier
      : "");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [state, submitPayment, pending] = useActionState<
    SubmitPaymentState,
    FormData
  >(submitPaymentAction, { status: "idle" });

  // Close + refresh on success
  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  // Reset internal state whenever the modal is (re)opened
  useEffect(() => {
    if (open) {
      setUploadError("");
      setScreenshotUrl("");
      setSelectedTier(
        existingTier &&
          (existingTier === "QR_ONLY" ||
            existingTier === "NFC_CARD" ||
            existingTier === "PHYSICAL_CARD")
          ? existingTier
          : ""
      );
    }
  }, [open, existingTier]);

  const availableTiers = TIER_OPTIONS.filter(
    (t) => prices[t.priceKey] != null
  );

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setScreenshotUrl(data.url);
      } else {
        setUploadError(data.error ?? "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit() {
    if (!selectedTier) return;
    const price = prices[TIER_OPTIONS.find((t) => t.value === selectedTier)!.priceKey];
    if (price == null) return;
    const fd = new FormData();
    fd.append("profileId", profileId);
    fd.append("tier", selectedTier);
    fd.append("amount", String(price));
    fd.append("screenshotUrl", screenshotUrl);
    submitPayment(fd);
  }

  if (availableTiers.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition-all"
        style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
      >
        <Upload className="h-3.5 w-3.5" />
        {existingTier ? "Resubmit Payment" : "Submit Payment"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl nc-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "var(--nc-border)" }}>
              <div>
                <h3 className="text-base font-black" style={{ color: "var(--nc-text)" }}>
                  {existingTier ? "Resubmit Payment" : "Submit Payment"}
                </h3>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  {templateName} · upload your payment proof
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                style={{ color: "var(--nc-text-3)" }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Tier selection */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--nc-text-3)" }}>Select Plan</p>
                <div className="grid gap-2">
                  {availableTiers.map((t) => {
                    const Icon = t.icon;
                    const price = prices[t.priceKey] as number;
                    const active = selectedTier === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setSelectedTier(t.value)}
                        className="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all"
                        style={
                          active
                            ? { borderColor: "var(--nc-brand-1)", background: "var(--nc-brand-1)10" }
                            : { borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }
                        }
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-5 w-5" style={{ color: "var(--nc-brand-1)" }} />
                          <span className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                            {t.label}
                          </span>
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>
                          {formatMMK(price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Screenshot upload */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--nc-text-3)" }}>Payment Screenshot</p>
                {screenshotUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: "var(--nc-brand-1)40", background: "var(--nc-bg-card)" }}>
                    <CheckCircle className="h-7 w-7 shrink-0 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>Screenshot uploaded</p>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Ready to submit</p>
                    </div>
                    <button type="button" onClick={() => setScreenshotUrl("")}
                      className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--nc-text-3)" }}>
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors hover:border-indigo-500/50"
                    style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}
                  >
                    {uploading ? (
                      <Loader2 className="mb-2 h-7 w-7 animate-spin" style={{ color: "var(--nc-text-3)" }} />
                    ) : (
                      <Upload className="mb-2 h-7 w-7" style={{ color: "var(--nc-text-3)" }} />
                    )}
                    <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                      Click to upload screenshot
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>
                      JPG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadError && (
                  <p className="mt-2 text-xs text-red-400">{uploadError}</p>
                )}
              </div>

              {/* Status / errors */}
              {state.status === "error" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {state.message}
                </div>
              )}
              {state.status === "success" && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  <Clock className="h-4 w-4 shrink-0" />
                  Payment submitted! Awaiting admin approval.
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedTier || !screenshotUrl || pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Submit Payment"}
                {!pending && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
