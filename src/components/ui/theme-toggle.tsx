// src/components/ui/theme-toggle.tsx
// Theme toggle — Light (navy/sun) ↔ Dark (gold/moon)

"use client";

import { useTheme } from "@/lib/theme/theme-context";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ size = "md", showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme !== "light";

  const sizes = {
    sm: { pill: "h-9 w-16", dot: "h-7 w-7", icon: 16, label: "text-xs" },
    md: { pill: "h-10 w-[4.25rem]", dot: "h-8 w-8", icon: 18, label: "text-sm" },
    lg: { pill: "h-11 w-[4.75rem]", dot: "h-9 w-9", icon: 20, label: "text-base" },
  }[size];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to Light (Navy)" : "Switch to Dark (Gold)"}
      className={`relative z-20 inline-flex shrink-0 items-center gap-2 ${className}`}
    >
      <span
        className={`pointer-events-none relative ${sizes.pill} rounded-full transition-all duration-300`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1a1008, #2d1f00)"
            : "linear-gradient(135deg, #e8f0fe, #c4d9f5)",
          border: isDark
            ? "1.5px solid rgba(212,175,55,0.45)"
            : "1.5px solid rgba(26,58,107,0.3)",
          boxShadow: isDark
            ? "0 0 12px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 8px rgba(26,58,107,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <div
          className={`absolute top-1/2 ${sizes.dot} rounded-full flex items-center justify-center transition-all duration-300 ease-out`}
          style={{
            ...(isDark ? { right: "3px", left: "auto" } : { left: "3px", right: "auto" }),
            transform: "translateY(-50%)",
            background: isDark
              ? "linear-gradient(135deg, #c9973a, #d4af37)"
              : "linear-gradient(135deg, #1a3a6b, #1a3a6b)",
            boxShadow: isDark
              ? "0 2px 8px rgba(212,175,55,0.5)"
              : "0 2px 8px rgba(26,58,107,0.4)",
          }}
        >
          {isDark ? (
            <svg
              width={sizes.icon}
              height={sizes.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-black"
              aria-hidden
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width={sizes.icon}
              height={sizes.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white"
              aria-hidden
            >
              <circle cx="12" cy="12" r="4" />
              <path
                fill="currentColor"
                d="M12 1.5a1 1 0 0 1 1 1V5a1 1 0 1 1-2 0V2.5a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v2.5a1 1 0 1 1-2 0V17.5a1 1 0 0 1 1-1zM1.5 12a1 1 0 0 1 1-1H5a1 1 0 1 1 0 2H2.5a1 1 0 0 1-1-1zm15 0a1 1 0 0 1 1-1H19.5a1 1 0 1 1 0 2H17.5a1 1 0 0 1-1-1zM4.22 4.22a1 1 0 0 1 1.42 0L7.34 5.93a1 1 0 1 1-1.41 1.41L4.22 5.64a1 1 0 0 1 0-1.42zm12.44 12.44a1 1 0 0 1 1.42 0l1.71 1.71a1 1 0 0 1-1.41 1.41l-1.72-1.71a1 1 0 0 1 0-1.41zM19.78 4.22a1 1 0 0 1 0 1.42l-1.71 1.71a1 1 0 1 1-1.41-1.41l1.71-1.72a1 1 0 0 1 1.41 0zM6.64 16.66a1 1 0 0 1 0 1.42L4.93 19.78a1 1 0 0 1-1.41-1.41l1.71-1.71a1 1 0 0 1 1.41 0z"
              />
            </svg>
          )}
        </div>
      </span>

      {showLabel && (
        <span
          className={`${sizes.label} font-semibold transition-colors`}
          style={{ color: isDark ? "#d4af37" : "#1a3a6b" }}
        >
          {isDark ? "Gold" : "Blue"}
        </span>
      )}
    </button>
  );
}
