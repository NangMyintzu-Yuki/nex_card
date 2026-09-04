"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { maintenancePath } from "@/lib/maintenance-path";
import { useActionState } from "react";
import {
  Upload, QrCode, Smartphone, ArrowRight,
  CheckCircle, XCircle, Clock, Loader2, Banknote, Copy, Check,
  Tag, X, Percent, BuildingIcon, UsersIcon, Sparkles,
} from "lucide-react";
import { submitPaymentAction, type SubmitPaymentState } from "@/lib/actions/payment-actions";
import { usePublicWallets } from "@/lib/payments/use-public-wallets";

interface Prices {
  priceQrOnly: number | null;
  priceNfcQr: number | null;
}

const PAYMENT_METHODS = {
  KBZPay: {
    label: "KBZPay",
    accountName: "Shwe Yee Win",
    details: "KBZPay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
    deepLinkHint: "Open the KBZPay app → Transfer → enter the account above, then upload your screenshot.",
  },
  AYAPay: {
    label: "AYA Pay",
    accountName: "Shwe Yee Win",
    details: "AYA Pay အသုံးပြု၍ ငွေလွှဲနိုင်ပါသည်",
    deepLinkHint: "Complete the transfer in AYA Pay, then upload the confirmation screenshot.",
  },
} as const;

const TIER_OPTIONS: {
  value: "QR_ONLY" | "NFC_QR";
  label: string;
  icon: typeof QrCode;
  priceKey: keyof Prices;
}[] = [
  { value: "QR_ONLY", label: "QR Only", icon: QrCode, priceKey: "priceQrOnly" },
  { value: "NFC_QR", label: "NFC + QR", icon: Smartphone, priceKey: "priceNfcQr" },
];

function formatMMK(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount) + " MMK";
}

