
import type { WeddingInvitationData } from "@/lib/validators/template-schemas";
import { daysUntil, formatShortDate, formatTime } from "@/lib/helps";
import { formatDate } from "@/lib/utils";
import { WeddingRsvpForm, WeddingGuestbookForm } from "@/components/templates/wedding/rsvp-guestbook-forms";

interface WeddingProps { data: WeddingInvitationData; accentColor?: string; slug?: string; }


export function BlossomWedding({ data, accentColor = "#f472b6", slug }: WeddingProps) {
  const { partner1, partner2, weddingDate, headline, loveHistory, events, gallery, rsvp, hashtag, coupleMessage, allowWishes, wishesTitle } = data;
  const days = daysUntil(weddingDate);

  return (
    <main style={{ background: "#fef6f9", color: "#4a1530", fontFamily: "Georgia, serif" }}>

      {/* Decorative petal hero */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Corner botanical elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {["top-0 left-0 scale-100", "top-0 right-0 -scale-x-100", "bottom-0 left-0 -scale-y-100", "bottom-0 right-0 scale-[-1]"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} text-[120px] opacity-[0.07] leading-none`}>{i % 2 === 0 ? "🌸" : "🌺"}</div>
          ))}
        </div>

        <div className="relative z-10">
          {days !== null && (
            <p className="mb-4 text-xs uppercase tracking-[0.4em]" style={{ color: `${accentColor}80` }}>
              {days} days until forever
            </p>
          )}
          <p className="mb-3 text-xs uppercase tracking-[0.4em]" style={{ color: accentColor }}>
            🌸 Wedding Invitation 🌸
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem, 9vw, 5.5rem)", lineHeight: 1.05, color: "#4a1530" }}>
            {partner1.name}
            <span className="block my-2 font-light" style={{ fontSize: "0.4em", color: accentColor }}>and</span>
            {partner2.name}
          </h1>
          {headline && <p className="mt-4 text-xl font-light italic" style={{ color: "#8b3254" }}>{headline}</p>}
          {coupleMessage && (
            <p className="mt-4 mx-auto max-w-md text-sm leading-relaxed" style={{ color: "#8b3254" }}>
              {coupleMessage}
            </p>
          )}
          <p className="mt-5 text-sm uppercase tracking-wider" style={{ color: "#8b3254" }}>
            {formatDate(weddingDate)}
          </p>
          {hashtag && <p className="mt-2 text-sm font-semibold" style={{ color: accentColor }}>#{hashtag}</p>}
        </div>
      </section>

      {/* Portraits */}
      {(partner1.photoUrl || partner2.photoUrl) && (
        <section className="px-6 pb-16 border-b" style={{ borderColor: `${accentColor}20` }}>
          <div className="mx-auto max-w-2xl flex flex-col md:flex-row gap-10 items-center justify-center">
            {[partner1, partner2].map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className="relative h-40 w-40 overflow-hidden border-4"
                  style={{
                    borderRadius: "40% 60% 55% 45% / 45% 40% 60% 55%",
                    borderColor: `${accentColor}40`,
                  }}>
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
                {p.bio && <p className="text-sm max-w-xs leading-relaxed" style={{ color: "#8b3254" }}>{p.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Love story */}
      {loveHistory.length > 0 && (
        <section className="px-6 py-16 border-b" style={{ borderColor: `${accentColor}20` }}>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl mb-10">Our Story 🌸</h2>
            <div className="space-y-8">
              {loveHistory.map((m, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-xl shrink-0 border-2"
                      style={{ background: `${accentColor}15`, borderColor: `${accentColor}30` }}>
                      {m.emoji ?? "💕"}
                    </div>
                    {i < loveHistory.length - 1 && (
                      <div className="flex-1 w-px mt-2" style={{ background: `${accentColor}20` }} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: accentColor }}>{m.date}</p>
                    <h3 className="text-xl mb-2">{m.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#8b3254" }}>{m.story}</p>
                    {m.imageUrl && (
                      <div className="relative aspect-video mt-4 overflow-hidden rounded-2xl border-2"
                        style={{ borderColor: `${accentColor}20` }}>
                        <img src={m.imageUrl} alt={m.title} className="absolute inset-0 h-full w-full object-cover" />
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
        <section className="px-6 py-16 border-b" style={{ borderColor: `${accentColor}20` }}>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl mb-8">Gallery 🌺</h2>
            <div className="columns-2 gap-3 md:columns-3">
              {gallery.slice(0, 9).map((img, i) => (
                <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border-2"
                  style={{ borderColor: `${accentColor}20` }}>
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
      <section className="px-6 py-16 border-b" style={{ borderColor: `${accentColor}20` }}>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl mb-8">The Day 💒</h2>
          <div className="space-y-4">
            {events.map((e, i) => (
              <div key={i} className="rounded-2xl p-6 text-center shadow-sm"
                style={{ background: "rgba(255,255,255,0.8)", border: `2px solid ${accentColor}20` }}>
                <h3 className="text-xl">{e.name}</h3>
                <p className="text-sm mt-1" style={{ color: accentColor }}>
                  {formatDate(e.date)} · {formatTime(e.date)}
                </p>
                <p className="font-semibold text-sm mt-2">{e.venue}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8b3254" }}>{e.address}</p>
                {e.dressCode && <p className="mt-1 text-xs italic" style={{ color: accentColor }}>Attire: {e.dressCode}</p>}
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
              <p className="text-sm mb-4" style={{ color: "#8b3254" }}>
                Please reply by {formatShortDate(rsvp.deadline)}
              </p>
            )}
            {rsvp.formUrl && (
              <a href={rsvp.formUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: accentColor }}>
                RSVP Now
              </a>
            )}
          </div>
        </section>
      )}

      <footer className="border-t px-6 py-8 text-center" style={{ borderColor: `${accentColor}20` }}>
        <p className="text-sm" style={{ color: "#8b3254" }}>🌸 Made with NEX CARD 🌸</p>
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