"use client";

import { useEffect, useRef, useState } from "react";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { useTheme } from "@/lib/theme/theme-context";

type Scene = {
  id: string;
  category: string;
  name: string;
  role: string;
  slug: string;
  phoneBg: string;
};

const SCENES: Scene[] = [
  {
    id: "card",
    category: "Name card",
    name: "NMZ",
    role: "Full Stack Developer",
    slug: "nmz",
    phoneBg: "linear-gradient(180deg, #1a1520 0%, #0c0a10 100%)",
  },
  {
    id: "portfolio",
    category: "Portfolio",
    name: "Maya Chen",
    role: "Creative director",
    slug: "maya-chen",
    phoneBg: "linear-gradient(180deg, #0e1620 0%, #081018 100%)",
  },
  {
    id: "business",
    category: "Business",
    name: "District Studio",
    role: "Yangon · 09:00–18:00",
    slug: "district",
    phoneBg: "linear-gradient(180deg, #12180e 0%, #0a0e08 100%)",
  },
  {
    id: "wedding",
    category: "Wedding",
    name: "Hnin & Ko",
    role: "12 · 12 · 2026",
    slug: "hnin-and-ko",
    phoneBg: "linear-gradient(180deg, #1a1410 0%, #100c0a 100%)",
  },
];

