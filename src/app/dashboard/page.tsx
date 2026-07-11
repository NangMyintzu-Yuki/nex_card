// src/app/dashboard/page.tsx
// User Workspace Panel — Profile listing, data editor, publish controls

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Plus, ExternalLink, Eye, Pencil, Lock,
  Sparkles, BarChart3, Globe, Settings, QrCode,
} from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getCachedUserProfiles } from "@/lib/cache/profile-cache";

export const metadata: Metadata = {
  title: "Dashboard — PresenceCard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const { new: newSlug } = await searchParams;
  const profiles = await getCachedUserProfiles(session.user.id);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r border-white/5 bg-neutral-900 lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold">PresenceCard</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: Globe, label: "Profiles", href: "/dashboard", active: true },
            { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", active: false },
            { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  item.active
                    ? "bg-indigo-500/10 font-semibold text-indigo-300"
                    : "text-neutral-500 hover:bg-white/5 hover:text-white"
                }`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
              <p className="truncate text-xs text-neutral-600">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-60">
        <div className="mx-auto max-w-5xl px-6 py-10">

          {/* New profile success banner */}
          {newSlug && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
              <div>
                <p className="font-semibold text-emerald-300">Profile created successfully!</p>
                <p className="mt-0.5 text-sm text-emerald-400/70">
                  Your page is live at{" "}
                  <span className="font-mono text-emerald-300">
                    presencecard.io/{newSlug}
                  </span>
                  . Now fill in your details.
                </p>
              </div>
              <Link href={`/${newSlug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition-all">
                <ExternalLink className="h-3.5 w-3.5" />
                View Live
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black">My Profiles</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {profiles.length} of 4 categories claimed
              </p>
            </div>
            {profiles.length < 4 && (
              <Link href="/dashboard/onboarding"
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25">
                <Plus className="h-4 w-4" />
                New Profile
              </Link>
            )}
          </div>

          {/* Profiles grid */}
          {profiles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {profiles.map((profile) => (
                <div key={profile.id}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:border-white/10 hover:bg-white/[0.05]">
                  {/* Template preview strip */}
                  <div className="relative h-32 w-full overflow-hidden bg-neutral-900">
                    <img
                      src={profile.template.thumbnailUrl}
                      alt={profile.template.name}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        profile.isPublished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {profile.isPublished ? "● Live" : "⚠ Draft — not visible"}
                      </span>
                    </div>
                    {profile.templateLocked && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-xs text-white/50 backdrop-blur">
                        <Lock className="h-2.5 w-2.5" />
                        Locked
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">{profile.category.name}</p>
                        <p className="font-bold text-white">{profile.template.name}</p>
                        <p className="mt-0.5 font-mono text-xs text-neutral-600">
                          /{profile.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <Eye className="h-3.5 w-3.5" />
                        {profile.viewCount.toString()}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={`/dashboard/edit/${profile.slug}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link href={`/dashboard/qr/${profile.slug}`}
                        className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:border-white/20 hover:text-white ${
                          profile.templateLocked
                            ? "border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : "border border-white/10 bg-white/5 text-neutral-400"
                        }`}
                        title={profile.templateLocked ? "QR locked — view QR" : "Generate QR code"}>
                        <QrCode className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-400 transition-all hover:border-white/20 hover:text-white">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <p className="mt-3 text-xs text-neutral-700">
                      Updated {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <div className="mb-4 text-5xl">✨</div>
              <h2 className="text-xl font-black">Create your first profile</h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-500">
                Choose a category, pick a template, and claim your unique URL. Takes under 2 minutes.
              </p>
              <Link href="/dashboard/onboarding"
                className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-400">
                <Plus className="h-4 w-4" />
                Create First Profile
              </Link>
            </div>
          )}

          {/* Remaining categories */}
          {profiles.length > 0 && profiles.length < 4 && (
            <div className="mt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-600">
                More Profile Types
              </p>
              <Link href="/dashboard/onboarding"
                className="flex items-center justify-between rounded-xl border border-dashed border-white/10 px-5 py-4 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-white/10">
                    <Plus className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Add Another Profile Type</p>
                    <p className="text-xs text-neutral-600">
                      {4 - profiles.length} categor{4 - profiles.length === 1 ? "y" : "ies"} remaining
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-neutral-600" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}