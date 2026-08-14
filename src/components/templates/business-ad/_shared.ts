// src/components/templates/business-ad/_shared.ts
// Tiny non-visual helpers shared by business-ad templates (no shared chrome)

import type { BusinessAdData } from "@/lib/validators/template-schemas";
import { safeHref } from "@/lib/security/safe-href";

export type BusinessAdProps = {
  data: BusinessAdData;
  accentColor?: string;
};

export function contactHref(type: string, value: string): string {
  if (!value) return "#";
  const val = value.trim();
  switch (type.toLowerCase()) {
    case "email":
      return `mailto:${val}`;
    case "phone":
      return `tel:${val.replace(/\s+/g, "")}`;
    case "whatsapp":
      return `https://wa.me/${val.replace(/[^0-9]/g, "")}`;
    case "viber":
      return `viber://chat?number=${val.replace(/[^0-9+]/g, "")}`;
    case "telegram":
      return `https://t.me/${val.replace("@", "")}`;
    case "website":
      return safeHref(val.startsWith("http") ? val : `https://${val}`);
    default:
      return safeHref(val);
  }
}

export function formatAddress(
  address: BusinessAdData["address"]
): string | null {
  if (!address) return null;
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode || address.zip,
    address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function stars(rating: number): string {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(r) + "☆".repeat(5 - r);
}

export function dayLabel(day: string): string {
  return day.slice(0, 3);
}
