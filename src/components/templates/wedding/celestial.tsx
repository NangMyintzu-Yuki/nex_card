import Image from "next/image";
import Link from "next/link";
import type { WeddingInvitationData } from "@/lib/validators/template-schemas";
import { daysUntil, formatEventDateTime, formatShortDate, formatTime, formatWeddingDate } from "@/lib/helps";
import { formatDate } from "@/lib/utils";

interface WeddingProps { data: WeddingInvitationData; accentColor?: string; }

export function CelestialWedding({ data, accentColor = "#a78bfa" }: WeddingProps) {
  const { partner1, partner2, weddingDate, headline, loveHistory, events, gallery, rsvp, hashtag, coupleMessage } = data;
  const days = daysUntil(weddingDate);

  // Generate deterministic star positions
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: ((i * 137.508) % 100).toFixed(2),
    y: ((i * 97.3) % 100).toFixed(2),
    r: (((i * 0.7) % 1.5) + 0.5).toFixed(1),
    o: (((i * 0.13) % 0.7) + 0.2).toFixed(2),
  }));

  return (
    <main style={{ background: "linear-gradient(160deg, #030014 0%, #07002a 50%, #020010 100%)", color: "#e2d9f3", fontFamily: "Georgia, serif" }}>

      {/* Star field SVG — fixed background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          {stars.map((s, i) => (
            <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o} />
          ))}
        </svg>
      </div>

      {/* Nebula glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[100px] opacity-15"
          style={{ background: accentColor }} />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[80px] opacity-10"
          style={{ background: "#06b6d4" }} />
        <div className="absolute top-3/4 left-1/2 h-48 w-48 rounded-full blur-[60px] opacity-8"
          style={{ background: "#f472b6" }} />
      </div>

      {/* Cover */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center px-6 py-24">
        {days !== null && (
          <p className="mb-5 text-xs uppercase tracking-[0.5em] text-white/30">{days} days until forever</p>
        )}

        {/* Constellation decoration */}
        <div className="mb-6 flex items-center gap-3 text-white/20">
          <span>✦</span>
          <div className="h-px w-12 bg-white/20" />
          <span style={{ color: accentColor }}>✦</span>
          <div className="h-px w-12 bg-white/20" />
          <span>✦</span>
        </div>

        <p className="mb-3 text-xs uppercase tracking-[0.5em]" style={{ color: accentColor }}>Under the Stars</p>
        <h1 style={{ fontSize: "clamp(2.5rem, 9vw, 5.5rem)", fontWeight: 400, lineHeight: 1.05 }}>
          {partner1.name}
          <span className="block my-3 font-light" style={{ fontSize: "0.4em", color: accentColor }}>✦ &amp; ✦</span>
          {partner2.name}
        </h1>

        {headline && <p className="mt-5 text-xl font-light italic text-white/65">{headline}</p>}
        {coupleMessage && <p className="mt-3 mx-auto max-w-md text-sm leading-relaxed text-white/45">{coupleMessage}</p>}

        <p className="mt-6 text-sm text-white/40 uppercase tracking-[0.3em]">{formatDate(weddingDate)}</p>
        {hashtag && <p className="mt-2 text-sm" style={{ color: accentColor }}>#{hashtag}</p>}

        <div className="mt-8 flex items-center gap-3 text-white/20">
          <div className="h-px w-12 bg-white/15" />
          <span style={{ color: `${accentColor}60` }}>✦</span>
          <div className="h-px w-12 bg-white/15" />
        </div>
      </section>

      {/* Portraits */}
      {(partner1.photoUrl || partner2.photoUrl) && (
        <section className="relative z-10 border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-3xl flex flex-col md:flex-row gap-10 items-center justify-center">
            {[partner1, partner2].map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative h-44 w-44 overflow-hidden rounded-full mb-4"
                  style={{ border: `2px solid ${accentColor}40`, boxShadow: `0 0 30px ${accentColor}20` }}>
                  {p.photoUrl ? (
                    <Image src={p.photoUrl} alt={p.name} fill className="object-cover" sizes="176px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl"
                      style={{ background: `${accentColor}15` }}>
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 style={{ fontSize: "1.5rem" }}>{p.name}</h2>
                {p.nickname && <p className="italic text-sm" style={{ color: accentColor }}>&ldquo;{p.nickname}&rdquo;</p>}
                {p.bio && <p className="mt-2 text-sm max-w-xs leading-relaxed text-white/50">{p.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Love story — constellation timeline */}
      {loveHistory.length > 0 && (
        <section className="relative z-10 border-t border-white/5 px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <p className="mb-12 text-center text-xs uppercase tracking-[0.5em] text-white/25">Our Constellation</p>
            <div className="space-y-10">
              {loveHistory.map((m, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                      style={{ borderColor: accentColor, color: accentColor, background: "rgba(167,139,250,0.1)" }}>
                      ★
                    </div>
                    {i < loveHistory.length - 1 && (
                      <div className="flex-1 w-px mt-2 opacity-15" style={{ background: accentColor }} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-xs mb-1" style={{ color: accentColor }}>{m.date}</p>
                    <h3 className="text-xl mb-1 font-normal">{m.title}</h3>
                    <p className="text-sm leading-relaxed text-white/55">{m.story}</p>
                    {m.location && <p className="mt-1 text-xs text-white/25">{m.location}</p>}
                    {m.imageUrl && (
                      <div className="relative aspect-[4/3] mt-4 overflow-hidden rounded-xl border"
                        style={{ borderColor: `${accentColor}20` }}>
                        <Image src={m.imageUrl} alt={m.title} fill className="object-cover opacity-90" sizes="400px" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="relative z-10 border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-xs uppercase tracking-[0.5em] text-white/25">Gallery 🌙</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {gallery.slice(0, 9).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl border"
                  style={{ borderColor: `${accentColor}15` }}>
                  <Image src={img.url} alt={img.alt} fill
                    className="object-cover opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-500" sizes="300px" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      <section className="relative z-10 border-t border-white/5 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <p className="mb-10 text-center text-xs uppercase tracking-[0.5em] text-white/25">The Ceremony 💫</p>
          <div className="space-y-5">
            {events.map((e, i) => (
              <div key={i} className="rounded-2xl p-6 text-center"
                style={{ border: `1px solid ${accentColor}20`, background: `${accentColor}06` }}>
                <h3 className="text-xl font-normal">{e.name}</h3>
                <p className="text-sm mt-1" style={{ color: accentColor }}>
                  {formatDate(e.date)} · {formatTime(e.date)}
                </p>
                <div className="my-3 h-px mx-auto w-12" style={{ background: `${accentColor}30` }} />
                <p className="text-sm text-white/70">{e.venue}</p>
                <p className="text-xs text-white/35 mt-0.5">{e.address}</p>
                {e.dressCode && <p className="mt-1 text-xs italic" style={{ color: `${accentColor}70` }}>Attire: {e.dressCode}</p>}
                {e.googleMapsUrl && (
                  <a href={e.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs underline" style={{ color: accentColor }}>
                    Directions ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {rsvp && (
        <section className="relative z-10 border-t border-white/5 px-6 py-16 text-center">
          <div className="mx-auto max-w-sm">
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/25">Join Us ✨</p>
            {rsvp.deadline && <p className="mb-4 text-sm text-white/40">Please reply by {formatShortDate(rsvp.deadline)}</p>}
            {rsvp.formUrl && (
              <a href={rsvp.formUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-black transition-all hover:opacity-90"
                style={{ background: accentColor }}>
                RSVP Now
              </a>
            )}
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center">
        <p className="text-xs text-white/15">PresenceCard ✦</p>
      </footer>
    </main>
  );
}
