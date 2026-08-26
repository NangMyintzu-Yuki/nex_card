// src/lib/actions/admin-manage-actions.ts
// Server actions for superadmin to manage admin users
"use server";

import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export type AdminManageState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function requireSuperAdmin(): Promise<string | AdminManageState> {
  const session = await getServerSession();
  if (!session?.user?.id) return { status: "error", message: "You must be logged in." };
  if (session.user.role !== "SUPER_ADMIN") return { status: "error", message: "Super Admin access required." };
  return session.user.id;
}

// ── Add Admin ──────────────────────────────────────────────────────────────

const AddAdminInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

export async function addAdminAction(
  _prevState: AdminManageState,
  formData: FormData
): Promise<AdminManageState> {
  const superAdminId = await requireSuperAdmin();
  if (typeof superAdminId !== "string") return superAdminId;

  const parsed = AddAdminInput.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: "Invalid input. Email, name, and password (min 8 chars) are required." };

  const { email, name, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { status: "error", message: "An account with this email already exists." };

  const hashedPassword = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
    select: { id: true, email: true },
  });

  await writeAuditLog({
    actorId: superAdminId,
    action: "admin.create",
    targetType: "User",
    targetId: admin.id,
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin/users");
  return { status: "success", message: `Admin ${admin.email} created.` };
}

// ── Remove Admin (revoke admin role) ───────────────────────────────────────

const RemoveAdminInput = z.object({
  userId: z.string().min(1),
});

export async function removeAdminAction(
  _prevState: AdminManageState,
  formData: FormData
): Promise<AdminManageState> {
  const superAdminId = await requireSuperAdmin();
  if (typeof superAdminId !== "string") return superAdminId;

  const parsed = RemoveAdminInput.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { status: "error", message: "Invalid user ID." };

  const { userId } = parsed.data;

  // Prevent removing yourself
  if (userId === superAdminId) return { status: "error", message: "You cannot remove your own Super Admin role." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true, name: true } });
  if (!user) return { status: "error", message: "User not found." };
  if (user.role !== "ADMIN") return { status: "error", message: "This user is not an admin." };

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" },
  });

  await writeAuditLog({
    actorId: superAdminId,
    action: "admin.remove",
    targetType: "User",
    targetId: userId,
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin/users");
  return { status: "success", message: `Admin ${user.email} role revoked.` };
}

// ── List Admins ────────────────────────────────────────────────────────────

export async function getAdmins() {
  const session = await getServerSession();
  if (!session?.user?.id) return [];
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") return [];

  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });
}
