// src/app/admin/users/page.tsx
// Admin user management — list, search, suspend/activate

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { CardExportButton } from "./_components/card-export-button";

export const metadata: Metadata = { title: "Users — Admin · NEX CARD" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const perPage = 25;

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

  const [users, totalCount] = await Promise.all([
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
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const STATUS_STYLES: Record<string, string> = {
    ACTIVE:               "bg-emerald-500/10 text-emerald-400",
    SUSPENDED:            "bg-red-500/10 text-red-400",
    PENDING_VERIFICATION: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="mx-auto max-w-6xl nc-page">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>Users</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
            {totalCount.toLocaleString()} total accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="nc-input flex-1 min-w-48 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="nc-input rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING_VERIFICATION">Pending</option>
        </select>
        <button
          type="submit"
          className="nc-btn-brand rounded-xl px-5 py-2.5 text-sm font-bold"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="nc-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <tr>
                {["User", "Email", "Role", "Status", "Profiles", "Joined", "Last Login", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest"
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
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: "var(--nc-sidebar-active)", color: "var(--nc-brand-2)" }}>
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium" style={{ color: "var(--nc-text)" }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "var(--nc-text-2)" }}>
                    {user.email}
                  </td>
                  <td className="px-5 py-3.5">
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
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[user.status] ?? ""
                      }`}
                      style={!STATUS_STYLES[user.status] ? { background: "var(--nc-bg-hover)", color: "var(--nc-text-3)" } : undefined}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--nc-text-2)" }}>
                    {user._count.profiles}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-5 py-3.5">
                    <CardExportButton
                      userId={user.id}
                      profileCount={user._count.profiles}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--nc-border)" }}>
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
    </div>
  );
}
