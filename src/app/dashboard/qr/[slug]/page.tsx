// src/app/dashboard/qr/[slug]/page.tsx
// QR Code generator & manager — shows QR, lock status, scan stats, download

import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { APP_URL } from "@/lib/env";
import { QRManager } from "./_components/qr-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `QR Code — /${slug} — NEX CARD` };
}

export default async function QRPage({
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
      templateLocked: true,
      qrLocked: true,
      qrGeneratedAt: true,
      qrScanCount: true,
      viewCount: true,
      updatedAt: true,
      user: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      template: {
        select: {
          name: true,
          codeIdentifier: true,
          accentColor: true,
          thumbnailUrl: true,
        },
      },
    },
  });

  if (!profile) notFound();

  return (
    <QRManager
      profile={{
        ...profile,
        userName: profile.user.name,
        viewCount: Number(profile.viewCount),
        qrScanCount: Number(profile.qrScanCount),
        qrGeneratedAt: profile.qrGeneratedAt?.toISOString() ?? null,
      }}
      appUrl={APP_URL}
    />
  );
}