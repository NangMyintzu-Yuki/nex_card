// src/app/dashboard/onboarding/preview/[templateCode]/page.tsx
// Shows a live preview of a template with sample data before the user commits

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { PreviewRenderer } from "./preview-renderer";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateCode: string }>;
}): Promise<Metadata> {
  const { templateCode } = await params;
  const template = await prisma.template.findUnique({
    where: { codeIdentifier: templateCode },
    select: { name: true, category: { select: { name: true } } },
  });

  return {
    title: template
      ? `Preview: ${template.name} — ${template.category.name} — NEX CARD`
      : "Template Preview — NEX CARD",
  };
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateCode: string }>;
  searchParams: Promise<{ from?: string; categoryId?: string; templateId?: string }>;
}) {
  const { templateCode } = await params;
  const { from } = await searchParams;

  const template = await prisma.template.findUnique({
    where: { codeIdentifier: templateCode },
    select: {
      id: true,
      name: true,
      codeIdentifier: true,
      accentColor: true,
      isPremium: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!template) notFound();

  // Build back URL
  const backUrl = from === "onboarding"
    ? `/dashboard/onboarding?categoryId=${template.category.id}`
    : "/dashboard/onboarding";

  // Build select URL (goes back to onboarding with this template pre-selected)
  const selectUrl = `/dashboard/onboarding?categoryId=${template.category.id}&templateId=${template.id}`;

  return (
    <div className="relative">
      {/* Fixed preview toolbar */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-4 border-b border-white/10 bg-neutral-950/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={backUrl}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-white/20 hover:text-white transition-all shrink-0">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{template.name}</p>
            <p className="text-xs text-neutral-500 truncate">{template.category.name}</p>
          </div>
          {template.isPremium && (
            <span className="shrink-0 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">
              Paid
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden text-xs text-neutral-600 sm:block">
            Previewing with sample data
          </span>
          <Link href={selectUrl}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25">
            <Lock className="h-3.5 w-3.5" />
            Select This Template
          </Link>
        </div>
      </div>

      {/* Template preview with top padding for toolbar */}
      <div className="pt-14">
        <PreviewRenderer codeIdentifier={template.codeIdentifier} accentColor={template.accentColor} />
      </div>
    </div>
  );
}