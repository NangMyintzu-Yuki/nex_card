// src/app/admin/payments/_components/approve-reject-buttons.tsx
"use client";

import { useActionState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  approvePaymentAction,
  rejectPaymentAction,
  type AdminActionState,
} from "@/lib/actions/admin-actions";

interface ApproveRejectButtonsProps {
  paymentId: string;
}

export function ApproveRejectButtons({ paymentId }: ApproveRejectButtonsProps) {
  const [approveState, approveAction, approvePending] = useActionState<
    AdminActionState,
    FormData
  >(approvePaymentAction, { status: "idle" });

  const [rejectState, rejectAction, rejectPending] = useActionState<
    AdminActionState,
    FormData
  >(rejectPaymentAction, { status: "idle" });

  const isProcessed = approveState.status === "success" || rejectState.status === "success";

  if (isProcessed) {
    const isError = rejectState.status === "error";
    const msg = approveState.status === "success" ? approveState.message : isError ? rejectState.message : "";
    return (
      <div className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm" style={{
        background: approveState.status === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
        color: approveState.status === "success" ? "#22c55e" : "#ef4444",
      }}>
        {approveState.status === "success" ? (
          <>
            <CheckCircle className="h-4 w-4" />
            {approveState.message}
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            {msg}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex gap-2">
        <form action={approveAction}>
          <input type="hidden" name="paymentId" value={paymentId} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-400 disabled:opacity-50"
          >
            {approvePending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Approve
          </button>
        </form>

        <form action={rejectAction}>
          <input type="hidden" name="paymentId" value={paymentId} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-400 disabled:opacity-50"
          >
            {rejectPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject
          </button>
        </form>
      </div>

      {(approveState.status === "error" || rejectState.status === "error") && (
        <p className="text-xs text-red-400">
          {approveState.status === "error" ? approveState.message : rejectState.status === "error" ? rejectState.message : ""}
        </p>
      )}
    </div>
  );
}
