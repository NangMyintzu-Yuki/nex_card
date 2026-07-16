// src/app/dashboard/nfc/page.tsx
// NFC hub — lists profiles eligible for NFC programming

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Radio, ArrowRight } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export const metadata: Metadata = { title: "NFC Setup — NEX CARD" };

export default async function NfcHubPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const profiles = await prisma.userProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      nfcWriteCount: true,
      nfcProgrammedAt: true,
      paymentStatus: true,
      template: { select: { name: true } },
      payment: { select: { tier: true } },
    },
  });

  const nfcProfiles = profiles.filter(
    (p) => p.payment?.tier === "NFC_CARD" || p.payment?.tier === "PHYSICAL_CARD"
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" style={{ color: "var(--nc-text)" }}>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <Radio className="h-6 w-6 text-green-500" />
        </div>
        <h1 className="text-2xl font-black">NFC Setup</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-2)" }}>
          Program physical NFC tags for profiles on an NFC or NFC + QR plan.
        </p>
      </div>

      {nfcProfiles.length === 0 ? (
        <div className="rounded-2xl px-6 py-12 text-center"
          style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
          <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>
            No NFC-eligible profiles yet. Choose <strong>NFC Only</strong> or <strong>NFC + QR</strong> during onboarding.
          </p>
          <Link href="/dashboard/onboarding"
            className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-black"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            Create Profile →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {nfcProfiles.map((p) => (
            <Link key={p.id} href={`/dashboard/nfc/${p.slug}`}
              className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all hover:opacity-90"
              style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
              <div>
                <p className="font-mono text-sm font-bold">/{p.slug}</p>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  {p.template.name} · {p.payment?.tier?.replace("_", " ")}
                  {p.nfcProgrammedAt && ` · Programmed ${new Date(p.nfcProgrammedAt).toLocaleDateString()}`}
                </p>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
