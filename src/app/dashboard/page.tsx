// src/app/dashboard/page.tsx
// User Workspace Panel — Profile listing

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus, ExternalLink, Eye, Pencil, Lock, QrCode, Clock, XCircle, CheckCircle, Upload } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getCachedUserProfiles } from "@/lib/cache/profile-cache";
import { resolveThumbnailUrl } from "@/lib/thumbnails";
import { DeleteProfileButton } from "./_components/delete-profile-button";

export const metadata: Metadata = {
  title: "Dashboard — NEX CARD",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; pending?: string; paymentFailed?: string; reserved?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const { new: newSlug, pending, paymentFailed, reserved } = await searchParams;
  const profiles = await getCachedUserProfiles(session.user.id);
  const { getSettings } = await import("@/lib/settings");
  const settings = await getSettings();
  const maxProfiles = settings.max_profiles_per_user;
  const canAddProfile = profiles.length < maxProfiles;
  const preorderMode = settings.preorder_mode;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* New profile success banner */}
      {newSlug && (
        <div className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.05)" }}>
          <div>
            <p className="font-semibold" style={{ color: "var(--nc-success)" }}>Profile created successfully!</p>
            <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
              Your page is live at{" "}
              <span className="font-mono" style={{ color: "var(--nc-success)" }}>
                www.nexcard.wetechmm.com/{newSlug}
              </span>
              . Now fill in your details.
            </p>
          </div>
          <Link href={`/${newSlug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
            style={{ border: "1px solid rgba(34,197,94,0.3)", color: "var(--nc-success)" }}>
            <ExternalLink className="h-3.5 w-3.5" />
            View Live
          </Link>
        </div>
      )}

      {/* Pending approval banner */}
      {pending && (
        <div className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.05)" }}>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">Payment Submitted!</p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
                Your payment is pending admin approval. You&apos;ll be able to edit your profile once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment failed banner */}
      {paymentFailed && (
        <div className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)" }}>
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Payment Submission Failed</p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
                Your profile was created, but the payment couldn&apos;t be submitted. Please resubmit your payment screenshot below.
              </p>
            </div>
          </div>
        </div>
      )}

      {reserved && (
        <div className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.08)" }}>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0" style={{ color: "var(--nc-brand-1)" }} />
            <div>
              <p className="font-semibold" style={{ color: "var(--nc-brand-1)" }}>Card reserved</p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
                We&apos;ll email you when package prices are live. Then you can pay from this dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>My Profiles</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
            {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canAddProfile && (
          <Link href="/dashboard/onboarding"
            className="nc-btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold">
            <Plus className="h-4 w-4" />
            New Profile
          </Link>
        )}
      </div>

      {/* Profiles grid */}
      {profiles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {profiles.map((profile) => {
            const isPremiumTemplate = profile.template.isPremium;
            const paymentApproved = profile.paymentStatus === "APPROVED";
            const paymentPending = profile.paymentStatus === "PENDING";
            const paymentRejected = profile.paymentStatus === "REJECTED";
            const canEdit = !isPremiumTemplate || paymentApproved;

            return (
            <div key={profile.id}
              className="nc-card nc-profile-card group overflow-hidden rounded-2xl transition-all">
              {/* Template preview strip */}
              <div className="relative h-32 w-full overflow-hidden" style={{ background: "var(--nc-bg-2)" }}>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img
                   src={resolveThumbnailUrl(profile.template.thumbnailUrl, profile.template.name)}
                   alt={profile.template.name}
                   className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                 />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--nc-bg), transparent)" }} />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm ${
                    profile.isPublished
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-amber-500/30 text-amber-300"
                  }`}>
                    {profile.isPublished ? "● Live" : "⚠ Draft — not visible"}
                  </span>
                </div>
                {profile.templateLocked && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs backdrop-blur"
                    style={{ border: "1px solid var(--nc-border)", background: "rgba(0,0,0,0.4)", color: "var(--nc-text-3)" }}>
                    <Lock className="h-2.5 w-2.5" />
                    Locked
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{profile.category.name}</p>
                    <p className="font-bold" style={{ color: "var(--nc-text)" }}>{profile.template.name}</p>
                    <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--nc-text-3)" }}>
                      /{profile.slug}
                    </p>
                    <div className="mt-2">
                      <DeleteProfileButton profileId={profile.id} slug={profile.slug} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    <Eye className="h-3.5 w-3.5" />
                    {profile.viewCount.toString()}
                  </div>
                </div>

                {/* Payment status badge */}
                {isPremiumTemplate && (
                  <div className="mt-3">
                    {paymentPending && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span className="font-semibold text-amber-300">Pending Approval</span>
                      </div>
                    )}
                    {paymentRejected && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                        <span className="font-semibold text-red-300">Payment Rejected</span>
                      </div>
                    )}
                    {paymentApproved && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-semibold text-emerald-300">Approved</span>
                      </div>
                    )}
                    {!profile.paymentStatus && (
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
                        <Upload className="h-3.5 w-3.5" style={{ color: "var(--nc-brand-1)" }} />
                        <span className="font-semibold" style={{ color: "var(--nc-brand-1)" }}>
                          {preorderMode ? "Reserved — prices announced soon" : "Payment Required"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Resubmit / submit payment */}
                {isPremiumTemplate && (profile.paymentStatus === "REJECTED" || (!profile.paymentStatus && !preorderMode)) && (
                  <div className="mt-3">
                    <Link
                      href={`/dashboard/payment/${profile.id}`}
                      className="flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-semibold transition-all"
                      style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {profile.paymentStatus === "REJECTED" ? "Resubmit Payment" : "Submit Payment"}
                    </Link>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {canEdit ? (
                    <Link href={`/dashboard/edit/${profile.slug}`}
                      className="nc-btn-ghost flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  ) : (
                    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold cursor-not-allowed opacity-50"
                      style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" }}>
                      <Pencil className="h-3.5 w-3.5" />
                      {paymentPending ? "Awaiting Approval" : paymentRejected ? "Reupload Required" : "Edit"}
                    </div>
                  )}
                  {canEdit ? (
                    <Link href={`/dashboard/qr/${profile.slug}`}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                        profile.templateLocked
                          ? "bg-amber-500/10 text-amber-400"
                          : ""
                      }`}
                      style={!profile.templateLocked ? { background: "var(--nc-bg-hover)", color: "var(--nc-text-2)" } : undefined}
                      title={profile.templateLocked ? "QR locked — view QR" : "Generate QR code"}>
                      <QrCode className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold cursor-not-allowed opacity-50"
                      style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" }}>
                      <QrCode className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <Link href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                    className="nc-btn-ghost flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <p className="mt-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
                  Updated {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="nc-card flex flex-col items-center justify-center rounded-2xl py-20 text-center">
          <h2 className="text-xl font-black" style={{ color: "var(--nc-text)" }}>Create your first profile</h2>
          <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--nc-text-3)" }}>
            Choose a category, pick a template, and claim your unique URL. Takes under 2 minutes.
          </p>
          <Link href="/dashboard/onboarding"
            className="nc-btn-brand mt-6 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold">
            <Plus className="h-4 w-4" />
            Create First Profile
          </Link>
        </div>
      )}

      {/* Remaining categories */}
      {profiles.length > 0 && canAddProfile && (
        <div className="mt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>
            More Profile Types
          </p>
          <Link href="/dashboard/onboarding"
            className="flex items-center justify-between rounded-xl px-5 py-4 transition-all"
            style={{ border: "1px dashed var(--nc-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ border: "1px dashed var(--nc-border)" }}>
                <Plus className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>Add Another Profile Type</p>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  {maxProfiles - profiles.length} slot{maxProfiles - profiles.length === 1 ? "" : "s"} remaining
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
          </Link>
        </div>
      )}
    </div>
  );
}
