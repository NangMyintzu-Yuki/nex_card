// src/app/admin/templates/_components/template-actions.tsx

import { toggleTemplateField, saveTemplatePrices } from "@/lib/actions/template-admin-actions";
import { SubmitButton } from "./submit-button";

export function ActiveToggle({
  templateId,
  isActive,
}: {
  templateId: string;
  isActive: boolean;
}) {
  const action = toggleTemplateField.bind(null, templateId, "isActive", !isActive);

  return (
    <form action={action}>
      <SubmitButton
        className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
        style={
          isActive
            ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" }
            : { background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" }
        }
      >
        {isActive ? "On" : "Off"}
      </SubmitButton>
    </form>
  );
}

export function PremiumBadge() {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: "rgba(212,175,55,0.15)", color: "#d4af37" }}
    >
      PRO
    </span>
  );
}

export function PriceForm({
  templateId,
  priceQrOnly,
  priceNfcQr,
}: {
  templateId: string;
  priceQrOnly: number | null;
  priceNfcQr: number | null;
}) {
  return (
    <form action={saveTemplatePrices} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="templateId" value={templateId} />
      <PriceField name="priceQrOnly" label="QR" defaultValue={priceQrOnly} />
      <PriceField name="priceNfcQr" label="NFC+QR" defaultValue={priceNfcQr} />
      <SubmitButton
        className="nc-btn-brand mb-px rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
      >
        Save
      </SubmitButton>
    </form>
  );
}

function PriceField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: number | null;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span
        className="text-[10px] font-medium uppercase tracking-wide"
        style={{ color: "var(--nc-text-3)" }}
      >
        {label}
      </span>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder="—"
        min={0}
        step={1000}
        className="nc-input w-[5.75rem] rounded-lg px-2 py-1.5 text-xs tabular-nums outline-none"
        style={{
          background: "var(--nc-bg-2)",
          border: "1px solid var(--nc-border)",
          color: "var(--nc-text)",
        }}
      />
    </label>
  );
}
