"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-center">
      <p className="text-sm" style={{ color: "var(--nc-text-3)" }}>
        Something went wrong loading analytics.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90"
        style={{ color: "var(--nc-text)", background: "var(--nc-bg-card)", border: "1px solid var(--nc-border)" }}
      >
        Try again
      </button>
    </div>
  );
}
