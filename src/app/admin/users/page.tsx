// src/app/admin/users/page.tsx
// Admin user management — list, search, suspend/activate

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { CardExportButton } from "./_components/card-export-button";
import { AdminCreateUser } from "./_components/admin-create-user";
import { UserEditModal } from "./_components/user-edit-modal";
import { UserDeleteButton } from "./_components/user-delete-button";

export const metadata: Metadata = { title: "Users — Admin · NEX CARD" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const perPage = 10;

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
    ...(status && ["ACTIVE","SUSPENDED","PENDING_VERIFICATION"].includes(status)
      ? { status: status as "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" }
      : {}),
  };

  const [users, totalCount, categories] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { profiles: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.category.findMany({
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
            isPremium: true,
            priceQrOnly: true,
            priceNfcQr: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const STATUS_STYLES: Record<string, string> = {
    ACTIVE:               "bg-emerald-500/10 text-emerald-400",
    SUSPENDED:            "bg-red-500/10 text-red-400",
    PENDING_VERIFICATION: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="mx-auto max-w-6xl nc-page px-3 sm:px-6">
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black" style={{ color: "var(--nc-text)" }}>Users</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
            {totalCount.toLocaleString()} total accounts
          </p>
        </div>
        {session.user.role === "SUPER_ADMIN" && (
          <AdminCreateUser categories={categories} />
        )}
      </div>

      {/* Filters */}
      <form method="GET" className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="nc-input flex-1 min-w-0 sm:min-w-48 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm"
        />
        <div className="flex gap-2">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="nc-input flex-1 sm:flex-none rounded-xl px-3 py-2 sm:py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending</option>
          </select>
          <button
            type="submit"
            className="nc-btn-brand rounded-xl px-5 py-2 sm:py-2.5 text-sm font-bold"
          >
            Search
          </button>
        </div>
      </form>

      {/* Desktop Table */}
      <div className="nc-card overflow-hidden rounded-2xl hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <tr>
                {["User", "Email", "Role", "Status", "Profiles", "Joined", "Last Login", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "var(--nc-text-3)" }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--nc-border)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: "var(--nc-sidebar-active)", color: "var(--nc-brand-2)" }}>
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium" style={{ color: "var(--nc-text)" }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--nc-text-2)" }}>
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        user.role === "ADMIN"
                          ? "bg-amber-500/10 text-amber-400"
                          : ""
                      }`}
                      style={user.role !== "ADMIN" ? { background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" } : undefined}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[user.status] ?? ""
                      }`}
                      style={!STATUS_STYLES[user.status] ? { background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" } : undefined}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--nc-text-2)" }}>
                    {user._count.profiles}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {session.user.role === "SUPER_ADMIN" && (
                        <>
                          <UserEditModal user={user} />
                          {user.role !== "SUPER_ADMIN" && (
                            <UserDeleteButton userId={user.id} userName={user.name} />
                          )}
                          <CardExportButton
                            userId={user.id}
                            profileCount={user._count.profiles}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="nc-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "var(--nc-sidebar-active)", color: "var(--nc-brand-2)" }}>
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate text-sm" style={{ color: "var(--nc-text)" }}>{user.name}</p>
                <p className="text-xs font-mono truncate" style={{ color: "var(--nc-text-3)" }}>{user.email}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                  STATUS_STYLES[user.status] ?? ""
                }`}
                style={!STATUS_STYLES[user.status] ? { background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" } : undefined}
              >
                {user.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--nc-text-3)" }}>
              <span className="rounded-full px-2 py-0.5 font-bold"
                style={user.role === "ADMIN" ? { background: "rgba(245,158,11,0.1)", color: "#f59e0b" } : { background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" }}>
                {user.role}
              </span>
              <span>{user._count.profiles} profiles</span>
              <span>· {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--nc-border)" }}>
              <span className="text-[11px]" style={{ color: "var(--nc-text-3)" }}>
                Last login: {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
              </span>
              {session.user.role === "SUPER_ADMIN" && (
                <div className="flex items-center gap-1">
                  <UserEditModal user={user} />
                  {user.role !== "SUPER_ADMIN" && (
                    <UserDeleteButton userId={user.id} userName={user.name} />
                  )}
                  <CardExportButton userId={user.id} profileCount={user._count.profiles} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}>
          <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
            Page {page} of {totalPages} · {totalCount} users
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?q=${q ?? ""}&status=${status ?? ""}&page=${page - 1}`}
                className="nc-btn-ghost rounded-lg px-3 py-1.5 text-xs"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?q=${q ?? ""}&status=${status ?? ""}&page=${page + 1}`}
                className="nc-btn-ghost rounded-lg px-3 py-1.5 text-xs"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
