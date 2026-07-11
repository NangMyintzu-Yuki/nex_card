// src/app/admin/users/page.tsx
// Admin user management — list, search, suspend/activate

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatDate, getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Users — Admin · PresenceCard" };
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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="mt-1 text-sm text-neutral-500">
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
          className="flex-1 min-w-48 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-indigo-500/50 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
        >
          <option value="" className="bg-neutral-900">All statuses</option>
          <option value="ACTIVE" className="bg-neutral-900">Active</option>
          <option value="SUSPENDED" className="bg-neutral-900">Suspended</option>
          <option value="PENDING_VERIFICATION" className="bg-neutral-900">Pending</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-400 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr>
                {["User", "Email", "Role", "Status", "Profiles", "Joined", "Last Login"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-neutral-600"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-neutral-400">
                    {user.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        user.role === "ADMIN"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-white/5 text-neutral-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[user.status] ?? "bg-white/5 text-neutral-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-400">
                    {user._count.profiles}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600 text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600 text-xs">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
            <p className="text-xs text-neutral-600">
              Page {page} of {totalPages} · {totalCount} users
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?q=${q ?? ""}&status=${status ?? ""}&page=${page - 1}`}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-400 hover:border-white/20 hover:text-white transition-all"
                >
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`?q=${q ?? ""}&status=${status ?? ""}&page=${page + 1}`}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-400 hover:border-white/20 hover:text-white transition-all"
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
