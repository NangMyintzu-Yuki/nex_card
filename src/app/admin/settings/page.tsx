// src/app/admin/settings/page.tsx
// Admin platform settings — maintenance mode, feature flags, config

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Settings, Globe, Zap, Shield, Bell } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings — Admin · PresenceCard" };
export const dynamic = "force-dynamic";

// In a real app these would be stored in a DB settings table
const PLATFORM_SETTINGS = [
  {
    section: "Platform",
    icon: Globe,
    items: [
      { key: "site_name",        label: "Site Name",        value: "PresenceCard",          type: "text" },
      { key: "site_url",         label: "Site URL",          value: "https://presencecard.io", type: "url" },
      { key: "support_email",    label: "Support Email",     value: "support@presencecard.io", type: "email" },
      { key: "maintenance_mode", label: "Maintenance Mode",  value: "false",                 type: "toggle" },
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
      { key: "notify_email",        label: "Admin Notification Email",  value: "admin@presencecard.io", type: "email" },
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
        <Settings className="h-6 w-6 text-neutral-500" />
        <div>
          <h1 className="text-2xl font-black text-white">Platform Settings</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Global configuration for the PresenceCard platform
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {PLATFORM_SETTINGS.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.section}
              className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              {/* Section header */}
              <div className="flex items-center gap-2.5 border-b border-white/5 px-6 py-4">
                <Icon className="h-4 w-4 text-neutral-500" />
                <h2 className="font-bold text-white text-sm">{section.section}</h2>
              </div>

              {/* Settings rows */}
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="mt-0.5 font-mono text-xs text-neutral-600">{item.key}</p>
                    </div>

                    <div className="shrink-0">
                      {item.type === "toggle" ? (
                        <div
                          className={`flex h-6 w-11 cursor-pointer items-center rounded-full px-0.5 transition-colors ${
                            item.value === "true"
                              ? "bg-indigo-500"
                              : "bg-neutral-700"
                          }`}
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
                          className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
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

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-400/80">
        <p className="font-semibold text-amber-300 mb-1">Note on Settings Persistence</p>
        These settings are currently static UI. To make them editable and persistent, create a{" "}
        <code className="rounded bg-amber-500/20 px-1 font-mono text-xs">platform_settings</code>{" "}
        table in your DB and wire each toggle/input to a Server Action that calls{" "}
        <code className="rounded bg-amber-500/20 px-1 font-mono text-xs">revalidateTag("admin-settings")</code>{" "}
        after saving.
      </div>
    </div>
  );
}
