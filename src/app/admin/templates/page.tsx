// src/app/admin/templates/page.tsx
// Admin template catalogue — view all 20 templates, toggle active/premium

import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Templates — Admin · PresenceCard" };
export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      templates: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { profiles: true } },
        },
      },
      _count: { select: { profiles: true } },
    },
  });

  const CATEGORY_COLORS: Record<string, string> = {
    "digital-name-card": "#6366f1",
    portfolio:            "#0ea5e9",
    "business-ad":        "#f59e0b",
    "wedding-invitation": "#ec4899",
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Template Catalogue</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {categories.reduce((acc, c) => acc + c.templates.length, 0)} templates across{" "}
          {categories.length} categories
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => {
          const color = CATEGORY_COLORS[category.slug] ?? "#6366f1";
          return (
            <div key={category.id}>
              {/* Category header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: color }}
                  />
                  <h2 className="text-lg font-black text-white">
                    {category.name}
                  </h2>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-neutral-500">
                    {category._count.profiles} profiles
                  </span>
                </div>
                <span className="font-mono text-xs text-neutral-700">
                  {category.slug}
                </span>
              </div>

              {/* Templates grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {category.templates.map((template) => (
                  <div
                    key={template.id}
                    className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition-all hover:border-white/10"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                      <Image
                        src={template.thumbnailUrl}
                        alt={template.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      <div className="absolute inset-0 flex items-end p-2 gap-1">
                        {!template.isActive && (
                          <span className="rounded-full bg-red-500/80 px-2 py-0.5 text-xs font-bold text-white">
                            Inactive
                          </span>
                        )}
                        {template.isPremium && (
                          <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-xs font-bold text-black">
                            PRO
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white">{template.name}</h3>
                          <p className="font-mono text-xs text-neutral-600 truncate">
                            {template.codeIdentifier}
                          </p>
                        </div>
                        <div
                          className="h-4 w-4 shrink-0 rounded-full mt-0.5"
                          style={{ background: template.accentColor ?? color }}
                          title={template.accentColor ?? "No accent color"}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-neutral-600">
                          {template._count.profiles} uses
                        </span>
                        <span className="text-neutral-600">
                          Sort: {template.sortOrder}
                        </span>
                      </div>

                      {/* Toggle buttons — wire to Server Actions in production */}
                      <div className="mt-3 flex gap-1.5">
                        <button
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                            template.isActive
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/5 text-neutral-600 hover:text-white"
                          }`}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                            template.isPremium
                              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                              : "bg-white/5 text-neutral-600 hover:text-white"
                          }`}
                        >
                          {template.isPremium ? "PRO" : "Free"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
