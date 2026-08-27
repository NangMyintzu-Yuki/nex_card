// src/app/admin/payments/page.tsx
// Admin Payment Approvals — Review and approve/reject payment submissions

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { CheckCircle, BuildingIcon } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { ApproveRejectButtons } from "./_components/approve-reject-buttons";
import { CompanyVerifier } from "./_components/company-verifier";

export const metadata: Metadata = {
  title: "Payment Approvals — Admin — NEX CARD",
};

const TIER_LABELS: Record<string, string> = {
  QR_ONLY: "QR Only",
  NFC_QR: "NFC + QR",
};

function formatMMK(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount) + " MMK";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin/security");

  const { status } = await searchParams;

  const where: Record<string, string> = {};
  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    where.status = status;
  } else {
    // Default: show pending first
    where.status = "PENDING";
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tier: true,
      amount: true,
      originalPrice: true,
      discountPct: true,
      companyName: true,
      discountBreakdown: true,
      currency: true,
      screenshotUrl: true,
      status: true,
      adminNote: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      userProfile: {
        select: {
          id: true,
          slug: true,
          template: {
            select: {
              name: true,
              codeIdentifier: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const pendingCount = await prisma.payment.count({ where: { status: "PENDING" } });

  // Fetch companies pending verification
  const companyProfiles = await prisma.userProfile.findMany({
    where: { companyName: { not: null } },
    select: {
      userId: true,
      companyName: true,
      companyVerified: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const companyData = companyProfiles.map(p => ({
    userId: p.userId,
    userName: p.user.name,
    userEmail: p.user.email,
    companyName: p.companyName || "",
    companyVerified: p.companyVerified,
  }));

  const pendingCompanies = companyData.filter(c => c.companyVerified === "PENDING");

  return (
    <div className="mx-auto max-w-6xl nc-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Payment Approvals</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
          {pendingCount} pending payment{pendingCount !== 1 ? "s" : ""} awaiting review
          {pendingCompanies.length > 0 && ` · ${pendingCompanies.length} company verification${pendingCompanies.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Company Verification Section */}
      {companyData.length > 0 && (
        <div className="mb-8 rounded-2xl nc-card p-5">
          <h3 className="mb-4 text-lg font-bold flex items-center gap-2" style={{ color: "var(--nc-text)" }}>
            <BuildingIcon className="h-5 w-5" style={{ color: "var(--nc-brand-1)" }} />
            Company Verifications
          </h3>
          <CompanyVerifier companies={companyData} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "PENDING", label: "Pending", count: pendingCount },
          { value: "APPROVED", label: "Approved" },
          { value: "REJECTED", label: "Rejected" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/payments?status=${tab.value}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              (status || "PENDING") === tab.value
                ? "bg-indigo-500 text-white"
                : "nc-btn-ghost"
            }`}
            style={(status || "PENDING") !== tab.value ? { color: "var(--nc-text-2)" } : undefined}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Payments list */}
      {payments.length === 0 ? (
        <div className="nc-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <CheckCircle className="mb-4 h-12 w-12 text-emerald-400" />
          <h2 className="text-lg font-bold" style={{ color: "var(--nc-text)" }}>
            {status === "APPROVED" ? "No approved payments" : status === "REJECTED" ? "No rejected payments" : "All clear!"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--nc-text-3)" }}>
            {status === "PENDING" || !status
              ? "No pending payments to review."
              : "No payments match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="nc-card overflow-hidden rounded-2xl"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Screenshot preview */}
                <div className="flex-shrink-0 lg:w-64">
                  <div className="relative h-48 w-full lg:h-full" style={{ background: "var(--nc-bg-2)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/payments/proof/${payment.id}`}
                      alt="Payment screenshot"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold" style={{ color: "var(--nc-text)" }}>
                          {payment.user.name}
                        </h3>
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{
                          background: payment.status === "PENDING" ? "rgba(251,191,36,0.15)" : payment.status === "APPROVED" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: payment.status === "PENDING" ? "#fbbf24" : payment.status === "APPROVED" ? "#22c55e" : "#ef4444",
                        }}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="break-all text-sm" style={{ color: "var(--nc-text-2)" }}>{payment.user.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black" style={{ color: "var(--nc-brand-1)" }}>
                        {formatMMK(payment.amount)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                        {TIER_LABELS[payment.tier] || payment.tier}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Template</p>
                      <p className="font-semibold" style={{ color: "var(--nc-text)" }}>
                        {payment.userProfile.template.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Category</p>
                      <p className="font-semibold" style={{ color: "var(--nc-text)" }}>
                        {payment.userProfile.category.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Profile Slug</p>
                      <p className="break-all font-mono text-xs" style={{ color: "var(--nc-text)" }}>
                        /{payment.userProfile.slug}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Submitted</p>
                      <p style={{ color: "var(--nc-text)" }}>
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Company & Discount Info */}
                  {(payment.companyName || payment.discountPct) && (
                    <div className="mt-3 rounded-lg px-3 py-2 text-xs space-y-1" style={{ background: "var(--nc-bg-2)" }}>
                      {payment.companyName && (
                        <div className="flex items-center gap-1.5">
                          <BuildingIcon className="h-3 w-3" style={{ color: "var(--nc-brand-1)" }} />
                          <span style={{ color: "var(--nc-text-2)" }}>Company: <strong style={{ color: "var(--nc-text)" }}>{payment.companyName}</strong></span>
                        </div>
                      )}
                      {payment.originalPrice && payment.discountPct && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span>Discount: {payment.discountPct}% ({formatMMK(payment.originalPrice - payment.amount)} off)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {payment.adminNote && (
                    <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: "var(--nc-bg-2)", color: "var(--nc-text-2)" }}>
                      <strong>Note:</strong> {payment.adminNote}
                    </div>
                  )}

                  {/* Action buttons */}
                  {payment.status === "PENDING" && (
                    <div className="mt-4">
                      <ApproveRejectButtons paymentId={payment.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
