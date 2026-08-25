"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, BuildingIcon, ExternalLink, Loader2 } from "lucide-react";
import { verifyCompanyAction } from "@/lib/actions/discount-calc-actions";

interface CompanyInfo {
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  companyVerified: string;
}

interface Props {
  companies: CompanyInfo[];
  onVerified?: () => void;
}

export function CompanyVerifier({ companies, onVerified }: Props) {
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleVerify = (userId: string, status: "VERIFIED" | "REJECTED") => {
    setProcessingId(userId);
    startTransition(async () => {
      await verifyCompanyAction({ userId, status });
      setProcessingId(null);
      onVerified?.();
    });
  };

  const pending = companies.filter(c => c.companyVerified === "PENDING");
  const verified = companies.filter(c => c.companyVerified === "VERIFIED");
  const rejected = companies.filter(c => c.companyVerified === "REJECTED");

  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        No company registrations yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            Pending Verification ({pending.length})
          </h4>
          <div className="space-y-3">
            {pending.map(c => (
              <div key={c.userId} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--nc-text)" }}>{c.companyName}</p>
                    <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{c.userName} ({c.userEmail})</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(c.userId, "VERIFIED")}
                      disabled={isPending && processingId === c.userId}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      {isPending && processingId === c.userId ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(c.userId, "REJECTED")}
                      disabled={isPending && processingId === c.userId}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified */}
      {verified.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verified ({verified.length})
          </h4>
          <div className="space-y-2">
            {verified.map(c => (
              <div key={c.userId} className="rounded-lg border border-emerald-500/10 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--nc-text)" }}>{c.companyName}</p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{c.userName}</p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Verified</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejected.length})
          </h4>
          <div className="space-y-2">
            {rejected.map(c => (
              <div key={c.userId} className="rounded-lg border border-red-500/10 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--nc-text)" }}>{c.companyName}</p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{c.userName}</p>
                </div>
                <span className="text-xs text-red-400 font-semibold">Rejected</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
