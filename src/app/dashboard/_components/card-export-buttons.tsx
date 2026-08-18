"use client";

import { CreditCard, Sun, Moon, Loader2 } from "lucide-react";
import { useState } from "react";

export function DashboardCardExport({
  profileId,
  slug,
}: {
  profileId: string;
  slug: string;
}) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(theme: "dark" | "light") {
    setExporting(theme);
    try {
      const res = await fetch(`/api/admin/export-card/${profileId}?theme=${theme}`);
      if (!res.ok) {
        const body = await res.text().catch(() => "unknown");
        console.error(`Card export failed: HTTP ${res.status} — ${body}`);
        throw new Error(`Export failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nex-card-${slug}-${theme}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Card export failed:", err);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleExport("dark")}
        disabled={exporting !== null}
        className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all"
        style={{
          background: exporting === "dark" ? "var(--nc-bg-hover)" : "rgba(212,175,55,0.1)",
          color: "#d4af37",
          border: "1px solid rgba(212,175,55,0.2)",
          opacity: exporting !== null && exporting !== "dark" ? 0.5 : 1,
        }}
        title="Export dark theme card"
      >
        {exporting === "dark" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
      </button>
      <button
        onClick={() => handleExport("light")}
        disabled={exporting !== null}
        className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all"
        style={{
          background: exporting === "light" ? "var(--nc-bg-hover)" : "rgba(30,60,110,0.1)",
          color: "#4a9fd4",
          border: "1px solid rgba(30,60,110,0.2)",
          opacity: exporting !== null && exporting !== "light" ? 0.5 : 1,
        }}
        title="Export light theme card"
      >
        {exporting === "light" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
