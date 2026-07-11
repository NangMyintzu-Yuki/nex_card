// src/lib/actions/profile-actions.ts
// Next.js Server Actions — all profile mutations live here

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { purgeProfileCache } from "@/lib/cache/profile-cache";
import {
  safeParseTemplateData,
  type CategorySlug,
} from "@/lib/validators/template-schemas";
import { getServerSession } from "@/lib/auth/session";

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: SELECT TEMPLATE DURING ONBOARDING (one-time lock)
// ─────────────────────────────────────────────────────────────────────────────

const SelectTemplateInput = z.object({
  categoryId: z.string().cuid(),
  templateId: z.string().cuid(),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

export type SelectTemplateState =
  | { status: "idle" }
  | { status: "success"; slug: string }
  | { status: "error"; message: string };

export async function selectTemplateAction(
  _prevState: SelectTemplateState,
  formData: FormData
): Promise<SelectTemplateState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be logged in." };
  }

  const parsed = SelectTemplateInput.safeParse({
    categoryId: formData.get("categoryId"),
    templateId: formData.get("templateId"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues.map((i) => i.message).join(". "),
    };
  }

  const { categoryId, templateId, slug } = parsed.data;

  // Guard: user must not already have a profile for this category
  const existing = await prisma.userProfile.findUnique({
    where: {
      userId_categoryId: {
        userId: session.user.id,
        categoryId,
      },
    },
    select: { id: true, templateLocked: true },
  });

  if (existing?.templateLocked) {
    return {
      status: "error",
      message:
        "Your template is already locked for this category. You cannot change it.",
    };
  }

  // Guard: slug must be globally unique
  const slugConflict = await prisma.userProfile.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (slugConflict) {
    return {
      status: "error",
      message: "That slug is already taken. Please choose a different one.",
    };
  }

  // Guard: template must belong to the stated category
  const template = await prisma.template.findFirst({
    where: { id: templateId, categoryId, isActive: true },
    select: { id: true, categoryId: true },
  });

  if (!template) {
    return {
      status: "error",
      message: "Invalid template selection.",
    };
  }

  // Fetch category to get initial empty JSON structure
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  });

  if (!category) {
    return { status: "error", message: "Category not found." };
  }

  // Create or update the profile — lock template immediately on creation
  await prisma.userProfile.upsert({
    where: {
      userId_categoryId: {
        userId: session.user.id,
        categoryId,
      },
    },
    create: {
      userId: session.user.id,
      categoryId,
      templateId,
      slug,
      templateLocked: true, // Lock on first save
      isPublished: false,
      dynamicJsonData: getEmptyDataForCategory(category.slug as CategorySlug),
    },
    update: {
      // Only update if NOT yet locked (safety double-check)
      templateId,
      templateLocked: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");

  return { status: "success", slug };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: UPDATE PROFILE DYNAMIC DATA (always allowed, no lock here)
// ─────────────────────────────────────────────────────────────────────────────

const UpdateProfileInput = z.object({
  profileId: z.string().cuid(),
  dynamicJsonData: z.string().min(2), // Raw JSON string from form
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export type UpdateProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }

  const parsed = UpdateProfileInput.safeParse({
    profileId: formData.get("profileId"),
    dynamicJsonData: formData.get("dynamicJsonData"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    ogImageUrl: formData.get("ogImageUrl"),
    isPublished: formData.get("isPublished"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Verify profile belongs to the requesting user
  const profile = await prisma.userProfile.findFirst({
    where: {
      id: parsed.data.profileId,
      userId: session.user.id,
    },
    select: {
      id: true,
      slug: true,
      category: { select: { slug: true } },
    },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  // Parse and validate the JSON against the category's schema
  let rawData: unknown;
  try {
    rawData = JSON.parse(parsed.data.dynamicJsonData);
  } catch {
    return { status: "error", message: "Invalid JSON data submitted." };
  }

  const validation = safeParseTemplateData(
    profile.category.slug as CategorySlug,
    rawData
  );

  if (!validation.success) {
    return {
      status: "error",
      message: "Profile data failed schema validation.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Persist to database
  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      dynamicJsonData: validation.data,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      ogImageUrl: parsed.data.ogImageUrl || null,
      isPublished: parsed.data.isPublished,
      updatedAt: new Date(),
    },
  });

  // Purge the public cache for this slug immediately
  await purgeProfileCache(profile.slug, session.user.id);
  revalidatePath("/dashboard");

  return { status: "success" };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Returns a valid empty data skeleton for a given category
// ─────────────────────────────────────────────────────────────────────────────

function getEmptyDataForCategory(categorySlug: CategorySlug): object {
  const defaults: Record<CategorySlug, object> = {
    "digital-name-card": {
      fullName: "",
      jobTitle: "",
      company: "",
      contacts: [],
      socialLinks: [],
    },
    portfolio: {
      fullName: "",
      headline: "",
      bio: "",
      contacts: [],
      socialLinks: [],
      projects: [],
      experience: [],
      skills: [],
    },
    "business-ad": {
      businessName: "",
      tagline: "",
      description: "",
      contacts: [],
      socialLinks: [],
      services: [],
      primaryCtaLabel: "Contact Us",
      primaryCtaUrl: "",
    },
    "wedding-invitation": {
      partner1: { name: "" },
      partner2: { name: "" },
      weddingDate: new Date().toISOString(),
      loveHistory: [],
      events: [],
      gallery: [],
    },
  };

  return defaults[categorySlug] ?? {};
}
