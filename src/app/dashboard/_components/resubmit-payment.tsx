// src/app/dashboard/_components/resubmit-payment.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  Upload, X, QrCode, Smartphone, Package, ArrowRight,
  CheckCircle, XCircle, Clock, Loader2, Banknote,
} from "lucide-react";
import { submitPaymentAction, type SubmitPaymentState } from "@/lib/actions/payment-actions";

interface Prices {
  priceQrOnly: number | null;
  priceNfcCard: number | null;
  priceNfcQr: number | null;
}

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
  const [paymentMethod, setPaymentMethod] = useState<keyof typeof PAYMENT_METHODS>("KBZPay");
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
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-0"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full min-h-screen max-w-2xl mx-auto px-4 py-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl nc-card">
              <div className="flex items-center justify-between border-b px-6 py-5"
                style={{ borderColor: "var(--nc-border)" }}>
                <div>
                  <h3 className="text-lg font-black" style={{ color: "var(--nc-text)" }}>
                    {existingTier ? "Resubmit Payment" : "Submit Payment"}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>
                    {templateName} — upload your payment proof to activate your template
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-white/5"
                  style={{ color: "var(--nc-text-3)" }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                {/* Tier selection */}
                <div>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--nc-text)" }}>Select Plan</p>
                  <div className="grid gap-3">
                    {availableTiers.map((t) => {
                      const Icon = t.icon;
                      const price = prices[t.priceKey] as number;
                      const active = selectedTier === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setSelectedTier(t.value)}
                          className="flex items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition-all"
                          style={
                            active
                              ? { borderColor: "var(--nc-brand-1)", background: "var(--nc-brand-1)10" }
                              : { borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }
                          }
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-6 w-6" style={{ color: "var(--nc-brand-1)" }} />
                            <span className="text-base font-semibold" style={{ color: "var(--nc-text)" }}>
                              {t.label}
                            </span>
                          </span>
                          <span className="text-base font-bold" style={{ color: "var(--nc-text)" }}>
                            {formatMMK(price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--nc-text)" }}>Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(PAYMENT_METHODS) as Array<keyof typeof PAYMENT_METHODS>).map((key) => {
                      const pm = PAYMENT_METHODS[key];
                      const active = paymentMethod === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPaymentMethod(key)}
                          className="flex items-center justify-center gap-2 rounded-xl border-2 py-4 transition-all"
                          style={
                            active
                              ? { borderColor: "var(--nc-brand-1)", background: "var(--nc-brand-1)10" }
                              : { borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }
                          }
                        >
                          <Banknote className="h-5 w-5" style={{ color: active ? "var(--nc-brand-1)" : "var(--nc-text-3)" }} />
                          <span className="text-base font-semibold" style={{ color: active ? "var(--nc-brand-1)" : "var(--nc-text)" }}>
                            {pm.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-xl border p-4 text-sm" style={{ borderColor: "var(--nc-brand-2)20", background: "var(--nc-brand-2)08" }}>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--nc-text-3)" }}>Account</span>
                        <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{PAYMENT_METHODS[paymentMethod].accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--nc-text-3)" }}>Phone</span>
                        <span className="font-semibold" style={{ color: "var(--nc-text)" }}>{PAYMENT_METHODS[paymentMethod].phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--nc-text-3)" }}>Number</span>
                        <span className="font-mono font-semibold" style={{ color: "var(--nc-text)" }}>{PAYMENT_METHODS[paymentMethod].accountNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screenshot upload */}
                <div>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--nc-text)" }}>Payment Screenshot</p>
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10"
                      style={{ borderColor: "var(--nc-brand-1)40", background: "var(--nc-bg-card)" }}>
                      <Loader2 className="mb-3 h-8 w-8 animate-spin" style={{ color: "var(--nc-brand-1)" }} />
                      <p className="text-base font-semibold" style={{ color: "var(--nc-text)" }}>
                        Uploading...
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
                        Please wait while your screenshot is uploaded
                      </p>
                      <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full" style={{ background: "var(--nc-bg-2)" }}>
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-400" />
                      </div>
                    </div>
                  ) : screenshotUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border px-5 py-4"
                      style={{ borderColor: "var(--nc-brand-1)40", background: "var(--nc-bg-card)" }}>
                      <CheckCircle className="h-8 w-8 shrink-0 text-emerald-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold" style={{ color: "var(--nc-text)" }}>Screenshot uploaded</p>
                        <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>Ready to submit</p>
                      </div>
                      <button type="button" onClick={() => { setScreenshotUrl(""); setUploadError(""); }}
                        className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/5"
                        style={{ color: "var(--nc-text-3)" }}>
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors hover:border-indigo-500/50"
                      style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}
                    >
                      <Upload className="mb-3 h-8 w-8" style={{ color: "var(--nc-text-3)" }} />
                      <p className="text-base font-semibold" style={{ color: "var(--nc-text)" }}>
                        Click to upload screenshot
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
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
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <XCircle className="h-4 w-4 shrink-0" />
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* Status / errors */}
                {state.status === "error" && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                    {state.message}
                  </div>
                )}
                {state.status === "success" && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                    <Clock className="h-5 w-5 shrink-0" />
                    Payment submitted! Awaiting admin approval.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedTier || !screenshotUrl || pending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Submitting…" : "Submit Payment"}
                  {!pending && <ArrowRight className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
