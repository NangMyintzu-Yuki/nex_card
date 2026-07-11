// src/app/dashboard/loading.tsx
// Skeleton shown while the dashboard page is loading

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-xl bg-neutral-800" />
          <div className="h-4 w-48 rounded-lg bg-neutral-800/60" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-neutral-800/60" />
      </div>

      {/* Profile cards grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]"
          >
            {/* Thumbnail placeholder */}
            <div className="h-32 w-full bg-neutral-800/50" />

            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                <div className="h-3 w-24 rounded bg-neutral-800/60" />
                <div className="h-5 w-36 rounded-lg bg-neutral-800" />
                <div className="h-3 w-28 rounded bg-neutral-800/50 font-mono" />
              </div>

              <div className="flex gap-2 pt-1">
                <div className="h-9 flex-1 rounded-lg bg-neutral-800/60" />
                <div className="h-9 w-10 rounded-lg bg-neutral-800/60" />
              </div>

              <div className="h-3 w-32 rounded bg-neutral-800/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
