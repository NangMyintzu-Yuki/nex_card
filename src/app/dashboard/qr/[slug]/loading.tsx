// src/app/dashboard/qr/[slug]/loading.tsx
// Skeleton while the QR management page loads

export default function QRPageLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-neutral-800/60" />
          <div className="h-7 w-56 rounded-xl bg-neutral-800" />
          <div className="h-4 w-40 rounded-lg bg-neutral-800/60" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-xl bg-neutral-800/60" />
          <div className="h-10 w-10 rounded-xl bg-neutral-800/40" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: QR card */}
        <div className="lg:col-span-3 space-y-5">
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
            {/* QR area */}
            <div className="flex items-center justify-center p-10 bg-white/[0.01]">
              <div className="h-[220px] w-[220px] rounded-2xl bg-neutral-800/60" />
            </div>
            {/* URL bar */}
            <div className="border-t border-white/5 px-5 py-4 flex items-center gap-3">
              <div className="h-8 flex-1 rounded-lg bg-neutral-800/50" />
              <div className="h-8 w-20 shrink-0 rounded-lg bg-neutral-800/40" />
            </div>
          </div>
        </div>

        {/* Right: stats + generate */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="border-b border-white/5 px-5 py-4">
              <div className="h-4 w-24 rounded bg-neutral-800" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-800/60" />
                  <div className="h-3 w-20 rounded bg-neutral-800/50" />
                </div>
                <div className="h-5 w-12 rounded bg-neutral-800/60" />
              </div>
            ))}
          </div>

          {/* Lock status */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-800/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-neutral-800" />
                <div className="h-3 w-36 rounded bg-neutral-800/50" />
              </div>
            </div>
          </div>

          {/* Generate card */}
          <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-neutral-800/60" />
            <div className="h-3 w-full rounded bg-neutral-800/40" />
            <div className="h-3 w-4/5 rounded bg-neutral-800/40" />
            <div className="h-12 w-full rounded-xl bg-amber-500/20 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}