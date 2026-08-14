// src/app/dashboard/payment/[profileId]/page.tsx

import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { PaymentForm } from "./payment-form";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Submit Payment — NEX CARD",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const { profileId } = await params;

  const profile = await prisma.userProfile.findFirst({
    where: { id: profileId, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      paymentStatus: true,
      template: {
        select: {
          name: true,
          isPremium: true,
          priceQrOnly: true,
          priceNfcCard: true,
          priceNfcQr: true,
        },
      },
    },
  });

  if (!profile) notFound();
  if (!profile.template.isPremium) redirect(`/dashboard`);

  const existingPayment = await prisma.payment.findFirst({
    where: { userProfileId: profileId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { tier: true, status: true },
  });

  const { preorder_mode: preorderMode } = await getSettings();
  const pricesNotLive = preorderMode && existingPayment?.status !== "REJECTED";

  return (
    <div className="min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
      <div className="mx-auto max-w-3xl nc-page">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--nc-text-3)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-black sm:text-3xl">
            {existingPayment?.status === "REJECTED" ? "Resubmit Payment" : "Submit Payment"}
          </h1>
          <p className="mt-1" style={{ color: "var(--nc-text-2)" }}>
            {profile.template.name} — upload your payment proof to activate your template
          </p>
        </div>

        {pricesNotLive ? (
          <div className="flex items-center gap-3 rounded-xl border px-5 py-4"
            style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.08)" }}>
            <Lock className="h-5 w-5 shrink-0" style={{ color: "var(--nc-brand-1)" }} />
            <div>
              <p className="font-semibold" style={{ color: "var(--nc-brand-1)" }}>Prices not published yet</p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
                Your card is reserved. We&apos;ll email you when package prices are live so you can pay from the dashboard.
              </p>
            </div>
          </div>
        ) : (
          <>
        {existingPayment?.status === "PENDING" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border px-5 py-4"
            style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.08)" }}>
            <Lock className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">Payment Pending</p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
                You already have a pending payment. Awaiting admin approval.
              </p>
            </div>
          </div>
        )}

        {existingPayment?.status === "APPROVED" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border px-5 py-4"
            style={{ borderColor: "rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.08)" }}>
            <Lock className="h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-300">Payment Approved</p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
                Your payment has been approved. You can now edit your profile.
              </p>
            </div>
          </div>
        )}

        {(existingPayment?.status !== "PENDING" && existingPayment?.status !== "APPROVED") && (
          <div className="rounded-2xl nc-card overflow-hidden">
            <PaymentForm
              profileId={profile.id}
              templateName={profile.template.name}
              prices={{
                priceQrOnly: profile.template.priceQrOnly,
                priceNfcCard: profile.template.priceNfcCard,
                priceNfcQr: profile.template.priceNfcQr,
              }}
              existingTier={existingPayment?.tier}
            />
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
