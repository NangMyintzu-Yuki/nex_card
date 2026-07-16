// src/app/admin/settings/page.tsx
// Admin platform settings — maintenance mode, feature flags, config

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Settings, Globe, Zap, Shield, Bell } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings — Admin · NEX CARD" };
export const dynamic = "force-dynamic";

const PLATFORM_SETTINGS = [
  {
    section: "Platform",
    icon: Globe,
    items: [
      { key: "site_name",        label: "Site Name",        value: "NEX CARD",                   type: "text" },
      { key: "site_url",         label: "Site URL",          value: "https://nexcard.io",          type: "url" },
      { key: "support_email",    label: "Support Email",     value: "support@nexcard.io",          type: "email" },
      { key: "maintenance_mode", label: "Maintenance Mode",  value: "false",                       type: "toggle" },
    ],
  },
  {
    section: "Registration",
    icon: Shield,
    items: [
      { key: "allow_registration",     label: "Allow New Registrations", value: "true",  type: "toggle" },
      { key: "require_email_verify",   label: "Require Email Verification", value: "false", type: "toggle" },
      { key: "max_profiles_per_user",  label: "Max Profiles Per User",   value: "4",     type: "number" },
    ],
  },
  {
    section: "Features",
    icon: Zap,
    items: [
      { key: "enable_og_images",  label: "Auto-generate OG Images",   value: "true",  type: "toggle" },
      { key: "enable_analytics",  label: "Enable View Analytics",      value: "true",  type: "toggle" },
      { key: "enable_r2_uploads", label: "Enable R2 File Uploads",     value: "true",  type: "toggle" },
      { key: "isr_revalidate_sec",label: "ISR Revalidation (seconds)", value: "3600",  type: "number" },
    ],
  },
  {
    section: "Notifications",
    icon: Bell,
    items: [
      { key: "notify_new_user",     label: "Email on New Registration", value: "true",  type: "toggle" },
      { key: "notify_email",        label: "Admin Notification Email",  value: "admin@nexcard.io", type: "email" },
    ],
  },
];

export default async function AdminSettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Settings className="h-6 w-6" style={{ color: "var(--nc-text-3)" }} />
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Platform Settings</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-3)" }}>
            Global configuration for the NEX CARD platform
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {PLATFORM_SETTINGS.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.section}
              className="nc-card overflow-hidden rounded-2xl"
            >
              {/* Section header */}
              <div className="flex items-center gap-2.5 px-6 py-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
                <Icon className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
                <h2 className="font-bold text-sm" style={{ color: "var(--nc-text)" }}>{section.section}</h2>
              </div>

              {/* Settings rows */}
              <div>
                {section.items.map((item, idx) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                    style={{ borderBottom: idx < section.items.length - 1 ? "1px solid var(--nc-border)" : undefined }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--nc-text)" }}>{item.label}</p>
                      <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--nc-text-3)" }}>{item.key}</p>
                    </div>

                    <div className="shrink-0">
                      {item.type === "toggle" ? (
                        <div
                          className={`flex h-6 w-11 cursor-pointer items-center rounded-full px-0.5 transition-colors ${
                            item.value === "true"
                              ? ""
                              : ""
                          }`}
                          style={{
                            background: item.value === "true" ? "var(--nc-brand-2)" : "var(--nc-bg-3)",
                          }}
                          title="Click to toggle (wire to Server Action)"
                        >
                          <div
                            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              item.value === "true" ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      ) : (
                        <input
                          type={item.type}
                          defaultValue={item.value}
                          className="nc-input w-56 rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                          readOnly
                          title="Wire to a Server Action to enable editing"
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

      <div className="mt-6 rounded-2xl px-5 py-4 text-sm"
        style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)", color: "var(--nc-warning)" }}>
        <p className="font-semibold mb-1" style={{ color: "var(--nc-warning)" }}>Note on Settings Persistence</p>
        These settings are currently static UI. To make them editable and persistent, create a{" "}
        <code className="rounded px-1 font-mono text-xs" style={{ background: "rgba(245,158,11,0.15)" }}>platform_settings</code>{" "}
        table in your DB and wire each toggle/input to a Server Action that calls{" "}
        <code className="rounded px-1 font-mono text-xs" style={{ background: "rgba(245,158,11,0.15)" }}>revalidateTag(&quot;admin-settings&quot;)</code>{" "}
        after saving.
      </div>
    </div>
  );
}
