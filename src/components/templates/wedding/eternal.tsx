// src/components/templates/wedding/eternal.tsx
// ALL 5 WEDDING INVITATION TEMPLATES — World-class redesigns
// Research basis: Riley & Grey, Zola, Joy, Minted, The Knot premium pages 2025
// Noir: Film-grain cinematic B&W (Kubrick/Wong Kar-wai inspired)
// Celestial: Deep cosmos with real CSS star particles
// Rustic: Botanical warmth with decorative frame elements


import type { WeddingInvitationData } from "@/lib/validators/template-schemas";
import { daysUntil, formatShortDate, formatTime } from "@/lib/helps";
import { formatDate } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { WeddingRsvpForm, WeddingGuestbookForm } from "@/components/templates/wedding/rsvp-guestbook-forms";

interface WeddingProps { data: WeddingInvitationData; accentColor?: string; slug?: string; }

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// ETERNAL — Timeless serif gold, full love-story timeline, Riley & Grey inspired
// ─────────────────────────────────────────────────────────────────────────────

export function EternalWedding({ data, accentColor = "#c9a96e", slug }: WeddingProps) {
  const {
    partner1, partner2, weddingDate, headline, coupleMessage,
    loveHistory, events, gallery, rsvp, hashtag,
    giftRegistry, allowWishes, wishesTitle, songTitle, songArtist, spotifyUrl,
    colorPalette,
  } = data;

  const bg   = colorPalette?.[0] ?? "#fdf8f1";
  const gold = accentColor;
  const days = daysUntil(weddingDate);

  return (
    <main style={{ background: bg, color: "#2d1e0f", fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── Cover ──────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {gallery.length > 0 && (
          <div className="absolute inset-0">
            <img src={resolveImageUrl(gallery[0].url)} alt="Cover" className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${bg}30 0%, ${bg}95 60%, ${bg} 100%)` }} />
          </div>
        )}

        {/* Decorative ornament */}
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: `${gold}60` }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill={gold} opacity="0.6">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <div className="h-px w-16" style={{ background: `${gold}60` }} />
          </div>

          {days !== null && (
            <p className="mb-4 text-xs uppercase tracking-[0.5em]" style={{ color: `${gold}80` }}>
              {days} days to go
            </p>
          )}

          <p className="mb-3 text-xs uppercase tracking-[0.5em]" style={{ color: `${gold}90` }}>
            Together Forever
          </p>

          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 1.1, color: "#2d1e0f" }}>
            {partner1.name}
            <span className="block my-2 font-light" style={{ fontSize: "0.45em", color: gold }}>&amp;</span>
            {partner2.name}
          </h1>

          {headline && (
            <p className="mt-4 text-xl font-light italic" style={{ color: "#7a5c3a" }}>{headline}</p>
          )}

          <p className="mt-5 text-sm uppercase tracking-[0.3em]" style={{ color: "#7a5c3a" }}>
            {formatDate(weddingDate)}
          </p>

          {coupleMessage && (
            <p className="mt-6 mx-auto max-w-md text-base leading-relaxed italic" style={{ color: "#7a5c3a" }}>
              &ldquo;{coupleMessage}&rdquo;
            </p>
          )}

          {hashtag && (
            <p className="mt-4 text-sm font-semibold" style={{ color: gold }}>#{hashtag}</p>
          )}

          {songTitle && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs" style={{ color: "#a08060" }}>
              <span>♪</span>
              <span>{songTitle}{songArtist ? ` · ${songArtist}` : ""}</span>
              {spotifyUrl && (
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer"
                  className="underline transition-opacity hover:opacity-70">Listen</a>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ background: `${gold}40` }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill={gold} opacity="0.5">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
            <div className="h-px w-16" style={{ background: `${gold}40` }} />
          </div>
        </div>
      </section>

      {/* ── Portraits ─────────────────────────────────────────────── */}
      {(partner1.photoUrl || partner2.photoUrl) && (
        <section className="px-6 py-16 border-y" style={{ borderColor: `${gold}20` }}>
          <div className="mx-auto max-w-3xl flex flex-col md:flex-row gap-12 items-center justify-center">
            {[partner1, partner2].map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center max-w-xs">
                {p.photoUrl ? (
                  <div className="relative mb-4 h-44 w-44 overflow-hidden rounded-full border-4"
                    style={{ borderColor: `${gold}50`, boxShadow: `0 0 40px ${gold}20` }}>
                       <img src={resolveImageUrl(p.photoUrl)} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="mb-4 flex h-44 w-44 items-center justify-center rounded-full border-4 text-5xl"
                    style={{ borderColor: `${gold}40`, background: `${gold}10`, color: gold }}>
                    {p.name.charAt(0)}
                  </div>
                )}
                <h2 style={{ fontSize: "1.5rem", color: "#2d1e0f" }}>{p.name}</h2>
                {p.nickname && <p className="italic" style={{ color: gold }}>&ldquo;{p.nickname}&rdquo;</p>}
                {p.bio && <p className="mt-2 text-sm leading-relaxed" style={{ color: "#7a5c3a" }}>{p.bio}</p>}
                {p.instagramUrl && (
                  <a href={p.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-2 text-xs underline" style={{ color: gold }}>Instagram</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Love story timeline ───────────────────────────────────── */}
      {loveHistory.length > 0 && (
        <section className="px-6 py-20 border-b" style={{ borderColor: `${gold}15` }}>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px flex-1" style={{ background: `${gold}30` }} />
              <p className="text-xs uppercase tracking-[0.5em]" style={{ color: gold }}>Our Story</p>
              <div className="h-px flex-1" style={{ background: `${gold}30` }} />
            </div>

            <div className="relative">
              {/* Centre line */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 hidden md:block"
                style={{ background: `${gold}20` }} />

              <div className="space-y-14">
                {loveHistory.map((m, i) => (
                  <div key={i} className={`flex flex-col gap-5 md:flex-row ${i % 2 !== 0 ? "md:flex-row-reverse" : ""} items-start md:items-center`}>
                    {/* Text side */}
                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: gold }}>{m.date}</p>
                      <h3 className="text-xl mb-2">{m.emoji && `${m.emoji} `}{m.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#7a5c3a" }}>{m.story}</p>
                      {m.location && <p className="mt-1 text-xs" style={{ color: `${gold}80` }}>📍 {m.location}</p>}
                    </div>

                    {/* Centre dot */}
                    <div className="hidden md:flex h-5 w-5 shrink-0 items-center justify-center rounded-full z-10"
                      style={{ background: bg, border: `2px solid ${gold}`, boxShadow: `0 0 0 6px ${bg}, 0 0 0 7px ${gold}20` }}>
                      <div className="h-2 w-2 rounded-full" style={{ background: gold }} />
                    </div>

                    {/* Image side */}
                    <div className="flex-1">
                      {m.imageUrl && (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg"
                          style={{ border: `1px solid ${gold}25` }}>
                           <img src={resolveImageUrl(m.imageUrl)} alt={m.title} className="absolute inset-0 h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ───────────────────────────────────────────────── */}
      {gallery.length > 1 && (
        <section className="px-6 py-16 border-b" style={{ borderColor: `${gold}15` }}>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px flex-1" style={{ background: `${gold}25` }} />
              <p className="text-xs uppercase tracking-[0.5em]" style={{ color: gold }}>Gallery</p>
              <div className="h-px flex-1" style={{ background: `${gold}25` }} />
            </div>
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
              {gallery.slice(0, 12).map((img, i) => (
                <div key={i} className="mb-3 break-inside-avoid overflow-hidden rounded-xl shadow-sm">
                  <div className="relative aspect-square">
                     <img src={resolveImageUrl(img.url)} alt={img.alt}
                      className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  {img.caption && (
                    <p className="py-1.5 text-center text-xs italic px-2" style={{ color: "#a08060" }}>{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Events ────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-b" style={{ borderColor: `${gold}15`, background: `${gold}06` }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px flex-1" style={{ background: `${gold}30` }} />
            <p className="text-xs uppercase tracking-[0.5em]" style={{ color: gold }}>The Events</p>
            <div className="h-px flex-1" style={{ background: `${gold}30` }} />
          </div>
          <div className="space-y-5">
            {events.map((event, i) => (
              <div key={i} className="text-center rounded-2xl p-7 shadow-sm"
                style={{ background: "rgba(255,255,255,0.75)", border: `1px solid ${gold}25` }}>
                <h3 className="text-2xl mb-1">{event.name}</h3>
                <p className="text-sm uppercase tracking-wider mt-1" style={{ color: gold }}>
                  {formatDate(event.date)} · {formatTime(event.date)}
                </p>
                <div className="my-4 h-px" style={{ background: `${gold}20` }} />
                <p className="font-semibold text-sm">{event.venue}</p>
                <p className="text-sm mt-0.5" style={{ color: "#7a5c3a" }}>{event.address}</p>
                {event.dressCode && (
                  <p className="mt-2 text-xs italic" style={{ color: gold }}>Attire: {event.dressCode}</p>
                )}
                {event.notes && <p className="mt-1 text-xs" style={{ color: "#a08060" }}>{event.notes}</p>}
                {event.googleMapsUrl && (
                  <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs underline" style={{ color: gold }}>
                    View on Google Maps ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RSVP ──────────────────────────────────────────────────── */}
      {rsvp && (
        <section className="px-6 py-20 border-b text-center" style={{ borderColor: `${gold}15` }}>
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ background: `${gold}30` }} />
              <p className="text-xs uppercase tracking-[0.5em]" style={{ color: gold }}>RSVP</p>
              <div className="h-px flex-1" style={{ background: `${gold}30` }} />
            </div>
            {rsvp.deadline && (
              <p className="text-sm mb-4" style={{ color: "#7a5c3a" }}>
                Kindly reply by {formatShortDate(rsvp.deadline)}
              </p>
            )}
            {rsvp.note && (
              <p className="text-sm italic mb-5" style={{ color: "#a08060" }}>{rsvp.note}</p>
            )}
            {rsvp.formUrl && (
              <a href={rsvp.formUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: gold }}>
                RSVP Now
              </a>
            )}
            <div className="mt-4 flex flex-col gap-1 items-center">
              {rsvp.contactEmail && (
                <a href={`mailto:${rsvp.contactEmail}`} className="text-sm underline" style={{ color: gold }}>
                  {rsvp.contactEmail}
                </a>
              )}
              {rsvp.contactPhone && (
                <a href={`tel:${rsvp.contactPhone}`} className="text-sm" style={{ color: "#7a5c3a" }}>
                  {rsvp.contactPhone}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Gift registry ─────────────────────────────────────────── */}
      {giftRegistry && giftRegistry.length > 0 && (
        <section className="px-6 py-12 text-center border-b" style={{ borderColor: `${gold}15` }}>
          <div className="mx-auto max-w-md">
            <p className="mb-4 text-xs uppercase tracking-[0.5em]" style={{ color: gold }}>Gift Registry</p>
            <div className="flex flex-wrap justify-center gap-3">
              {giftRegistry.map((g, i) => (
                <a key={i} href={g.url} target="_blank" rel="noopener noreferrer"
                  className="rounded-full border px-5 py-2 text-sm transition-all hover:opacity-70"
                  style={{ borderColor: `${gold}40`, color: "#7a5c3a" }}>
                  {g.store}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Wishes ────────────────────────────────────────────────── */}
      {allowWishes && (
        <section className="px-6 py-12 text-center border-b" style={{ borderColor: `${gold}15`, background: `${gold}06` }}>
          <div className="mx-auto max-w-md">
            <p className="text-2xl mb-2">{wishesTitle ?? "Leave Us a Wish"}</p>
            <p className="text-sm mb-5" style={{ color: "#7a5c3a" }}>Your kind words mean the world to us.</p>
            <a href="#wishes" className="inline-block rounded-full border px-6 py-2.5 text-sm transition-all hover:opacity-70"
              style={{ borderColor: `${gold}40`, color: "#7a5c3a" }}>
              Write a Wish ✍️
            </a>
          </div>
        </section>
      )}

      <footer className="px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12" style={{ background: `${gold}30` }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill={gold} opacity="0.4">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
          </svg>
          <div className="h-px w-12" style={{ background: `${gold}30` }} />
        </div>
        <p className="text-sm" style={{ color: "#7a5c3a" }}>{partner1.name} &amp; {partner2.name}</p>
        {hashtag && <p className="mt-1 text-xs" style={{ color: gold }}>#{hashtag}</p>}
        <p className="mt-8 text-xs" style={{ color: `${gold}30` }}>Made with NEX CARD</p>
      </footer>
    
      {slug && (
        <section className="px-6 py-16 text-center">
          <WeddingRsvpForm slug={slug} accentColor={gold} />
          {allowWishes !== false && (
            <WeddingGuestbookForm slug={slug} accentColor={gold} title={wishesTitle ?? "Leave a wish"} />
          )}
        </section>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOSSOM — Soft floral pastel, organic botanical shapes, spring romance
// Research: Minted botanical collections, Joy floral themes
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// NOIR — Cinematic B&W, film grain texture, Wong Kar-wai / Kubrick inspired
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// CELESTIAL — Deep cosmos, real CSS star-particle field, astronomy-meets-romance
// Research: NASA web aesthetic + The Knot celestial collections + Zola cosmic themes
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// RUSTIC — Botanical warmth, earth tones, boho outdoor ceremony
// Research: Junebug Weddings, Green Wedding Shoes, bohemian wedding sites
// ─────────────────────────────────────────────────────────────────────────────

