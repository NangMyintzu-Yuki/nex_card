// src/app/admin/users/_components/user-status-toggle.tsx
"use client";

import { useActionState, useOptimistic } from "react";
import { toggleUserStatusAction, type ToggleUserStatusState } from "@/lib/actions/admin-actions";

interface UserStatusToggleProps {
  userId:  string;
  status:  "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  isSelf:  boolean;  // Prevent admin from suspending themselves
}

export function UserStatusToggle({ userId, status, isSelf }: UserStatusToggleProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

  const [state, dispatch, pending] = useActionState<ToggleUserStatusState, FormData>(
    toggleUserStatusAction,
    { status: "idle" }
  );

  const isActive = optimisticStatus === "ACTIVE";
  const canToggle = !isSelf && optimisticStatus !== "PENDING_VERIFICATION";

  function handleToggle() {
    if (!canToggle || pending) return;
    const newStatus = isActive ? "SUSPENDED" : "ACTIVE";
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("status", newStatus);
    setOptimisticStatus(newStatus);
    dispatch(fd);
  }

  if (optimisticStatus === "PENDING_VERIFICATION") {
    return (
      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
        Pending
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleToggle}
        disabled={!canToggle || pending}
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400"
            : "bg-red-500/10 text-red-400 hover:bg-emerald-500/10 hover:text-emerald-400"
        }`}
        title={isSelf ? "Cannot modify your own account" : isActive ? "Click to suspend" : "Click to activate"}
      >
        {pending ? "…" : isActive ? "Active" : "Suspended"}
      </button>
      {state.status === "error" && (
        <p className="text-xs text-red-400">{state.message}</p>
      )}
    </div>
  );
}