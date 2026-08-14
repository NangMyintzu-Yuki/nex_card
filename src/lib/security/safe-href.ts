// src/lib/security/safe-href.ts
// Allowlist hrefs used in public templates (https, mailto, tel, wa.me)

const ALLOWED_PROTOCOLS = new Set(["https:", "mailto:", "tel:", "viber:"]);

export function safeHref(raw: string | null | undefined): string {
  if (!raw) return "#";
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) return "#";
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return "#";

  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:") || trimmed.startsWith("viber:")) {
    return trimmed;
  }

  try {
    const withProto = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProto);

    if (u.protocol === "http:") {
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return u.href;
      return "#";
    }

    if (!ALLOWED_PROTOCOLS.has(u.protocol)) return "#";
    return u.href;
  } catch {
    return "#";
  }
}
