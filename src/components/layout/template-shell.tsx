// src/components/layout/template-shell.tsx
// Wraps all public template renders with shared meta, viewport, and print controls

import Link from "next/link";

interface TemplateShellProps {
  children: React.ReactNode;
  slug: string;
  showBranding?: boolean;
}

/**
 * TemplateShell wraps every public profile page.
 * It injects the NEX CARD footer badge and a "Create your own" CTA.
 * showBranding can be suppressed for PRO users (future feature).
 */
export function TemplateShell({
  children,
  slug: _slug,
  showBranding = true,
}: TemplateShellProps) {
  return (
    <>
      {/* ── The rendered template ──────────────────────────────────── */}
      {children}

      {/* ── NEX CARD attribution badge ────────────────────────────── */}
      {showBranding && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            href="/?ref=badge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white/70 shadow-xl backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 35 Q8 50 18 65" stroke="#d4af37" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
              <path d="M26 28 Q11 50 26 72" stroke="#f0c050" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M82 35 Q92 50 82 65" stroke="#d4af37" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
              <path d="M74 28 Q89 50 74 72" stroke="#f0c050" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <rect x="30" y="18" width="40" height="64" rx="10" ry="10" stroke="url(#shellGrad)" strokeWidth="5" fill="none"/>
              <defs>
                <linearGradient id="shellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9973a"/>
                  <stop offset="50%" stopColor="#f0c050"/>
                  <stop offset="100%" stopColor="#d4af37"/>
                </linearGradient>
              </defs>
            </svg>
            Made with NEX CARD
          </Link>
        </div>
      )}
    </>
  );
}
