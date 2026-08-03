// src/app/n/[slug]/page.tsx
// Distinct NFC tap landing — counts NFC_TAP then redirects to public profile

import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/db/prisma";
import { trackProfileEvent } from "@/lib/analytics/track";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function NfcTapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const profile = await prisma.userProfile.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });

  if (!profile || !profile.isPublished) notFound();

  const settings = await getSettings();
  const h = await headers();
  const referrer = h.get("referer");
  const userAgent = h.get("user-agent");

  if (settings.enable_analytics) {
    trackProfileEvent({
      profileId: profile.id,
      type: "NFC_TAP",
      referrer,
      userAgent,
    });
  }

  // Also bump legacy counter for dashboard compatibility
  prisma.userProfile
    .update({
      where: { id: profile.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  redirect(`/${slug}`);
}
