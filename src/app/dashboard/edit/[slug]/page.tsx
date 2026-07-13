// src/app/dashboard/edit/[slug]/page.tsx
// Profile content editor — loads existing data, validates on save via Server Action

import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { ProfileEditor } from "./_components/profile-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit /${slug} — PresenceCard` };
}

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  // Fetch the profile — must belong to this user
  const profile = await prisma.userProfile.findFirst({
    where: { slug, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      isPublished: true,
      templateLocked: true,
      dynamicJsonData: true,
      metaTitle: true,
      metaDescription: true,
      ogImageUrl: true,
       qrLocked: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      template: {
        select: {
          id: true,
          name: true,
          codeIdentifier: true,
          thumbnailUrl: true,
          accentColor: true,
        },
      },
    },
  });

  if (!profile) notFound();

  return (
    <ProfileEditor
      profile={profile}
      categorySlug={profile.category.slug}
    />
  );
}
