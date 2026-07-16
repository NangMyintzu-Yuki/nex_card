// src/app/dashboard/onboarding/page.tsx
// One-time Category & Template Selection — enforced via server-side check

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { OnboardingClient } from "./_components/onboarding-client";

export const metadata: Metadata = {
  title: "Choose Your Template — PresenceCard",
  description: "Select your category and template. This is a one-time choice.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");

  const { categoryId } = await searchParams;

  // Fetch all active categories with their templates
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      iconName: true,
      templates: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          codeIdentifier: true,
          name: true,
          description: true,
          thumbnailUrl: true,
          accentColor: true,
          isPremium: true,
          priceQrOnly: true,
          priceNfcCard: true,
          priceNfcQr: true,
        },
      },
    },
  });

  // Fetch existing user profiles to know which categories are already locked
  const existingProfiles = await prisma.userProfile.findMany({
    where: { userId: session.user.id },
    select: {
      categoryId: true,
      templateLocked: true,
      slug: true,
      template: { select: { codeIdentifier: true, name: true } },
    },
  });

  const lockedCategoryIds = new Set(
    existingProfiles
      .filter((p) => p.templateLocked)
      .map((p) => p.categoryId)
  );

  // If all categories are locked, redirect to dashboard
  if (lockedCategoryIds.size >= categories.length) {
    redirect("/dashboard");
  }

  return (
    <OnboardingClient
      categories={categories}
      lockedCategoryIds={Array.from(lockedCategoryIds)}
      existingProfiles={existingProfiles}
      userId={session.user.id}
      initialCategoryId={categoryId}
    />
  );
}
