// src/app/admin/revenue/_components/revenue-client.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download, Filter, Calendar, BarChart3, TrendingUp,
  CreditCard, Smartphone, QrCode, ChevronDown, X, Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";

type Category = { id: string; name: string; slug: string };
type Template = { id: string; name: string; codeIdentifier: string; categoryId: string };

type PaymentRow = {
  id: string;
  userName: string;
  userEmail: string;
  profileSlug: string;
  categoryName: string;
  templateName: string;
  tier: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

type RevenueStats = {
  totalRevenue: number;
  approvedRevenue: number;
  pendingRevenue: number;
  totalTransactions: number;
  byTier: Record<string, { count: number; revenue: number }>;
};

interface Props {
  categories: Category[];
  templates: Template[];
}

export function RevenueClient({ categories, templates }: Props) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [templateFilter, setTemplateFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filteredTemplates = categoryFilter === "ALL"
    ? templates
    : templates.filter((t) => t.categoryId === categoryFilter);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (templateFilter !== "ALL") params.set("template", templateFilter);
      if (tierFilter !== "ALL") params.set("tier", tierFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/admin/revenue?${params.toString()}`);
      const data = await res.json();
      setPayments(data.payments ?? []);
      setStats(data.stats ?? null);
    } catch {
      setPayments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, templateFilter, tierFilter, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function clearFilters() {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setTemplateFilter("ALL");
    setTierFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasActiveFilters = statusFilter !== "ALL" || categoryFilter !== "ALL" ||
    templateFilter !== "ALL" || tierFilter !== "ALL" || dateFrom || dateTo;

  function exportToExcel() {
    if (!payments.length) return;
    setExporting(true);

    const rows = payments.map((p) => ({
      Date: new Date(p.createdAt).toLocaleDateString("en-US"),
      User: p.userName,
      Email: p.userEmail,
      Profile: p.profileSlug,
      Category: p.categoryName,
      Template: p.templateName,
      Tier: p.tier.replace("_", " "),
      Amount: p.amount,
      Currency: p.currency,
      Status: p.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");

    // Summary sheet
    if (stats) {
      const summaryRows = [
        { Metric: "Total Revenue", Value: `${stats.approvedRevenue.toLocaleString()} MMK` },
        { Metric: "Pending Revenue", Value: `${stats.pendingRevenue.toLocaleString()} MMK` },
        { Metric: "Total Transactions", Value: stats.totalTransactions },
        { Metric: "", Value: "" },
        { Metric: "Tier Breakdown", Value: "" },
        ...Object.entries(stats.byTier).map(([tier, data]) => ({
          Metric: tier.replace("_", " "),
          Value: `${data.revenue.toLocaleString()} MMK (${data.count} txns)`,
        })),
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `nex-card-revenue-${date}.xlsx`);
    setExporting(false);
  }

  const tierIcon = (tier: string) => {
    switch (tier) {
      case "QR_ONLY": return <QrCode className="h-4 w-4" />;
      case "NFC_CARD": return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const tierLabel = (tier: string) => {
    switch (tier) {
      case "QR_ONLY": return "QR Only";
      case "NFC_CARD": return "NFC Only";
      case "PHYSICAL_CARD": return "QR + NFC";
      default: return tier.replace(/_/g, " ");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "rgba(34,197,94,0.25)" };
      case "PENDING": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" };
      case "REJECTED": return { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.25)" };
      default: return { bg: "var(--nc-bg-hover)", text: "var(--nc-text-2)", border: "var(--nc-border)" };
    }
  };

  const selectStyle = {
    background: "var(--nc-bg-card)",
    border: "1px solid var(--nc-border)",
    color: "var(--nc-text)",
    borderRadius: "0.75rem",
    padding: "0.5rem 2rem 0.5rem 0.75rem",
    fontSize: "0.8125rem",
    outline: "none",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%23888' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.5rem center",
  };

  const inputStyle = {
    background: "var(--nc-bg-card)",
    border: "1px solid var(--nc-border)",
    color: "var(--nc-text)",
    borderRadius: "0.75rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.8125rem",
    outline: "none",
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--nc-text)" }}>
            Revenue Reports
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
            Track payments, filter by category or date, and export to Excel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}>
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{ background: "var(--nc-brand-grad)" }}>
                {[statusFilter, categoryFilter, templateFilter, tierFilter, dateFrom, dateTo]
                  .filter((v) => v && v !== "ALL").length}
              </span>
            )}
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting || !payments.length}
            className="nc-btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border p-4"
          style={{ background: "var(--nc-bg-card)", borderColor: "var(--nc-border)" }}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle} className="w-full">
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Category</label>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setTemplateFilter("ALL"); }} style={selectStyle} className="w-full">
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Template */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Template</label>
              <select value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)} style={selectStyle} className="w-full">
                <option value="ALL">All Templates</option>
                {filteredTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Tier */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Tier</label>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={selectStyle} className="w-full">
                <option value="ALL">All Tiers</option>
                <option value="QR_ONLY">QR Only</option>
                <option value="NFC_CARD">NFC Only</option>
                <option value="PHYSICAL_CARD">QR + NFC</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} className="w-full" />
            </div>

            {/* Date To */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} className="w-full" />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2">
              <button onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                <X className="h-3 w-3" /> Clear Filters
              </button>
              <span className="text-[11px]" style={{ color: "var(--nc-text-3)" }}>
                {payments.length} result{payments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total Revenue"
            value={`${stats.approvedRevenue.toLocaleString()} MMK`}
            color="#22c55e"
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Pending Revenue"
            value={`${stats.pendingRevenue.toLocaleString()} MMK`}
            color="#f59e0b"
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Total Transactions"
            value={String(stats.totalTransactions)}
            color="#6366f1"
          />
          <StatCard
            icon={<QrCode className="h-5 w-5" />}
            label="Avg. Transaction"
            value={`${stats.totalTransactions > 0 ? Math.round(stats.approvedRevenue / stats.totalTransactions).toLocaleString() : 0} MMK`}
            color="#ec4899"
          />
        </div>
      )}

      {/* Tier Breakdown */}
      {stats && Object.keys(stats.byTier).length > 0 && (
        <div className="mb-6 rounded-2xl border p-5"
          style={{ background: "var(--nc-bg-card)", borderColor: "var(--nc-border)" }}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
            Revenue by Tier
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(stats.byTier).map(([tier, data]) => (
              <div key={tier} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "var(--nc-bg-hover)", border: "1px solid var(--nc-border)" }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--nc-brand-grad)", color: "var(--nc-brand-text)" }}>
                  {tierIcon(tier)}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>{tierLabel(tier)}</p>
                  <p className="text-sm font-black" style={{ color: "var(--nc-text)" }}>
                    {data.revenue.toLocaleString()} MMK
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>{data.count} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--nc-bg-card)", borderColor: "var(--nc-border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--nc-brand-2)" }} />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center">
            <BarChart3 className="mx-auto mb-3 h-10 w-10" style={{ color: "var(--nc-text-3)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--nc-text-2)" }}>No revenue data found</p>
            <p className="mt-1 text-xs" style={{ color: "var(--nc-text-3)" }}>Try adjusting your filters or wait for payments.</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--nc-border)" }}>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Date</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>User</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Profile</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Category</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Template</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Tier</th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Amount</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => {
                  const sc = statusColor(p.status);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-[var(--nc-bg-hover)]"
                      style={{ borderBottom: "1px solid var(--nc-border)" }}>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--nc-text-2)" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold" style={{ color: "var(--nc-text)" }}>{p.userName}</p>
                          <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>{p.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]" style={{ color: "var(--nc-text-2)" }}>
                        /{p.profileSlug}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--nc-text-2)" }}>{p.categoryName}</td>
                      <td className="px-4 py-3" style={{ color: "var(--nc-text-2)" }}>{p.templateName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold"
                          style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-2)", border: "1px solid var(--nc-border)" }}>
                          {tierIcon(p.tier)} {tierLabel(p.tier)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold whitespace-nowrap" style={{ color: "var(--nc-text)" }}>
                        {p.amount.toLocaleString()} {p.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg px-2 py-1 text-[10px] font-bold"
                          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {payments.length > PER_PAGE && (
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: "var(--nc-border)" }}>
              <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                Showing {Math.min((page - 1) * PER_PAGE + 1, payments.length)}–{Math.min(page * PER_PAGE, payments.length)} of {payments.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="nc-btn-ghost rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
                  Prev
                </button>
                {Array.from({ length: Math.ceil(payments.length / PER_PAGE) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${p === page ? "nc-btn-brand" : "nc-btn-ghost"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(Math.ceil(payments.length / PER_PAGE), p + 1))}
                  disabled={page >= Math.ceil(payments.length / PER_PAGE)}
                  className="nc-btn-ghost rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="rounded-2xl border p-5 transition-all hover:scale-[1.01]"
      style={{ background: "var(--nc-bg-card)", borderColor: "var(--nc-border)", boxShadow: "var(--nc-shadow)" }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-black" style={{ color: "var(--nc-text)" }}>{value}</p>
    </div>
  );
}
