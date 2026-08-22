"use client";

import { useState, useTransition } from "react";
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag, Pencil, X, CheckCircle, AlertCircle,
} from "lucide-react";
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponActive,
} from "@/lib/actions/coupon-actions";
import { formatDate } from "@/lib/utils";

type CouponWithCategory = {
  id: string;
  code: string;
  discountQrOnly: number;
  discountNfcQr: number;
  expiresAt: Date | null;
  isActive: boolean;
  maxUses: number | null;
  usageCount: number;
  createdAt: Date;
  category: { name: string; slug: string };
  _count: { payments: number };
};

type Category = { id: string; name: string; slug: string };

const EMPTY_FORM = {
  code: "",
  categoryId: "",
  discountQrOnly: 10,
  discountNfcQr: 15,
  expiresAt: "",
  maxUses: "",
};

export function CouponManager({
  coupons: initial,
  categories,
}: {
  coupons: CouponWithCategory[];
  categories: Category[];
}) {
  const [coupons, setCoupons] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
    setError("");
  }

  function handleEdit(coupon: CouponWithCategory) {
    setEditing(coupon.id);
    setForm({
      code: coupon.code,
      categoryId: coupon.category ? categories.find((c) => c.name === coupon.category.name)?.id ?? "" : "",
      discountQrOnly: coupon.discountQrOnly,
      discountNfcQr: coupon.discountNfcQr,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      maxUses: coupon.maxUses?.toString() ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.set("code", form.code);
    fd.set("categoryId", form.categoryId);
    fd.set("discountQrOnly", String(form.discountQrOnly));
    fd.set("discountNfcQr", String(form.discountNfcQr));
    if (form.expiresAt) fd.set("expiresAt", form.expiresAt);
    if (form.maxUses) fd.set("maxUses", form.maxUses);

    startTransition(async () => {
      const result = editing
        ? await updateCouponAction(editing, fd)
        : await createCouponAction(fd);

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Validation failed");
        return;
      }

      setSuccess(editing ? "Coupon updated!" : "Coupon created!");
      setTimeout(() => setSuccess(""), 3000);

      // Refresh the list
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons ?? []);
      }

      resetForm();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const result = await deleteCouponAction(id);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : "Delete failed");
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setSuccess("Coupon deleted");
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleToggle(id: string) {
    const result = await toggleCouponActive(id);
    if (result.error) return;
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  }

  const inputStyle = {
    background: "var(--nc-bg-2)",
    border: "1px solid var(--nc-border)",
    color: "var(--nc-text)",
    borderRadius: "0.75rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
          <CheckCircle className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>
              {editing ? "Edit Coupon" : "Create Coupon"}
            </h2>
            <button type="button" onClick={resetForm} style={{ color: "var(--nc-text-3)" }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Coupon Code
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. SUMMER25"
                required
                className="rounded-xl px-3 py-2 text-sm font-mono uppercase"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="rounded-xl px-3 py-2 text-sm"
                style={inputStyle}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                QR Only Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountQrOnly}
                onChange={(e) => setForm({ ...form, discountQrOnly: Number(e.target.value) })}
                required
                className="rounded-xl px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                NFC + QR Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountNfcQr}
                onChange={(e) => setForm({ ...form, discountNfcQr: Number(e.target.value) })}
                required
                className="rounded-xl px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Expiry Date (optional)
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="rounded-xl px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>
                Max Uses (optional)
              </label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Unlimited"
                className="rounded-xl px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="nc-btn-brand flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {editing ? "Update Coupon" : "Create Coupon"}
          </button>
        </form>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="nc-btn-brand flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      )}

      {/* Coupons list */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
            <Tag className="mx-auto mb-3 h-8 w-8" style={{ color: "var(--nc-text-3)" }} />
            <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>No coupons yet</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", opacity: coupon.isActive ? 1 : 0.6 }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg px-2 py-0.5 text-xs font-mono font-bold"
                    style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}>
                    {coupon.code}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" }}>
                    {coupon.category.name}
                  </span>
                  {!coupon.isActive && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      INACTIVE
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs" style={{ color: "var(--nc-text-2)" }}>
                  <span>QR Only: <strong className="text-emerald-400">{coupon.discountQrOnly}%</strong></span>
                  <span>NFC + QR: <strong className="text-emerald-400">{coupon.discountNfcQr}%</strong></span>
                  {coupon.expiresAt && (
                    <span className={new Date(coupon.expiresAt) < new Date() ? "text-red-400" : ""}>
                      Expires: {formatDate(coupon.expiresAt)}
                    </span>
                  )}
                  {coupon.maxUses && <span>Uses: {coupon.usageCount}/{coupon.maxUses}</span>}
                  {!coupon.maxUses && <span>Uses: {coupon.usageCount}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(coupon.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ border: "1px solid var(--nc-border)", color: coupon.isActive ? "#22c55e" : "var(--nc-text-3)" }}
                  title={coupon.isActive ? "Deactivate" : "Activate"}
                >
                  {coupon.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleEdit(coupon)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ border: "1px solid var(--nc-border)", color: "#ef4444" }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