function NfcMark({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="3" fill={color} />
      <path d="M9 14a5 5 0 015-5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 14a5 5 0 01-5 5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 14a7.5 7.5 0 017.5-7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <path d="M21.5 14a7.5 7.5 0 01-7.5 7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function MiniQr({ color }: { color: string }) {
  const cells = [
    1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 0, 1, 1, 0, 1, 0,
    1, 0, 0, 0, 1, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 0, 1, 1, 1,
    0, 1, 0, 1, 1, 1, 0, 0, 1,
    1, 1, 0, 1, 0, 1, 1, 0, 1,
  ];
  return (
    <div className="grid grid-cols-9 gap-[1.5px] p-1" style={{ background: color === "#0f1a2e" ? "#f5f7fb" : "#0a0908" }}>
      {cells.map((on, i) => (
        <div
          key={i}
          className="h-[3px] w-[3px] sm:h-[3.5px] sm:w-[3.5px]"
          style={{ background: on ? color : "transparent" }}
        />
      ))}
    </div>
  );
}

function PhysicalCard({
  scene,
  isDark,
}: {
  scene: Scene;
  isDark: boolean;
}) {
  const foil = isDark ? "#d4af37" : "#1a3a6b";
  const mute = isDark ? "rgba(212,175,55,0.55)" : "rgba(26,58,107,0.55)";
  const face = isDark
    ? "linear-gradient(145deg, #1c1914 0%, #0e0d0b 55%, #16130f 100%)"
    : "linear-gradient(145deg, #ffffff 0%, #f3f6fb 55%, #e8eef6 100%)";

  return (
    <div
      className="nc-float relative aspect-[1.586/1] w-[256px] overflow-hidden rounded-xl sm:w-[320px]"
      style={{
        background: face,
        border: `1px solid ${isDark ? "rgba(212,175,55,0.28)" : "rgba(26,58,107,0.22)"}`,
        boxShadow: isDark
          ? "0 24px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 24px 48px rgba(26,58,107,0.14), inset 0 1px 0 #fff",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-50"
        aria-hidden
      >
        <div
          className="nc-shine"
          style={{
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(212,175,55,0.28), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
          }}
        />
      </div>

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.28em]" style={{ color: foil }}>
              NEX CARD
            </p>
            <p
              className="mt-3 text-lg font-semibold tracking-tight sm:text-xl"
              style={{ color: isDark ? "#f0ece5" : "#0f1a2e" }}
            >
              {scene.name}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: mute }}>
              {scene.role}
            </p>
          </div>
          <div className="relative">
            <span
              className="nc-nfc-ring pointer-events-none absolute -inset-2 rounded-full"
              style={{ border: `1px solid ${foil}` }}
            />
            <span
              className="nc-nfc-ring pointer-events-none absolute -inset-2 rounded-full"
              style={{ border: `1px solid ${foil}`, animationDelay: "1.1s" }}
            />
            <NfcMark color={foil} />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="truncate font-mono text-[10px] tracking-wide" style={{ color: mute }}>
            www.nexcard.wetechmm.com/{scene.slug}
          </p>
          <div className="relative overflow-hidden rounded-[3px]">
            <MiniQr color={foil} />
            <div
              className="nc-scan-line pointer-events-none"
              style={{ background: foil }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhonePreview({
  scene,
  isDark,
}: {
  scene: Scene;
  isDark: boolean;
}) {
  const foil = isDark ? "#d4af37" : "#1a3a6b";
  const screen = isDark ? scene.phoneBg : "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)";
  const ink = isDark ? "#f0ece5" : "#0f1a2e";
  const mute = isDark ? "#a09070" : "#3d5a8a";

  return (
    <div
      className="nc-float-delay relative h-[290px] w-[150px] overflow-hidden rounded-[1.7rem] sm:h-[380px] sm:w-[196px] sm:rounded-[1.85rem]"
      style={{
        background: isDark ? "#0a0a0c" : "#dce3ee",
        border: `2px solid ${isDark ? "#2a2a2e" : "#c5d0e0"}`,
        boxShadow: isDark
          ? "0 28px 60px rgba(0,0,0,0.5)"
          : "0 28px 60px rgba(26,58,107,0.16)",
      }}
    >
      <div className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full" style={{ background: isDark ? "#000" : "#9aabc0" }} />
      <div className="absolute inset-[5px] overflow-hidden rounded-[1.55rem]" style={{ background: screen }}>
        <div className="flex h-full flex-col items-center px-3 pt-7 sm:px-4 sm:pt-8">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold sm:h-14 sm:w-14 sm:text-sm"
            style={{
              background: "var(--nc-brand-grad)",
              color: "var(--nc-brand-text)",
            }}
          >
            {scene.name.includes(" ")
              ? scene.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
              : scene.name.slice(0, 3)}
          </div>
          <p className="mt-3 text-center text-[13px] font-semibold" style={{ color: ink }}>
            {scene.name}
          </p>
          <p className="mt-0.5 text-center text-[10px]" style={{ color: mute }}>
            {scene.role}
          </p>
          <div className="mt-4 w-full space-y-1.5">
            {["Save contact", "WhatsApp", "Instagram"].map((row) => (
              <div
                key={row}
                className="rounded-lg px-2.5 py-1.5 text-[9px] font-medium"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(26,58,107,0.06)",
                  color: mute,
                }}
              >
                {row}
              </div>
            ))}
          </div>
          <div
            className="mt-auto mb-5 rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em]"
            style={{ color: foil, border: `1px solid ${foil}55` }}
          >
            {scene.category}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero3D({
  isLoggedIn,
  preorderMode = false,
}: {
  isLoggedIn: boolean;
  preorderMode?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const [index, setIndex] = useState(0);
  const scene = SCENES[index];
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SCENES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || window.matchMedia("(max-width: 639px)").matches) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 10 });
  };

  return (
    <section className="relative isolate overflow-hidden px-4 pb-6 pt-4 sm:px-6 sm:pb-16 sm:pt-14 md:pb-24 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--nc-border)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-4 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="nc-hero-in">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--nc-brand-2)" }}
          >
            NFC · QR · Link
          </p>

          <h1
            className="mt-3 max-w-[14ch] text-[2.6rem] font-semibold leading-[1.08] tracking-tight sm:mt-5 sm:text-6xl lg:text-[4.25rem]"
            style={{ color: "var(--nc-text)" }}
          >
            <span className="block">Tap the card.</span>
            <span className="mt-1 block" style={{ color: "var(--nc-brand-2)" }}>
              Open your page.
            </span>
          </h1>

          <p
            className="mt-4 max-w-md text-[15px] leading-relaxed sm:mt-6 sm:text-base"
            style={{ color: "var(--nc-text-2)" }}
          >
            One physical card, one URL. Name card, portfolio, business page, or wedding invite — shared by tap, scan, or link.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9">
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="rounded-full px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:px-7"
              style={{
                backgroundImage: "var(--nc-brand-grad)",
                color: "var(--nc-brand-text)",
                boxShadow: "var(--nc-glow)",
              }}
            >
              {isLoggedIn ? "Go to Dashboard" : preorderMode ? "Reserve your card" : "Create your card"}
            </Link>
            <Link
              href="/alex-rivera"
              className="rounded-full border px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}
            >
              View live demo
            </Link>
          </div>

          <ul className="mt-6 flex flex-nowrap gap-1.5 sm:mt-10 sm:flex-wrap sm:gap-2">
            {SCENES.map((s, i) => {
              const active = i === index;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className="whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors sm:px-3.5 sm:py-1.5 sm:text-xs"
                    style={{
                      color: active ? "var(--nc-text)" : "var(--nc-text-3)",
                      background: active ? "var(--nc-bg-card)" : "transparent",
                      border: `1px solid ${active ? "var(--nc-border-brand)" : "var(--nc-border)"}`,
                    }}
                  >
                    {s.category}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          ref={stageRef}
          onMouseMove={onMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="nc-hero-in nc-hero-stage relative mx-auto w-full max-w-[320px] sm:max-w-[400px] lg:mx-0"
          style={{ animationDelay: "0.18s" }}
        >
          <div className="nc-hero-stage-scale">
            <div
              className="relative h-[410px] w-[345px] sm:h-[440px] sm:w-[400px]"
              style={{
                transformStyle: "preserve-3d",
                transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 0.4s ease-out",
              }}
            >
              <div key={scene.id} className="nc-scene-swap relative h-full w-full">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[185px] z-10 sm:bottom-[210px]">
                  <PhysicalCard scene={scene} isDark={isDark} />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] sm:bottom-[-50px] z-20">
                  <PhonePreview scene={scene} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
