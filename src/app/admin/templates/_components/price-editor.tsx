// src/app/admin/templates/_components/price-editor.tsx
"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateTemplatePricesAction, type AdminActionState } from "@/lib/actions/admin-actions";

interface PriceEditorProps {
  templateId: string;
  templateName: string;
  priceQrOnly: number | null;
  priceNfcCard: number | null;
  priceNfcQr: number | null;
}

export function PriceEditor({
  templateId,
  templateName,
  priceQrOnly,
  priceNfcCard,
  priceNfcQr,
}: PriceEditorProps) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(
    updateTemplatePricesAction,
    { status: "idle" }
  );

  return (
    <div className="mt-3 rounded-lg p-3" style={{ background: "var(--nc-bg-2)", border: "1px solid var(--nc-border)" }}>
      <p className="mb-2 text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Pricing (MMK)</p>
      <form action={action} className="space-y-2">
        <input type="hidden" name="templateId" value={templateId} />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-0.5 block text-[10px]" style={{ color: "var(--nc-text-3)" }}>QR Only</label>
            <input
              type="number"
              name="priceQrOnly"
              defaultValue={priceQrOnly ?? ""}
              placeholder="—"
              className="nc-input w-full rounded-lg px-2 py-1.5 text-xs"
              min={0}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px]" style={{ color: "var(--nc-text-3)" }}>NFC Card</label>
            <input
              type="number"
              name="priceNfcCard"
              defaultValue={priceNfcCard ?? ""}
              placeholder="—"
              className="nc-input w-full rounded-lg px-2 py-1.5 text-xs"
              min={0}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px]" style={{ color: "var(--nc-text-3)" }}>Physical+QR</label>
            <input
              type="number"
              name="priceNfcQr"
              defaultValue={priceNfcQr ?? ""}
              placeholder="—"
              className="nc-input w-full rounded-lg px-2 py-1.5 text-xs"
              min={0}
            />
          </div>
        </div>

        {state.status === "success" && (
          <p className="text-xs text-emerald-400">{state.message}</p>
        )}
        {state.status === "error" && (
          <p className="text-xs text-red-400">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors"
          style={{ background: "var(--nc-brand-1)", color: "white" }}
        >
          {pending ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          Save Prices
        </button>
      </form>
    </div>
  );
}
