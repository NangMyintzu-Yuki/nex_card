import Image from "next/image";
import Link from "next/link";
import type { WeddingInvitationData } from "@/lib/validators/template-schemas";

import { daysUntil, formatEventDateTime, formatShortDate, formatTime, formatWeddingDate } from "@/lib/helps";
import { formatDate } from "@/lib/utils";
interface WeddingProps { data: WeddingInvitationData; accentColor?: string; }


export function NoirWedding({ data, accentColor = "#ffffff" }: WeddingProps) {
  const { partner1, partner2, weddingDate, headline, loveHistory, events, gallery, rsvp, hashtag, coupleMessage } = data;
  const days = daysUntil(weddingDate);

  return (
    <main style={{ background: "#0a0a0a", color: "#e8e0d5", fontFamily: "'Playfair Display', Georgia, serif" }}>

      {/* Film grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.04]" aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }} />

      {/* Cover — full bleed hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {gallery.length > 0 && (
          <div className="absolute inset-0">
            <Image src={gallery[0].url} alt="Cover" fill className="object-cover grayscale opacity-35" sizes="100vw" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.85) 60%, #0a0a0a 100%)" }} />
          </div>
        )}

        <div className="relative z-20 text-center px-6 py-24">
          {days !== null && (
            <p className="mb-5 text-xs uppercase tracking-[0.6em] text-white/30">{days} days</p>
          )}
          <p className="mb-5 text-xs uppercase tracking-[0.6em] text-white/40">A Wedding</p>

          {/* Title card style typography */}
          <div className="mb-3 h-px mx-auto w-24 bg-white/20" />
          <h1 style={{ fontSize: "clamp(3rem, 10vw, 7rem)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", color: "#e8e0d5" }}>
            {partner1.name}
          </h1>
          <p className="my-3 text-xl font-light tracking-[0.2em] text-white/40">&amp;</p>
          <h1 style={{ fontSize: "clamp(3rem, 10vw, 7rem)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", color: "#e8e0d5" }}>
            {partner2.name}
          </h1>
          <div className="mt-3 h-px mx-auto w-24 bg-white/20" />

          {headline && <p className="mt-6 text-lg font-light italic text-white/60">{headline}</p>}
          {coupleMessage && <p className="mt-3 mx-auto max-w-md text-sm leading-relaxed text-white/40">{coupleMessage}</p>}
          <p className="mt-7 text-xs uppercase tracking-[0.5em] text-white/40">{formatDate(weddingDate)}</p>
          {hashtag && <p className="mt-2 text-sm text-white/30">#{hashtag}</p>}
        </div>
      </section>

      {/* Love story — sparse, cinematic */}
      {loveHistory.length > 0 && (
        <section className="px-6 py-20 border-t border-white/5">
          <div className="mx-auto max-w-2xl">
            <p className="mb-12 text-center text-xs uppercase tracking-[0.6em] text-white/25">Our Story</p>
            <div className="space-y-14">
              {loveHistory.map((m, i) => (
                <div key={i} className={`grid gap-8 ${m.imageUrl ? "md:grid-cols-2" : ""} items-start`}>
                  <div className={i % 2 !== 0 && m.imageUrl ? "md:order-2" : ""}>
                    <p className="text-xs text-white/25 mb-2 uppercase tracking-wider">{m.date}</p>
                    <h3 className="text-2xl mb-2 font-normal">{m.title}</h3>
                    <p className="text-sm leading-relaxed text-white/50">{m.story}</p>
                    {m.location && <p className="mt-1 text-xs text-white/25">{m.location}</p>}
                  </div>
                  {m.imageUrl && (
                    <div className={`relative aspect-[4/3] overflow-hidden ${i % 2 !== 0 ? "md:order-1" : ""}`}>
                      <Image src={m.imageUrl} alt={m.title} fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="400px" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery — grayscale grid */}
      {gallery.length > 1 && (
        <section className="border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-center text-xs uppercase tracking-[0.6em] text-white/25">Gallery</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {gallery.slice(1, 10).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden">
                  <Image src={img.url} alt={img.alt} fill
                    className="object-cover grayscale hover:grayscale-0 hover:scale-105 transition-all duration-700" sizes="300px" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="mb-10 text-center text-xs uppercase tracking-[0.6em] text-white/25">The Ceremony</p>
          <div className="space-y-6">
            {events.map((e, i) => (
              <div key={i} className="border border-white/8 p-7 text-center">
                <h3 className="text-2xl font-normal">{e.name}</h3>
                <p className="mt-2 text-sm text-white/40 uppercase tracking-wider">
                  {formatDate(e.date)} · {formatTime(e.date)}
                </p>
                <div className="my-4 h-px mx-auto w-16 bg-white/10" />
                <p className="text-sm text-white/70">{e.venue}</p>
                <p className="text-xs text-white/35 mt-0.5">{e.address}</p>
                {e.dressCode && <p className="mt-2 text-xs italic text-white/30">Attire: {e.dressCode}</p>}
                {e.googleMapsUrl && (
                  <a href={e.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs uppercase tracking-wider underline text-white/30 hover:text-white/60 transition-colors">
                    Directions ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {rsvp && (
        <section className="border-t border-white/5 px-6 py-20 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.6em] text-white/25">RSVP</p>
          {rsvp.deadline && (
            <p className="mb-4 text-sm text-white/35">Please respond by {formatShortDate(rsvp.deadline)}</p>
          )}
          {rsvp.formUrl && (
            <a href={rsvp.formUrl} target="_blank" rel="noopener noreferrer"
              className="inline-block border border-white/20 px-8 py-3 text-sm uppercase tracking-widest text-white/60 hover:border-white/40 hover:text-white transition-all">
              Confirm Attendance
            </a>
          )}
        </section>
      )}

      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <p className="text-xs text-white/15 uppercase tracking-widest">NEX CARD</p>
      </footer>
    </main>
  );
}