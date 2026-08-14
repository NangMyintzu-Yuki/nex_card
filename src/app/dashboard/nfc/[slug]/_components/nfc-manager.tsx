// src/app/dashboard/nfc/[slug]/_components/nfc-manager.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Smartphone, Radio, CheckCircle2, ExternalLink, ArrowLeft } from "lucide-react";
import {
  markNfcProgrammedAction,
  type MarkNfcState,
} from "@/lib/actions/nfc-action";
import { NfcWebWriteButton } from "./nfc-web-write";

interface NfcManagerProps {
  profile: {
    id: string;
    slug: string;
    isPublished: boolean;
    nfcWriteCount: number;
    nfcProgrammedAt: string | null;
    paymentTier: string | null;
    paymentStatus: string | null;
    nfcFulfillment?: string | null;
  };
  nfcUrl: string;
}

const initialState: MarkNfcState = { status: "idle" };

export function NfcManager({ profile, nfcUrl }: NfcManagerProps) {
  const [state, formAction, pending] = useActionState(markNfcProgrammedAction, initialState);

  const hasNfcTier =
    profile.paymentTier === "NFC_CARD" || profile.paymentTier === "PHYSICAL_CARD";
  const isApproved = profile.paymentStatus === "APPROVED";
  const programmedAt =
    state.status === "success"
      ? state.nfcProgrammedAt
      : profile.nfcProgrammedAt;
  const writeCount =
    state.status === "success" ? state.nfcWriteCount : profile.nfcWriteCount;

  return (
    <div className="mx-auto max-w-2xl nc-page" style={{ color: "var(--nc-text)" }}>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ color: "var(--nc-text-2)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <Radio className="h-6 w-6 text-green-500" />
        </div>
        <h1 className="text-2xl font-black">NFC Tag Programming</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
          Program a physical NFC tag for <strong>/{profile.slug}</strong>
        </p>
      </div>

      {!hasNfcTier && (
        <div className="mb-6 rounded-2xl px-5 py-4 text-sm"
          style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)", color: "var(--nc-text-2)" }}>
          Your current plan is QR-only. Upgrade to <strong>NFC Only</strong> or <strong>NFC + QR</strong> during onboarding or by contacting support.
        </div>
      )}

      {hasNfcTier && !isApproved && (
        <div className="mb-6 rounded-2xl px-5 py-4 text-sm"
          style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)", color: "var(--nc-text-2)" }}>
          Payment approval is required before programming NFC tags.
        </div>
      )}

      {hasNfcTier && isApproved && (
        <>
          <div className="mb-6 rounded-2xl p-4 sm:p-6"
            style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              Programming Steps
            </h2>
            <ol className="space-y-4 text-sm" style={{ color: "var(--nc-text-2)" }}>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--nc-accent, #f59e0b)" }}>1</span>
                <span>Get a blank NTAG213/215/216 NFC sticker or card (available online).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--nc-accent, #f59e0b)" }}>2</span>
                <span>
                  Use a free NFC writer app (e.g. <em>NFC Tools</em> on Android/iOS) or Web NFC below to write this URL as a <strong>URL record</strong>:
                  <code className="mt-2 block rounded-lg px-3 py-2 font-mono text-xs break-all"
                    style={{ background: "var(--nc-bg-hover)", color: "var(--nc-text)" }}>
                    {nfcUrl}
                  </code>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--nc-accent, #f59e0b)" }}>3</span>
                <span>Tap the tag on a phone to verify it opens <code>/n/{profile.slug}</code>, then click &quot;Mark as Programmed&quot; below.</span>
              </li>
            </ol>
          </div>

          {profile.nfcFulfillment && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              Fulfillment: {profile.nfcFulfillment.replace(/_/g, " ")}
            </p>
          )}

          <NfcWebWriteButton url={nfcUrl} />

          <div className="mb-6 flex flex-wrap gap-3">
            <a
              href={nfcUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--nc-bg-hover)", border: "1px solid var(--nc-border)", color: "var(--nc-text)" }}
            >
              <ExternalLink className="h-4 w-4" />
              Preview NFC URL
            </a>
            <Link
              href={`/dashboard/qr/${profile.slug}`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--nc-bg-hover)", border: "1px solid var(--nc-border)", color: "var(--nc-text)" }}
            >
              <Smartphone className="h-4 w-4" />
              QR Manager
            </Link>
          </div>

          {programmedAt && (
            <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: "#22c55e" }}>
              <CheckCircle2 className="h-4 w-4" />
              Last programmed: {new Date(programmedAt).toLocaleString()} · {writeCount} total
            </div>
          )}

          <form action={formAction}>
            <input type="hidden" name="profileId" value={profile.id} />
            <button
              type="submit"
              disabled={pending || !profile.isPublished}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              {pending ? "Saving…" : "Mark NFC Tag as Programmed"}
            </button>
          </form>

          {state.status === "error" && (
            <p className="mt-3 text-sm text-red-400">{state.message}</p>
          )}
          {state.status === "success" && (
            <p className="mt-3 text-sm text-green-400">
              NFC programming recorded successfully.
            </p>
          )}
        </>
      )}
    </div>
  );
}