export function PaymentForm({
  profileId,
  categoryId,
  templateName: _templateName,
  prices,
  existingTier,
  userId,
}: {
  profileId: string;
  categoryId: string;
  templateName: string;
  prices: Prices;
  existingTier?: string | null;
  userId: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wallets = usePublicWallets();
  const [paymentMethod, setPaymentMethod] = useState<keyof typeof PAYMENT_METHODS>("KBZPay");
  const [transactionRef, setTransactionRef] = useState("");
  const [selectedTier, setSelectedTier] = useState<
    "QR_ONLY" | "NFC_QR" | ""
  >(existingTier && (existingTier === "QR_ONLY" || existingTier === "NFC_QR")
      ? existingTier
      : "");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [companyDiscountPct, setCompanyDiscountPct] = useState(0);
  const [bulkDiscountPct, setBulkDiscountPct] = useState(0);
  const [companyRulePct, setCompanyRulePct] = useState(0);
  const [bulkRulePct, setBulkRulePct] = useState(0);

  const hasCompany = companyName.trim().length > 0;
  const hasCoupon = !!appliedCoupon;

  const [state, submitPayment, pending] = useActionState<
    SubmitPaymentState,
    FormData
  >(submitPaymentAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      router.push(maintenancePath("/dashboard?pending=true"));
    }
  }, [state, router]);

  // Fetch applicable discount rules
  useEffect(() => {
    if (!selectedTier) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ categoryId });
        if (userId) params.set("userId", userId);
        const res = await fetch(`/api/discounts?${params}`);
        const data = await res.json();
        if (!cancelled) {
          const applied: Array<{ type: string; percentage: number }> = data.applied ?? [];
          let company = 0;
          let bulk = 0;
          for (const r of applied) {
            if (r.type === "COMPANY") company += r.percentage;
            if (r.type === "BULK") bulk += r.percentage;
          }
          setCompanyRulePct(company);
          setBulkRulePct(bulk);
          setBulkDiscountPct(bulk);
          // Company discount applies if user enters a company name
          if (companyName.trim().length > 0 && company > 0) {
            setCompanyDiscountPct(company);
          }
        }
      } catch {
        // silently ignore — no discount
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTier, categoryId, userId]);

  // Recalculate company discount when company name changes
  useEffect(() => {
    setCompanyDiscountPct(companyName.trim().length > 0 ? companyRulePct : 0);
  }, [companyName, companyRulePct]);

  const availableTiers = TIER_OPTIONS.filter(
    (t) => prices[t.priceKey] != null
  );

  const currentPriceKey = selectedTier ? TIER_OPTIONS.find((t) => t.value === selectedTier)?.priceKey : null;
  const originalPrice = currentPriceKey ? (prices[currentPriceKey] ?? 0) : 0;
  const couponPct = couponDiscount ?? 0;
  const autoDiscountPct = Math.min(companyDiscountPct + bulkDiscountPct, 50);
  const totalDiscountPct = Math.min(autoDiscountPct + couponPct, 100);
  const discountAmount = totalDiscountPct > 0 ? Math.round(originalPrice * totalDiscountPct / 100) : 0;
  const finalPrice = originalPrice - discountAmount;

  async function handleValidateCoupon() {
    if (!couponCode.trim() || !selectedTier) return;
    // Clear company when coupon is applied
    setCompanyName("");
    setCouponLoading(true);
    setCouponError("");
    setCouponDiscount(null);
    setAppliedCoupon(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), categoryId, tier: selectedTier }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discountPct);
        setAppliedCoupon(data.code);
      } else {
        setCouponError(data.error || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponCode("");
    setCouponDiscount(null);
    setAppliedCoupon(null);
    setCouponError("");
  }

  const couponCodeRef = useRef(couponCode);
  couponCodeRef.current = couponCode;
  const appliedCouponRef = useRef(appliedCoupon);
  appliedCouponRef.current = appliedCoupon;
  const categoryIdRef = useRef(categoryId);
  categoryIdRef.current = categoryId;

  useEffect(() => {
    if (!appliedCouponRef.current || !couponCodeRef.current || !selectedTier) return;
    let cancelled = false;
    (async () => {
      setCouponLoading(true);
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCodeRef.current, categoryId: categoryIdRef.current, tier: selectedTier }),
        });
        const data = await res.json();
        if (!cancelled) {
          if (data.valid) {
            setCouponDiscount(data.discountPct);
            setAppliedCoupon(data.code);
            setCouponError("");
          } else {
            setCouponDiscount(null);
            setAppliedCoupon(null);
            setCouponError(data.error || "Coupon no longer valid for this tier");
          }
        }
      } catch {
        if (!cancelled) setCouponError("Failed to re-validate coupon");
      } finally {
        if (!cancelled) setCouponLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTier]);

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
    fd.append("amount", String(finalPrice));
    fd.append("originalPrice", String(price));
    fd.append("screenshotUrl", screenshotUrl);
    fd.append("method", paymentMethod);
    if (transactionRef.trim()) fd.append("transactionRef", transactionRef.trim());
    if (companyName.trim()) fd.append("companyName", companyName.trim());
    // Automatic discounts
    fd.append("companyDiscountPct", String(companyDiscountPct));
    fd.append("bulkDiscountPct", String(bulkDiscountPct));
    // Coupon
    if (appliedCoupon) {
      fd.append("couponCode", appliedCoupon);
      fd.append("couponDiscountPct", String(couponDiscount));
    }
    // Combined breakdown
    fd.append("totalDiscountPct", String(totalDiscountPct));
    submitPayment(fd);
  }

  if (availableTiers.length === 0) {
    return (
      <div className="p-4 sm:p-8 text-center" style={{ color: "var(--nc-text-2)" }}>
        <p className="text-sm">Pricing is not available for this template yet. Please contact support.</p>
      </div>
    );
  }

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

      {/* Coupon Code — hidden when company name is filled */}
      {selectedTier && !companyName.trim() && (
        <section>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--nc-text)" }}>
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" style={{ color: "var(--nc-brand-1)" }} />
              Coupon Code
              {appliedCoupon && <span className="text-sm font-normal text-emerald-400">(Applied!)</span>}
            </span>
          </h2>
          {appliedCoupon ? (
            <div
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">{appliedCoupon}</p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {couponDiscount}% discount applied
                  </p>
                </div>
              </div>
              <button type="button" onClick={handleRemoveCoupon}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                style={{ color: "var(--nc-text-3)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleValidateCoupon(); } }}
                placeholder="Enter coupon code"
                disabled={couponLoading}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-mono uppercase"
                style={{
                  background: "var(--nc-bg-card)",
                  border: "1px solid var(--nc-border)",
                  color: "var(--nc-text)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || couponLoading}
                className="shrink-0 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}
              >
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </div>
          )}
          {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
        </section>
      )}

      {/* Company Name — hidden when coupon is applied */}
      {selectedTier && !appliedCoupon && (
        <section>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--nc-text)" }}>
            <span className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5" style={{ color: "var(--nc-brand-1)" }} />
              Company / Organization
              {companyDiscountPct > 0 && (
                <span className="text-sm font-normal text-emerald-400">
                  ({companyDiscountPct}% OFF)
                </span>
              )}
            </span>
          </h2>
          <input
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              if (e.target.value.trim().length > 0 && hasCoupon) {
                setCouponCode("");
                setCouponDiscount(null);
                setAppliedCoupon(null);
                setCouponError("");
              }
            }}
            placeholder="Enter company or organization name (optional)"
            disabled={hasCoupon}
            className="w-full rounded-xl px-4 py-3 text-sm disabled:opacity-50"
            style={{
              background: "var(--nc-bg-card)",
              border: "1px solid var(--nc-border)",
              color: "var(--nc-text)",
              outline: "none",
            }}
          />
          {hasCoupon && !hasCompany && (
            <p className="mt-1.5 text-xs" style={{ color: "var(--nc-text-3)" }}>
              Coupon is active. Clear coupon to use company discount instead.
            </p>
          )}

          {/* Discount status */}
          {hasCompany && companyDiscountPct > 0 && (
            <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {companyDiscountPct}% company discount applied
            </p>
          )}
          {hasCompany && companyDiscountPct === 0 && companyRulePct === 0 && (
            <p className="mt-2 text-xs" style={{ color: "var(--nc-text-3)" }}>
              No active company discount rule. Company name will be saved for admin review.
            </p>
          )}
        </section>
      )}

      {/* Price Breakdown */}
      {selectedTier && originalPrice > 0 && (
        <section>
          <div className="rounded-xl border p-4 space-y-2"
            style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
            <div className="flex justify-between text-sm" style={{ color: "var(--nc-text-2)" }}>
              <span>Original Price</span>
              <span>{formatMMK(originalPrice)}</span>
            </div>
            {companyDiscountPct > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span className="flex items-center gap-1"><BuildingIcon className="h-3 w-3" /> Company ({companyDiscountPct}%)</span>
                <span>-{formatMMK(Math.round(originalPrice * companyDiscountPct / 100))}</span>
              </div>
            )}
            {bulkDiscountPct > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> Bulk ({bulkDiscountPct}%)</span>
                <span>-{formatMMK(Math.round(originalPrice * bulkDiscountPct / 100))}</span>
              </div>
            )}
            {couponPct > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Coupon ({couponPct}%)</span>
                <span>-{formatMMK(Math.round(originalPrice * couponPct / 100))}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm font-semibold pt-1" style={{ borderTop: "1px dashed var(--nc-border)", color: "var(--nc-text-2)" }}>
                <span>Total Discount ({totalDiscountPct}%)</span>
                <span className="text-emerald-400">-{formatMMK(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-base font-bold"
              style={{ borderTop: "1px solid var(--nc-border)", color: "var(--nc-text)" }}>
              <span>Total to Pay</span>
              <span>{formatMMK(finalPrice)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Payment method */}
      <section>
        <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--nc-text)" }}>2. Payment Method</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0" style={{ color: "var(--nc-text-3)" }}>Phone</span>
              <span className="flex items-center gap-2">
                <span className="min-w-0 break-all text-right font-mono font-semibold" style={{ color: "var(--nc-text)" }}>{wallets[paymentMethod] || "09974133003"}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(wallets[paymentMethod] || "09974133003");
                    setCopiedPhone(true);
                    setTimeout(() => setCopiedPhone(false), 2000);
                  }}
                  className="shrink-0 rounded-lg p-1 transition-colors hover:bg-white/10"
                  title="Copy phone number"
                >
                  {copiedPhone ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
                  )}
                </button>
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
            {PAYMENT_METHODS[paymentMethod].deepLinkHint}
          </p>
          <p className="mt-2 text-[11px] font-semibold" style={{ color: "var(--nc-text)" }}>
            Transfer exactly: <span className="text-emerald-400">{formatMMK(finalPrice)}</span>
          </p>
          <label className="mt-3 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
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
