// tailwind.config.ts
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      // ── Fonts ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", "Fira Code", ...defaultTheme.fontFamily.mono],
      },

      // ── Extended color palette ────────────────────────────────────────
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },

      // ── Background gradients ──────────────────────────────────────────
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh":
          "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f1a 100%)",
      },

      // ── Animations ────────────────────────────────────────────────────
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
        marquee: "marquee 20s linear infinite",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
      },

      // ── Border radius ─────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Box shadows ───────────────────────────────────────────────────
      boxShadow: {
        "glass":
          "0 4px 24px -1px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        "glass-lg":
          "0 8px 40px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.08)",
        "glow-indigo":
          "0 0 20px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.15)",
        "glow-cyan":
          "0 0 20px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.15)",
        "inner-white":
          "inset 0 1px 0 rgba(255,255,255,0.06)",
      },

      // ── Backdrop blur presets ─────────────────────────────────────────
      backdropBlur: {
        xs: "4px",
      },

      // ── Typography scale ──────────────────────────────────────────────
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },

      // ── Spacing ───────────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // ── Z-index ───────────────────────────────────────────────────────
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },

      // ── Transition ────────────────────────────────────────────────────
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [],
};

export default config;
