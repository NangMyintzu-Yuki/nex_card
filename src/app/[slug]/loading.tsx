// src/app/[slug]/loading.tsx
// Shown by Next.js while the public profile page is streaming in

export default function ProfileLoading() {
  return (
    <div className="min-h-screen w-full animate-pulse bg-neutral-950 flex flex-col items-center justify-center gap-5 px-4">
      {/* Avatar */}
      <div className="h-28 w-28 rounded-2xl bg-neutral-800" />

      {/* Name */}
      <div className="h-7 w-52 rounded-xl bg-neutral-800" />

      {/* Job title */}
      <div className="h-4 w-36 rounded-lg bg-neutral-800/70" />

      {/* Company */}
      <div className="h-3 w-24 rounded-lg bg-neutral-800/50" />

      {/* Divider */}
      <div className="h-px w-64 bg-neutral-800/40 mt-2" />

      {/* Bio lines */}
      <div className="space-y-2 w-72">
        <div className="h-3 w-full rounded bg-neutral-800/50" />
        <div className="h-3 w-4/5 rounded bg-neutral-800/50 mx-auto" />
        <div className="h-3 w-3/5 rounded bg-neutral-800/50 mx-auto" />
      </div>

      {/* Contact rows */}
      <div className="w-72 space-y-2 mt-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-800/60 px-4 py-2.5">
            <div className="h-8 w-8 rounded-lg bg-neutral-800/80 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-16 rounded bg-neutral-800/80" />
              <div className="h-3 w-36 rounded bg-neutral-800/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Social icons */}
      <div className="flex gap-2.5 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-10 rounded-xl bg-neutral-800/70" />
        ))}
      </div>

      {/* CTA button */}
      <div className="h-11 w-64 rounded-xl bg-neutral-800/60 mt-2" />
    </div>
  );
}
