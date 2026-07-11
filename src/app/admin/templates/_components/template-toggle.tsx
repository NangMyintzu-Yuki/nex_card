// src/app/admin/templates/_components/template-toggle.tsx
"use client";

import { useActionState, useOptimistic } from "react";
import { toggleTemplateAction, type ToggleTemplateState } from "@/lib/actions/admin-actions";

interface TemplateToggleProps {
  templateId: string;
  isActive:   boolean;
  isPremium:  boolean;
}

export function TemplateToggle({ templateId, isActive, isPremium }: TemplateToggleProps) {
  // Optimistic local state for each field
  const [optimisticActive,  setOptimisticActive]  = useOptimistic(isActive);
  const [optimisticPremium, setOptimisticPremium] = useOptimistic(isPremium);

  const [, dispatch, pending] = useActionState<ToggleTemplateState, FormData>(
    toggleTemplateAction,
    { status: "idle" }
  );

  function toggle(field: "isActive" | "isPremium", current: boolean) {
    if (pending) return;
    const fd = new FormData();
    fd.set("templateId", templateId);
    fd.set("field", field);
    fd.set("value", String(!current));

    if (field === "isActive") setOptimisticActive(!current);
    else setOptimisticPremium(!current);

    dispatch(fd);
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => toggle("isActive", optimisticActive)}
        disabled={pending}
        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
          optimisticActive
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-white/5 text-neutral-600 hover:text-neutral-300"
        }`}
      >
        {optimisticActive ? "Active" : "Inactive"}
      </button>
      <button
        onClick={() => toggle("isPremium", optimisticPremium)}
        disabled={pending}
        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
          optimisticPremium
            ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            : "bg-white/5 text-neutral-600 hover:text-neutral-300"
        }`}
      >
        {optimisticPremium ? "PRO" : "Free"}
      </button>
    </div>
  );
}