// src/app/admin/templates/page.tsx
// Fully server-rendered — no client components (avoids RSC Lazy / originalFactory bugs)

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { resolveThumbnailUrl } from "@/lib/thumbnails";
import {
  ActiveToggle,
  PremiumBadge,
  PriceForm,
} from "./_components/template-actions";

export const metadata: Metadata = { title: "Templates — Admin · NEX CARD" };
export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  "digital-name-card": "#6366f1",
  portfolio: "#0ea5e9",
  "business-ad": "#f59e0b",
  "wedding-invitation": "#ec4899",
};

export default async function AdminTemplatesPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      templates: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { profiles: true } } },
      },
      _count: { select: { profiles: true } },
    },
  });

  const totalTemplates = categories.reduce((acc, c) => acc + c.templates.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--nc-text)" }}>
          Templates
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--nc-text-3)" }}>
          {totalTemplates} templates · prices in MMK · toggle Active / PRO inline
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const color = CATEGORY_COLORS[category.slug] ?? "#6366f1";
          return (
            <section key={category.id}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>
                  {category.name}
                </h2>
                <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                  {category.templates.length} templates
                  {category._count.profiles > 0 && ` · ${category._count.profiles} profiles`}
                </span>
              </div>

              <div
                className="overflow-x-auto rounded-2xl"
                style={{
                  background: "var(--nc-bg-card)",
                  border: "1px solid var(--nc-border)",
                }}
              >
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr
                      className="border-b text-[10px] font-semibold uppercase tracking-wider"
                      style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-3)" }}
                    >
                      <th className="py-2.5 pl-4 pr-4 font-semibold">Template</th>
                      <th className="px-2 py-2.5 text-center font-semibold w-16">Active</th>
                      <th className="px-2 py-2.5 text-center font-semibold w-16">Tier</th>
                      <th className="py-2.5 pl-2 pr-4 font-semibold">Prices (MMK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.templates.map((template) => {
                      const thumb = resolveThumbnailUrl(template.thumbnailUrl, template.name);
                      return (
                        <tr
                          key={template.id}
                          className="border-b last:border-b-0"
                          style={{ borderColor: "var(--nc-border)" }}
                        >
                          <td className="py-3 pr-4 pl-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg"
                                style={{ background: "var(--nc-bg-2)" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={thumb}
                                  alt={template.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-semibold truncate"
                                    style={{ color: "var(--nc-text)" }}
                                  >
                                    {template.name}
                                  </span>
                                  {template.accentColor && (
                                    <span
                                      className="h-2 w-2 shrink-0 rounded-full"
                                      style={{ background: template.accentColor }}
                                    />
                                  )}
                                </div>
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "var(--nc-text-3)" }}
                                >
                                  {template.codeIdentifier}
                                  {template._count.profiles > 0 &&
                                    ` · ${template._count.profiles} uses`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <ActiveToggle
                              templateId={template.id}
                              isActive={template.isActive}
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <PremiumBadge />
                          </td>
                          <td className="py-3 pl-2 pr-4">
                            <PriceForm
                              templateId={template.id}
                              priceQrOnly={template.priceQrOnly}
                              priceNfcCard={template.priceNfcCard}
                              priceNfcQr={template.priceNfcQr}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
