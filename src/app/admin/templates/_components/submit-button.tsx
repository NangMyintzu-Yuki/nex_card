// src/app/admin/templates/_components/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "rgba(212,175,55,0.3)", borderTopColor: "#d4af37" }} />
            <span className="text-sm font-medium" style={{ color: "#d4af37" }}>Saving...</span>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`transition-opacity disabled:opacity-50 ${className}`}
        style={style}
      >
        {children}
      </button>
    </>
  );
}
