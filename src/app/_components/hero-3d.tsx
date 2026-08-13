"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CARD_VARIANTS = [
  {
    name: "Aurora",
    accent: "#6366f1",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    label: "Digital Name Card",
  },
  {
    name: "Obsidian",
    accent: "#f59e0b",
    bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    label: "Portfolio",
  },
  {
    name: "Vault",
    accent: "#d4af37",
    bg: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
    label: "Business Page",
  },
  {
    name: "Eternal",
    accent: "#c9a96e",
    bg: "linear-gradient(135deg, #c9a96e 0%, #a67c52 100%)",
    label: "Wedding Invitation",
  },
];

const TAGLINES = [
  "Your Digital Identity, Elevated.",
  "Share Who You Are, Instantly.",
  "One Link. Endless Possibilities.",
  "Tap. Scan. Connect.",
];

function CardMockup({ variant, isFlipping }: { variant: typeof CARD_VARIANTS[0]; isFlipping: boolean }) {
  return (
    <motion.div
      className="relative"
      style={{ perspective: "1200px" }}
      animate={{ rotateY: isFlipping ? 180 : 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Phone frame */}
      <div
        className="relative mx-auto h-[380px] w-[260px] overflow-hidden rounded-[2.5rem] border-2 shadow-2xl"
        style={{
          borderColor: "rgba(255,255,255,0.15)",
          boxShadow: `0 25px 80px ${variant.accent}40, 0 0 40px ${variant.accent}20`,
        }}
      >
        {/* Phone notch */}
        <div className="absolute left-1/2 top-0 z-20 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />

        {/* Card content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
          style={{ background: variant.bg }}
        >
          {/* Avatar placeholder */}
          <div className="mb-4 h-20 w-20 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm" />

          {/* Name */}
          <div className="mb-1 h-5 w-32 rounded-full bg-white/25" />
          {/* Job title */}
          <div className="mb-4 h-3 w-24 rounded-full bg-white/15" />

          {/* Divider */}
          <div className="mb-4 h-px w-20 bg-white/20" />

          {/* Social links */}
          <div className="flex gap-3">
            {["#fff", "#fff", "#fff"].map((c, i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm"
              />
            ))}
          </div>

          {/* CTA button */}
          <div className="mt-5 h-9 w-36 rounded-full bg-white/20 backdrop-blur-sm" />
        </div>

        {/* Shine overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
          }}
        />
      </div>

      {/* Reflection */}
      <div
        className="mx-auto mt-3 h-8 w-[200px] rounded-b-3xl opacity-20 blur-sm"
        style={{ background: variant.bg }}
      />
    </motion.div>
  );
}

function FloatingOrb({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-[80px]"
      style={{ left: x, top: y, width: size, height: size, background: color, opacity: 0 }}
      animate={{
        opacity: [0, 0.15, 0],
        scale: [0.8, 1.2, 0.8],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function Hero3D({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Auto-rotate cards
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCardIndex((prev) => (prev + 1) % CARD_VARIANTS.length);
        setIsFlipping(false);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const words = TAGLINES[taglineIndex].split(" ");

  return (
    <section className="relative overflow-hidden px-6 py-20 text-center md:py-32">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <FloatingOrb delay={0} x="10%" y="20%" size={300} color="var(--nc-brand-grad)" />
        <FloatingOrb delay={2} x="70%" y="10%" size={250} color="var(--nc-brand-grad)" />
        <FloatingOrb delay={4} x="50%" y="60%" size={200} color="var(--nc-brand-grad)" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(var(--nc-text) 1px, transparent 1px), linear-gradient(90deg, var(--nc-text) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left — Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{ borderColor: "var(--nc-border-brand)", background: "var(--nc-bg-card)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: "var(--nc-brand-2, #d4af37)" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--nc-brand-2, #d4af37)" }} />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--nc-text-2)" }}>
                20 Premium Templates · QR · NFC
              </span>
            </motion.div>

            {/* Animated headline */}
            <h1 className="text-4xl font-black leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
              style={{ color: "var(--nc-text)" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="block"
                >
                  {words.map((word, i) => (
                    <motion.span
                      key={`${taglineIndex}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="mr-[0.3em] inline-block"
                    >
                      {word === "Identity," || word === "Identity" ? (
                        <span
                          style={{
                            backgroundImage: "var(--nc-brand-grad, linear-gradient(135deg,#d4af37,#f0c050))",
                            backgroundColor: "transparent",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {word}
                        </span>
                      ) : word === "Instantly." || word === "Possibilities." || word === "Connect." ? (
                        <span
                          style={{
                            backgroundImage: "var(--nc-brand-grad, linear-gradient(135deg,#d4af37,#f0c050))",
                            backgroundColor: "transparent",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {word}
                        </span>
                      ) : (
                        word
                      )}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mx-auto mt-6 max-w-lg text-base leading-relaxed lg:mx-0 lg:text-lg"
              style={{ color: "var(--nc-text-2)" }}
            >
              Create stunning digital name cards, portfolios, business pages, and wedding invitations.
              Share instantly via link, QR code, or NFC tap.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="group relative overflow-hidden rounded-2xl px-8 py-4 text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundImage: "var(--nc-brand-grad)",
                  color: "var(--nc-brand-text)",
                  boxShadow: "var(--nc-glow)",
                }}
              >
                <span className="relative z-10">
                  {isLoggedIn ? "Go to Dashboard →" : "Create Your Card →"}
                </span>
                <div
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)" }}
                />
              </Link>
              <Link
                href="/alex-rivera"
                className="flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold transition-all hover:opacity-80"
                style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}
              >
                View Live Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:justify-start"
            >
              {[
                ["20+", "Templates"],
                ["QR", "Code Ready"],
                ["NFC", "Tag Support"],
                ["∞", "Customizable"],
              ].map(([v, l], i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  className="text-center"
                >
                  <p
                    className="text-2xl font-black"
                    style={{
                      backgroundImage: "var(--nc-brand-grad)",
                      backgroundColor: "transparent",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {v}
                  </p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                    {l}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D Card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="flex-1"
          >
            <CardMockup variant={CARD_VARIANTS[cardIndex]} isFlipping={isFlipping} />

            {/* Card indicator dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {CARD_VARIANTS.map((v, i) => (
                <button
                  key={v.name}
                  onClick={() => {
                    if (i !== cardIndex) {
                      setIsFlipping(true);
                      setTimeout(() => {
                        setCardIndex(i);
                        setIsFlipping(false);
                      }, 400);
                    }
                  }}
                  className="group relative h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === cardIndex ? 32 : 10,
                    background: i === cardIndex ? v.accent : "var(--nc-text-3)",
                    opacity: i === cardIndex ? 1 : 0.4,
                  }}
                  aria-label={`Show ${v.name} template`}
                >
                  {i === cardIndex && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute inset-0 rounded-full"
                      style={{ background: v.accent, opacity: 0.3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Current template label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={cardIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-3 text-center text-sm font-semibold"
                style={{ color: "var(--nc-text-2)" }}
              >
                {CARD_VARIANTS[cardIndex].label} —{" "}
                <span style={{ color: CARD_VARIANTS[cardIndex].accent }}>
                  {CARD_VARIANTS[cardIndex].name}
                </span>
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
