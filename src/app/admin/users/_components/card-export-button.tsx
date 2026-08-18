"use client";

import { CreditCard, ChevronDown, Sun, Moon, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UserProfile {
  id: string;
  slug: string;
  template: { name: string };
  category: { name: string };
}

export function CardExportButton({
  userId,
  profileCount,
}: {
  userId: string;
  profileCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null); // "profileId:theme"
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (profileCount === 0) return null;

  async function fetchProfiles() {
    if (profiles.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/profiles`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    fetchProfiles();
  }

  async function handleExport(profileId: string, slug: string, theme: "dark" | "light") {
    const key = `${profileId}:${theme}`;
    setExporting(key);
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
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}
        title="Export NFC Card"
      >
        <CreditCard className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border shadow-xl"
          style={{
            background: "var(--nc-bg-card)",
            borderColor: "var(--nc-border)",
          }}
        >
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: "var(--nc-border)" }}
          >
            <p className="text-xs font-bold" style={{ color: "var(--nc-text)" }}>
              Export NFC Card
            </p>
            <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>
              Select a profile to export
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--nc-text-3)" }} />
                <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  Loading profiles…
                </span>
              </div>
            ) : profiles.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  No profiles found
                </p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="border-b px-4 py-3 last:border-b-0"
                  style={{ borderColor: "var(--nc-border)" }}
                >
                  <div className="mb-2">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: "var(--nc-text)" }}
                    >
                      {profile.slug}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--nc-text-3)" }}
                    >
                      {profile.category.name} · {profile.template.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(profile.id, profile.slug, "dark")}
                      disabled={exporting !== null}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all"
                      style={{
                        background: exporting === `${profile.id}:dark` ? "var(--nc-bg-hover)" : "#1a1a2e",
                        color: "#d4af37",
                        border: "1px solid #d4af3730",
                        opacity: exporting !== null && exporting !== `${profile.id}:dark` ? 0.5 : 1,
                      }}
                    >
                      {exporting === `${profile.id}:dark` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Moon className="h-3 w-3" />
                      )}
                      Dark
                    </button>
                    <button
                      onClick={() => handleExport(profile.id, profile.slug, "light")}
                      disabled={exporting !== null}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all"
                      style={{
                        background: exporting === `${profile.id}:light` ? "var(--nc-bg-hover)" : "#f0f4f8",
                        color: "#1e3c6e",
                        border: "1px solid #1e3c6e30",
                        opacity: exporting !== null && exporting !== `${profile.id}:light` ? 0.5 : 1,
                      }}
                    >
                      {exporting === `${profile.id}:light` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sun className="h-3 w-3" />
                      )}
                      Light
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
