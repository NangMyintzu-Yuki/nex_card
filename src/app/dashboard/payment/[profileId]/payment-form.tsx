"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  Upload, QrCode, Smartphone, Package, ArrowRight,
  CheckCircle, XCircle, Clock, Loader2, Banknote,
} from "lucide-react";
import { submitPaymentAction, type SubmitPaymentState } from "@/lib/actions/payment-actions";
import { usePublicWallets } from "@/lib/payments/use-public-wallets";

interface Prices {
  priceQrOnly: number | null;
  priceNfcCard: number | null;
  priceNfcQr: number | null;
}

const PAYMENT_METHODS = {
  KBZPay: {
    label: "KBZPay",
    accountName: "NEX CARD",
    details: "KBZPay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
    deepLinkHint: "Open the KBZPay app → Transfer → enter the account above, then upload your screenshot.",
  },
  WavePay: {
    label: "WavePay",
    accountName: "NEX CARD",
    details: "WavePay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
    deepLinkHint: "Open WavePay → Send Money → use the number above, then upload your transfer screenshot.",
  },
  AYAPay: {
    label: "AYA Pay",
    accountName: "NEX CARD",
    details: "AYA Pay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
    deepLinkHint: "Complete the transfer in AYA Pay, then upload the confirmation screenshot.",
  },
} as const;

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

export function PaymentForm({
  profileId,
  templateName: _templateName,
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

  const wallets = usePublicWallets();
  const [paymentMethod, setPaymentMethod] = useState<keyof typeof PAYMENT_METHODS>("KBZPay");
  const [transactionRef, setTransactionRef] = useState("");
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

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard?pending=true");
    }
  }, [state, router]);

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
      fd.append("folder", "payments");
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
    fd.append("method", paymentMethod);
    if (transactionRef.trim()) fd.append("transactionRef", transactionRef.trim());
    submitPayment(fd);
  }

  if (availableTiers.length === 0) return null;

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Tier selection */}
      <section>
        <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--nc-text)" }}>1. Select Plan</h2>
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
                className="flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-4 text-left transition-all sm:px-5"
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
      </section>

      {/* Payment method */}
      <section>
        <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--nc-text)" }}>2. Payment Method</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <div className="flex justify-between gap-3">
              <span className="shrink-0" style={{ color: "var(--nc-text-3)" }}>Account</span>
              <span className="min-w-0 break-all text-right font-semibold" style={{ color: "var(--nc-text)" }}>{wallets.accountName || PAYMENT_METHODS[paymentMethod].accountName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="shrink-0" style={{ color: "var(--nc-text-3)" }}>Phone</span>
              <span className="min-w-0 break-all text-right font-semibold" style={{ color: "var(--nc-text)" }}>{wallets[paymentMethod] || "Set in Admin → Settings"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="shrink-0" style={{ color: "var(--nc-text-3)" }}>Number</span>
              <span className="min-w-0 break-all text-right font-mono font-semibold" style={{ color: "var(--nc-text)" }}>{wallets[paymentMethod] || "—"}</span>
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
            {PAYMENT_METHODS[paymentMethod].deepLinkHint}
          </p>
          <label className="mt-4 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
            Transaction reference (optional)
            <input
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. Wave/KBZ txn id"
              className="mt-1.5 w-full rounded-xl px-3 py-2 text-sm"
              style={{
                background: "var(--nc-bg)",
                border: "1px solid var(--nc-border)",
                color: "var(--nc-text)",
              }}
            />
          </label>
          <p className="mt-2 text-[11px]" style={{ color: "var(--nc-text-3)" }}>
            Online wallet transfer + screenshot proof (fallback). Method is stored with your payment.
          </p>
        </div>
      </section>

      {/* Screenshot upload */}
      <section>
        <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--nc-text)" }}>3. Upload Payment Screenshot</h2>
        {uploading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12"
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
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors hover:border-indigo-500/50"
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
      </section>

      {/* Status / errors */}
      {state.status === "error" && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
          <Clock className="h-5 w-5 shrink-0" />
          Payment submitted! Redirecting to dashboard...
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
  );
}
