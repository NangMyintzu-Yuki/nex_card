// src/lib/actions/profile-actions.ts
// Next.js Server Actions — all profile mutations live here

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { purgeProfileCache } from "@/lib/cache/profile-cache";
import {
  safeParseTemplateData,
  type CategorySlug,
} from "@/lib/validators/template-schemas";
import { getServerSession } from "@/lib/auth/session";
import { isMaintenanceMode, MAINTENANCE_MESSAGE } from "@/lib/security/maintenance";
import { isReservedSlug } from "@/lib/slugs/reserved";
import { deleteFile } from "@/lib/storage";
import { hashPassword, DEFAULT_PASSWORD } from "@/lib/auth/hash";

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
  | { status: "success"; slug: string; profileId: string }
  | { status: "error"; message: string };

export async function selectTemplateAction(
  _prevState: SelectTemplateState,
  formData: FormData
): Promise<SelectTemplateState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be logged in." };
  }
  if (isMaintenanceMode() && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: MAINTENANCE_MESSAGE };
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

  if (isReservedSlug(slug)) {
    return {
      status: "error",
      message: "That slug is reserved. Please choose a different one.",
    };
  }

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

  // Guard: max profiles per user (platform setting)
  if (!existing) {
    const { getSettings } = await import("@/lib/settings");
    const settings = await getSettings();
    const profileCount = await prisma.userProfile.count({
      where: { userId: session.user.id },
    });
    if (profileCount >= settings.max_profiles_per_user) {
      return {
        status: "error",
        message: `You can create at most ${settings.max_profiles_per_user} profiles.`,
      };
    }
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
  const profile = await prisma.userProfile.upsert({
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
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");

  return { status: "success", slug, profileId: profile.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: UPDATE PROFILE DYNAMIC DATA (always allowed, no lock here)
// ─────────────────────────────────────────────────────────────────────────────

const UpdateProfileInput = z.object({
  profileId: z.string().cuid(),
  dynamicJsonData: z.string().min(2).max(200_000),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export type UpdateProfileState =
  | { status: "idle" }
  | { status: "success" }
    | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> };


export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }
  if (isMaintenanceMode() && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: MAINTENANCE_MESSAGE };
  }

  const parsed = UpdateProfileInput.safeParse({
    profileId: formData.get("profileId"),
    dynamicJsonData: formData.get("dynamicJsonData"),
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    ogImageUrl: formData.get("ogImageUrl") || undefined,
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
      paymentStatus: true,
      dynamicJsonData: true,
      ogImageUrl: true,
      category: { select: { slug: true } },
      template: { select: { isPremium: true } },
    },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  // Premium templates require approved payment before any content mutation
  if (profile.template.isPremium && profile.paymentStatus !== "APPROVED") {
    return {
      status: "error",
      message:
        "Payment must be approved before editing or publishing a premium template. Complete payment or wait for admin approval.",
    };
  }

  // Capture old data for R2 cleanup
  const oldDynamicJson = profile.dynamicJsonData as Record<string, unknown>;
  const oldOgImageUrl = profile.ogImageUrl;

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
    const fieldList = validation.error.issues.map((i) => {
      const path = i.path.join(".");
      return path ? `${path}: ${i.message}` : i.message;
    }).join("; ");
    return {
      status: "error",
      message: `Validation failed: ${fieldList}`,
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

  // Clean up old images from R2 storage
  await cleanupOldImages(oldDynamicJson, validation.data as Record<string, unknown>, oldOgImageUrl, parsed.data.ogImageUrl);

  // Purge the public cache for this slug immediately
  await purgeProfileCache(profile.slug, session.user.id);
  revalidatePath("/dashboard");

  return { status: "success" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: ADMIN UPDATE PROFILE (bypasses ownership + premium check)
// ─────────────────────────────────────────────────────────────────────────────

export async function adminUpdateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: "Admin access required." };
  }

  const parsed = UpdateProfileInput.safeParse({
    profileId: formData.get("profileId"),
    dynamicJsonData: formData.get("dynamicJsonData"),
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    ogImageUrl: formData.get("ogImageUrl") || undefined,
    isPublished: formData.get("isPublished"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Admin can edit any profile — no ownership check
  const profile = await prisma.userProfile.findFirst({
    where: { id: parsed.data.profileId },
    select: {
      id: true,
      slug: true,
      dynamicJsonData: true,
      ogImageUrl: true,
      category: { select: { slug: true } },
      userId: true,
    },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  // Capture old data for R2 cleanup
  const oldDynamicJson = profile.dynamicJsonData as Record<string, unknown>;
  const oldOgImageUrl = profile.ogImageUrl;

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
    const fieldList = validation.error.issues.map((i) => {
      const path = i.path.join(".");
      return path ? `${path}: ${i.message}` : i.message;
    }).join("; ");
    return {
      status: "error",
      message: `Validation failed: ${fieldList}`,
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

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

  await cleanupOldImages(oldDynamicJson, validation.data as Record<string, unknown>, oldOgImageUrl, parsed.data.ogImageUrl);
  await purgeProfileCache(profile.slug, profile.userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${profile.userId}/profiles/${profile.id}`);

  return { status: "success" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: DELETE PROFILE (frees slug + category slot for reclaim)
// ─────────────────────────────────────────────────────────────────────────────

const DeleteProfileInput = z.object({
  profileId: z.string().cuid(),
  confirmation: z.literal("DELETE"),
});

export type DeleteProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function deleteProfileAction(
  _prev: DeleteProfileState,
  formData: FormData
): Promise<DeleteProfileState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }
  if (isMaintenanceMode() && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: MAINTENANCE_MESSAGE };
  }

  const parsed = DeleteProfileInput.safeParse({
    profileId: formData.get("profileId"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: 'Type DELETE to confirm profile deletion.',
    };
  }

  const profile = await prisma.userProfile.findFirst({
    where: { id: parsed.data.profileId, userId: session.user.id },
    select: { id: true, slug: true, dynamicJsonData: true, ogImageUrl: true },
  });

  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  // Clean up all uploaded images from R2
  const allUrls = extractImageUrls(profile.dynamicJsonData);
  if (profile.ogImageUrl) allUrls.add(profile.ogImageUrl);
  if (allUrls.size > 0) {
    Promise.allSettled([...allUrls].map((url) => deleteFile(url))).catch(() => {});
  }

  await prisma.userProfile.delete({ where: { id: profile.id } });
  await purgeProfileCache(profile.slug, session.user.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");

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

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Extract all image URLs from a template data object (recursively)
// ─────────────────────────────────────────────────────────────────────────────

function extractImageUrls(obj: unknown): Set<string> {
  const urls = new Set<string>();

  function walk(val: unknown) {
    if (typeof val === "string") {
      // Only collect URLs that look like uploaded images (contain /uploads/ or are from known CDN)
      if (
        val.startsWith("http") &&
        (val.includes("/uploads/") || val.includes("r2.dev"))
      ) {
        urls.add(val);
      }
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    } else if (val && typeof val === "object") {
      Object.values(val).forEach(walk);
    }
  }

  walk(obj);
  return urls;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Delete images from R2 that exist in old data but not in new data
// ─────────────────────────────────────────────────────────────────────────────

async function cleanupOldImages(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  oldOgUrl: string | null | undefined,
  newOgUrl: string | null | undefined
): Promise<void> {
  const oldUrls = extractImageUrls(oldData);
  const newUrls = extractImageUrls(newData);

  // Also include ogImageUrl
  if (oldOgUrl) oldUrls.add(oldOgUrl);
  if (newOgUrl) newUrls.add(newOgUrl);

  // Find URLs that were removed
  const removedUrls = [...oldUrls].filter((u) => !newUrls.has(u));

  if (removedUrls.length === 0) return;

  // Delete removed images from R2 (fire-and-forget, don't block the response)
  Promise.allSettled(removedUrls.map((url) => deleteFile(url))).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: ADMIN CREATE USER + PROFILE IN ONE FLOW
// ─────────────────────────────────────────────────────────────────────────────

const AdminCreateUserWithProfileInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
  createProfile: z.enum(["true", "false"]),
  categoryId: z.string().cuid().optional(),
  templateId: z.string().cuid().optional(),
  tier: z.enum(["QR_ONLY", "NFC_QR"]).optional(),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
});

export type AdminCreateUserWithProfileState =
  | { status: "idle" }
  | { status: "success"; userId: string; userName: string; userEmail: string; profileSlug: string | null; defaultPassword: string }
  | { status: "error"; message: string };

export async function adminCreateUserWithProfileAction(
  _prevState: AdminCreateUserWithProfileState,
  formData: FormData
): Promise<AdminCreateUserWithProfileState> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { status: "error", message: "Unauthorized." };
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return { status: "error", message: "Admin access required." };
  }

  const parsed = AdminCreateUserWithProfileInput.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    createProfile: formData.get("createProfile"),
    categoryId: formData.get("categoryId"),
    templateId: formData.get("templateId"),
    tier: formData.get("tier"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues.map((i) => i.message).join(". "),
    };
  }

  const { name, email, password, role, createProfile, categoryId, templateId, slug, tier } = parsed.data;
  const shouldCreateProfile = createProfile === "true";
  const actualPassword = password || DEFAULT_PASSWORD;

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    return { status: "error", message: "An account with this email already exists." };
  }

  // Validate profile fields if creating profile
  if (shouldCreateProfile) {
    if (!categoryId || !templateId || !slug) {
      return { status: "error", message: "Category, template, and slug are required when creating a profile." };
    }

    if (isReservedSlug(slug)) {
      return { status: "error", message: "That slug is reserved. Please choose a different one." };
    }

    const slugExists = await prisma.userProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (slugExists) {
      return { status: "error", message: "That slug is already taken." };
    }

    const template = await prisma.template.findFirst({
      where: { id: templateId, categoryId, isActive: true },
      select: { id: true, isPremium: true, priceQrOnly: true, priceNfcQr: true },
    });
    if (!template) {
      return { status: "error", message: "Invalid template selection." };
    }

    // Require tier for premium templates
    if (template.isPremium && !tier) {
      return { status: "error", message: "Pricing tier is required for premium templates." };
    }
    if (template.isPremium) {
      const price = tier === "QR_ONLY" ? template.priceQrOnly : template.priceNfcQr;
      if (price == null || price <= 0) {
        return { status: "error", message: `No price set for ${tier} on this template.` };
      }
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true },
    });
    if (!category) {
      return { status: "error", message: "Category not found." };
    }
  }

  const hashedPassword = await hashPassword(actualPassword);

  // Create user + profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      select: { id: true, name: true, email: true },
    });

    let profileSlug: string | null = null;

    if (shouldCreateProfile && categoryId && templateId && slug) {
      const category = await tx.category.findUnique({
        where: { id: categoryId },
        select: { slug: true },
      });

      // Fetch template to check if premium
      const tpl = await tx.template.findUnique({
        where: { id: templateId },
        select: { isPremium: true, priceQrOnly: true, priceNfcQr: true },
      });

      const isPremium = tpl?.isPremium ?? false;
      const paymentStatus = isPremium ? "APPROVED" : null;
      const price = tier === "QR_ONLY" ? tpl?.priceQrOnly : tpl?.priceNfcQr;

      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          categoryId,
          templateId,
          slug,
          templateLocked: true,
          isPublished: true,
          paymentStatus: paymentStatus as any,
          dynamicJsonData: getEmptyDataForCategory(category!.slug as CategorySlug),
        },
        select: { id: true, slug: true },
      });

      profileSlug = profile.slug;

      // Auto-create approved payment for premium templates (admin-created, no screenshot needed)
      if (isPremium && price != null && price > 0 && tier) {
        await tx.payment.create({
          data: {
            userId: user.id,
            userProfileId: profile.id,
            tier,
            amount: price,
            originalPrice: price,
            screenshotUrl: "admin-created",
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
            adminNote: "Auto-approved: admin-created user",
          },
        });
      }
    }

    return { user, profileSlug };
  });

  if (result.profileSlug) {
    purgeProfileCache(result.profileSlug, result.user.id);
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/revenue");

  return {
    status: "success",
    userId: result.user.id,
    userName: result.user.name,
    userEmail: result.user.email,
    profileSlug: result.profileSlug,
    defaultPassword: actualPassword,
  };
}
