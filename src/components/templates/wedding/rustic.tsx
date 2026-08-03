
import Link from "next/link";
import type { WeddingInvitationData } from "@/lib/validators/template-schemas";
import { daysUntil, formatEventDateTime, formatShortDate, formatTime, formatWeddingDate } from "@/lib/helps";
import { formatDate } from "@/lib/utils";
import { WeddingRsvpForm, WeddingGuestbookForm } from "@/components/templates/wedding/rsvp-guestbook-forms";

interface WeddingProps { data: WeddingInvitationData; accentColor?: string; slug?: string; }



export function RusticWedding({ data, accentColor = "#65a30d", slug }: WeddingProps) {
  const { partner1, partner2, weddingDate, headline, loveHistory, events, gallery, rsvp, hashtag, coupleMessage, allowWishes, wishesTitle } = data;
  const days = daysUntil(weddingDate);

  return (
    <main style={{ background: "#faf6f0", color: "#2c1a0e", fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Cover — botanical frame */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 border-b-2 border-dashed" style={{ borderColor: "#c9a96e" }}>
        {/* Botanical corner decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute top-0 left-0 text-[100px] opacity-[0.06] leading-none">🌿</div>
          <div className="absolute top-0 right-0 text-[100px] opacity-[0.06] leading-none" style={{ transform: "scaleX(-1)" }}>🌿</div>
          <div className="absolute bottom-0 left-0 text-[80px] opacity-[0.06] leading-none" style={{ transform: "scale(1,-1)" }}>🌿</div>
          <div className="absolute bottom-0 right-0 text-[80px] opacity-[0.06] leading-none" style={{ transform: "scale(-1,-1)" }}>🌿</div>
          <div className="absolute top-16 left-16 text-[60px] opacity-[0.05]">🌾</div>
          <div className="absolute top-16 right-16 text-[60px] opacity-[0.05]" style={{ transform: "scaleX(-1)" }}>🌾</div>
        </div>

        <div className="relative z-10">
          {/* Double border frame */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "#c9a96e" }} />
            <span className="text-xl" style={{ color: "#c9a96e" }}>✦</span>
            <div className="h-px flex-1" style={{ background: "#c9a96e" }} />
          </div>

          {days !== null && (
            <p className="mb-3 text-xs uppercase tracking-[0.4em]" style={{ color: `${accentColor}80` }}>
              {days} days to celebrate
            </p>
          )}

          <p className="mb-3 text-xs uppercase tracking-[0.4em]" style={{ color: accentColor }}>
            🌿 Rustic Wedding 🌿
          </p>

          <h1 style={{ fontSize: "clamp(2.5rem, 9vw, 5rem)", lineHeight: 1.05 }}>
            {partner1.name}
            <span className="block my-2 font-light" style={{ fontSize: "0.4em", color: accentColor }}>&amp;</span>
            {partner2.name}
          </h1>

          {headline && <p className="mt-4 text-xl font-light italic" style={{ color: "#7a5c3a" }}>{headline}</p>}
          {coupleMessage && <p className="mt-3 mx-auto max-w-md text-sm leading-relaxed" style={{ color: "#7a5c3a" }}>{coupleMessage}</p>}

          <p className="mt-5 text-sm uppercase tracking-wider" style={{ color: "#7a5c3a" }}>
            {formatDate(weddingDate)}
          </p>
          {hashtag && <p className="mt-2 text-sm font-semibold" style={{ color: accentColor }}>#{hashtag}</p>}

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "#c9a96e" }} />
            <span style={{ color: "#c9a96e" }}>✦</span>
            <div className="h-px flex-1" style={{ background: "#c9a96e" }} />
          </div>
        </div>
      </section>

      {/* Portraits */}
      {(partner1.photoUrl || partner2.photoUrl) && (
        <section className="px-6 py-16 border-b-2 border-dashed" style={{ borderColor: "#c9a96e" }}>
          <div className="mx-auto max-w-2xl flex flex-col md:flex-row gap-10 items-center justify-center">
            {[partner1, partner2].map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative mb-4 h-40 w-40 overflow-hidden border-4"
                  style={{ borderRadius: "50% 50% 45% 55% / 55% 45% 55% 45%", borderColor: "#c9a96e80" }}>
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl"
                      style={{ background: `${accentColor}15` }}>
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 style={{ fontSize: "1.4rem" }}>{p.name}</h2>
                {p.nickname && <p className="italic text-sm" style={{ color: accentColor }}>&ldquo;{p.nickname}&rdquo;</p>}
                {p.bio && <p className="mt-2 text-sm max-w-xs leading-relaxed" style={{ color: "#7a5c3a" }}>{p.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Love story */}
      {loveHistory.length > 0 && (
        <section className="px-6 py-16 border-b-2 border-dashed" style={{ borderColor: "#c9a96e" }}>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl mb-10">Our Journey 🌱</h2>
            <div className="space-y-6">
              {loveHistory.map((m, i) => (
                <div key={i} className="rounded-2xl p-5"
                  style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)" }}>
                  <p className="text-xs mb-1 font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                    {m.emoji ?? "🌿"} {m.date}
                  </p>
                  <h3 className="text-lg mb-1">{m.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#7a5c3a" }}>{m.story}</p>
                  {m.location && <p className="mt-1 text-xs" style={{ color: "#a08060" }}>📍 {m.location}</p>}
                  {m.imageUrl && (
                    <div className="relative aspect-video mt-3 overflow-hidden rounded-xl">
                      <img src={m.imageUrl} alt={m.title} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="px-6 py-16 border-b-2 border-dashed" style={{ borderColor: "#c9a96e" }}>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl mb-8">Gallery 🌾</h2>
            <div className="columns-2 gap-3 md:columns-3">
              {gallery.slice(0, 9).map((img, i) => (
                <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl border-2 border-dashed"
                  style={{ borderColor: "#c9a96e40" }}>
                  <div className="relative aspect-square">
                    <img src={img.url} alt={img.alt} className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      <section className="px-6 py-16 border-b-2 border-dashed" style={{ borderColor: "#c9a96e" }}>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl mb-8">The Celebration 🎊</h2>
          <div className="space-y-4">
            {events.map((e, i) => (
              <div key={i} className="p-6 text-center" style={{ border: "2px dashed #c9a96e60", borderRadius: "16px" }}>
                <h3 className="text-xl">{e.name}</h3>
                <p className="text-sm mt-1" style={{ color: accentColor }}>
                  {formatDate(e.date)} · {formatTime(e.date)}
                </p>
                <div className="my-3 h-px" style={{ background: "#c9a96e25" }} />
                <p className="font-semibold text-sm">{e.venue}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7a5c3a" }}>{e.address}</p>
                {e.dressCode && <p className="mt-1 text-xs italic" style={{ color: accentColor }}>Attire: {e.dressCode}</p>}
                {e.notes && <p className="mt-1 text-xs" style={{ color: "#a08060" }}>{e.notes}</p>}
                {e.googleMapsUrl && (
                  <a href={e.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs underline" style={{ color: accentColor }}>
                    Get Directions ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {rsvp && (
        <section className="px-6 py-16 text-center">
          <div className="mx-auto max-w-sm">
            <h2 className="text-3xl mb-4">RSVP 💌</h2>
            {rsvp.deadline && (
              <p className="text-sm mb-4" style={{ color: "#7a5c3a" }}>
                Please reply by {formatShortDate(rsvp.deadline)}
              </p>
            )}
            {rsvp.note && <p className="text-sm italic mb-4" style={{ color: "#a08060" }}>{rsvp.note}</p>}
            {rsvp.formUrl && (
              <a href={rsvp.formUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: accentColor }}>
                RSVP
              </a>
            )}
            <div className="mt-4 flex flex-col gap-1 items-center">
              {rsvp.contactEmail && (
                <a href={`mailto:${rsvp.contactEmail}`} className="text-xs underline" style={{ color: accentColor }}>
                  {rsvp.contactEmail}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t-2 border-dashed px-6 py-8 text-center" style={{ borderColor: "#c9a96e" }}>
        <p className="text-sm" style={{ color: "#a08060" }}>🌿 Made with NEX CARD 🌿</p>
      </footer>
    
      {slug && (
        <section className="px-6 py-16 text-center">
          <WeddingRsvpForm slug={slug} accentColor={accentColor} />
          {allowWishes !== false && (
            <WeddingGuestbookForm slug={slug} accentColor={accentColor} title={wishesTitle ?? "Leave a wish"} />
          )}
        </section>
      )}
    </main>
  );
}
