// src/app/admin/users/[userId]/profiles/[profileId]/page.tsx
// Admin profile editor — allows admin to edit any user's profile content

import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { AdminProfileEditor } from "./admin-profile-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string; profileId: string }>;
}): Promise<Metadata> {
  const { profileId } = await params;
  return { title: `Edit Profile — Admin · NEX CARD` };
}

export default async function AdminEditProfilePage({
  params,
}: {
  params: Promise<{ userId: string; profileId: string }>;
}) {
  const { userId, profileId } = await params;
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const profile = await prisma.userProfile.findFirst({
    where: { id: profileId, userId },
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
      user: { select: { id: true, name: true, email: true } },
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
    <div className="mx-auto max-w-4xl nc-page px-3 sm:px-6 py-6">
      <div className="mb-6">
        <a href={`/admin/users`} className="text-xs font-semibold" style={{ color: "var(--nc-brand)" }}>
          ← Back to Users
        </a>
        <h1 className="mt-2 text-xl font-black" style={{ color: "var(--nc-text)" }}>
          Edit Profile: <span style={{ color: "var(--nc-brand)" }}>{profile.slug}</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
          Editing {profile.user.name}&apos;s {profile.category.name} profile ({profile.template.name})
        </p>
      </div>

      <AdminProfileEditor
        profile={profile}
        categorySlug={profile.category.slug}
      />
    </div>
  );
}
