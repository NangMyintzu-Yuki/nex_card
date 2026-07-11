// src/components/layout/template-shell.tsx
// Wraps all public template renders with shared meta, viewport, and print controls

import Link from "next/link";
import { Sparkles } from "lucide-react";

interface TemplateShellProps {
  children: React.ReactNode;
  slug: string;
  showBranding?: boolean;
}

/**
 * TemplateShell wraps every public profile page.
 * It injects the PresenceCard footer badge and a "Create your own" CTA.
 * showBranding can be suppressed for PRO users (future feature).
 */
export function TemplateShell({
  children,
  slug,
  showBranding = true,
}: TemplateShellProps) {
  return (
    <>
      {/* ── The rendered template ──────────────────────────────────── */}
      {children}

      {/* ── PresenceCard attribution badge ────────────────────────── */}
      {showBranding && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            href="/?ref=badge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white/70 shadow-xl backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded bg-indigo-500">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
            Made with PresenceCard
          </Link>
        </div>
      )}
    </>
  );
}
