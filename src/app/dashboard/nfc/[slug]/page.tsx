// src/app/dashboard/nfc/[slug]/page.tsx
// NFC tag programming guide and tracking

import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { getNfcProfileUrl } from "@/lib/actions/nfc-action";
import { NfcManager } from "./_components/nfc-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `NFC — /${slug} — NEX CARD` };
}

export default async function NfcPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.userProfile.findFirst({
    where: { slug, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      nfcWriteCount: true,
      nfcProgrammedAt: true,
      nfcFulfillment: true,
      paymentStatus: true,
      payment: { select: { tier: true, status: true } },
    },
  });

  if (!profile) notFound();

  const nfcUrl = await getNfcProfileUrl(profile.slug);

  return (
    <NfcManager
      profile={{
        id: profile.id,
        slug: profile.slug,
        isPublished: profile.isPublished,
        nfcWriteCount: Number(profile.nfcWriteCount),
        nfcProgrammedAt: profile.nfcProgrammedAt?.toISOString() ?? null,
        paymentTier: profile.payment?.tier ?? null,
        paymentStatus: profile.paymentStatus,
        nfcFulfillment: profile.nfcFulfillment,
      }}
      nfcUrl={nfcUrl}
    />
  );
}
