// src/app/preview/[templateCode]/page.tsx
// Public template preview — no auth required. Used for screenshot generation.

import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { PreviewRenderer } from "../../dashboard/onboarding/preview/[templateCode]/preview-renderer";

export const dynamic = "force-dynamic";

export default async function PublicPreviewPage({
  params,
}: {
  params: Promise<{ templateCode: string }>;
}) {
  const { templateCode } = await params;

  const template = await prisma.template.findUnique({
    where: { codeIdentifier: templateCode },
    select: { codeIdentifier: true, accentColor: true },
  });

  if (!template) notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <PreviewRenderer
        codeIdentifier={template.codeIdentifier}
        accentColor={template.accentColor}
      />
    </div>
  );
}
