// src/app/admin/settings/page.tsx — Admin platform settings with live editing
"use client";

import { useState, useEffect } from "react";
import {
  Settings, Globe, Zap, Shield, Bell, Save, Loader2,
  CheckCircle, AlertCircle, AlertTriangle,
} from "lucide-react";
import { BackupSection } from "../_components/backup-section";

type Settings = {
  site_name: string;
  site_url: string;
  support_email: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  require_email_verify: boolean;
  max_profiles_per_user: number;
  enable_og_images: boolean;
  enable_analytics: boolean;
  enable_r2_uploads: boolean;
  isr_revalidate_sec: number;
  notify_new_user: boolean;
  notify_email: string;
};

type Section = {
  section: string;
  icon: React.ElementType;
  fields: {
    key: keyof Settings;
    label: string;
    type: "text" | "url" | "email" | "number" | "toggle";
  }[];
};

const SECTIONS: Section[] = [
  {
    section: "Platform",
    icon: Globe,
    fields: [
      { key: "site_name", label: "Site Name", type: "text" },
      { key: "site_url", label: "Site URL", type: "url" },
      { key: "support_email", label: "Support Email", type: "email" },
      { key: "maintenance_mode", label: "Maintenance Mode", type: "toggle" },
    ],
  },
  {
    section: "Registration",
    icon: Shield,
    fields: [
      { key: "allow_registration", label: "Allow New Registrations", type: "toggle" },
      { key: "require_email_verify", label: "Require Email Verification", type: "toggle" },
      { key: "max_profiles_per_user", label: "Max Profiles Per User", type: "number" },
    ],
  },
  {
    section: "Features",
    icon: Zap,
    fields: [
      { key: "enable_og_images", label: "Auto-generate OG Images", type: "toggle" },
      { key: "enable_analytics", label: "Enable View Analytics", type: "toggle" },
      { key: "enable_r2_uploads", label: "Enable R2 File Uploads", type: "toggle" },
      { key: "isr_revalidate_sec", label: "ISR Revalidation (seconds)", type: "number" },
    ],
  },
  {
    section: "Notifications",
    icon: Bell,
    fields: [
      { key: "notify_new_user", label: "Email on New Registration", type: "toggle" },
      { key: "notify_email", label: "Admin Notification Email", type: "email" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); });
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setDirty(true);
    setSaveStatus("idle");
  }

  async function saveAll() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setSettings(updated);
      setDirty(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--nc-brand-2)" }} />
      </div>
    );
  }

  const inputStyle = {
    background: "var(--nc-bg-2)",
    border: "1px solid var(--nc-border)",
    color: "var(--nc-text)",
    borderRadius: "0.75rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    maxWidth: "22rem",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" style={{ color: "var(--nc-text-3)" }} />
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Platform Settings</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-3)" }}>
              Global configuration for the NEX CARD platform
            </p>
          </div>
        </div>

        <button
          onClick={saveAll}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--nc-brand-grad)" }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Save status */}
      {saveStatus === "success" && (
        <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
          <CheckCircle className="h-4 w-4" /> Settings saved successfully.
        </div>
      )}
      {saveStatus === "error" && (
        <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          <AlertCircle className="h-4 w-4" /> Failed to save settings. Please try again.
        </div>
      )}

      {settings.maintenance_mode && (
        <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>Maintenance mode is ON.</strong> Non-admin visitors are currently seeing the maintenance page.</span>
        </div>
      )}

      {/* Settings sections */}
      <div className="space-y-5">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.section} className="overflow-hidden rounded-2xl"
              style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
              <div className="flex items-center gap-2.5 px-6 py-4"
                style={{ borderBottom: "1px solid var(--nc-border)" }}>
                <Icon className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>{section.section}</h2>
              </div>

              <div>
                {section.fields.map((field, idx) => (
                  <div key={field.key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                    style={{ borderBottom: idx < section.fields.length - 1 ? "1px solid var(--nc-border)" : undefined }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--nc-text)" }}>{field.label}</p>
                      <p className="mt-0.5 font-mono text-[11px]" style={{ color: "var(--nc-text-3)" }}>{field.key}</p>
                    </div>

                    <div className="shrink-0">
                      {field.type === "toggle" ? (
                        <button
                          onClick={() => update(field.key, !settings[field.key] as never)}
                          className="relative h-6 w-11 rounded-full transition-colors"
                          style={{ background: settings[field.key] ? "var(--nc-brand-2)" : "var(--nc-bg-3)" }}>
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                            style={{ transform: settings[field.key] ? "translateX(20px)" : "translateX(0)" }} />
                        </button>
                      ) : (
                        <input
                          type={field.type}
                          value={settings[field.key] as string | number}
                          onChange={(e) => update(field.key, (field.type === "number" ? Number(e.target.value) : e.target.value) as never)}
                          style={inputStyle}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Backup section */}
      <div className="mt-8">
        <BackupSection />
      </div>
    </div>
  );
}
