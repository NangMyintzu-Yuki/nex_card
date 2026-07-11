// src/components/ui/theme-toggle.tsx
// Theme toggle button — switches between Light (navy blue) and Dark (gold) mode
// Shows sun for light, moon+stars for dark, with animated transition

"use client";

import { useTheme } from "@/lib/theme/theme-context";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ size = "md", showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const sizes = {
    sm: { btn: "h-8 w-8",   icon: 14, pill: "h-7 w-12", dot: "h-5 w-5", label: "text-xs" },
    md: { btn: "h-10 w-10", icon: 18, pill: "h-8 w-14", dot: "h-6 w-6", label: "text-sm" },
    lg: { btn: "h-12 w-12", icon: 22, pill: "h-9 w-16", dot: "h-7 w-7", label: "text-base" },
  }[size];

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "Light (Blue)" : "Dark (Gold)"} mode`}
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      {/* Pill toggle */}
      <div
        className={`relative ${sizes.pill} rounded-full transition-all duration-500 cursor-pointer`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1a1008, #2d1f00)"
            : "linear-gradient(135deg, #e8f0fe, #c4d9f5)",
          border: isDark
            ? "1.5px solid rgba(212,175,55,0.4)"
            : "1.5px solid rgba(26,58,107,0.25)",
          boxShadow: isDark
            ? "0 0 12px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 8px rgba(26,58,107,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Sliding dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${sizes.dot} rounded-full flex items-center justify-center transition-all duration-500`}
          style={{
            left: isDark ? "calc(100% - 4px)" : "4px",
            transform: `translateY(-50%) translateX(${isDark ? "-100%" : "0%"})`,
            background: isDark
              ? "linear-gradient(135deg, #c9973a, #f0c050)"
              : "linear-gradient(135deg, #1a3a6b, #4a9fd4)",
            boxShadow: isDark
              ? "0 2px 8px rgba(212,175,55,0.5)"
              : "0 2px 8px rgba(26,58,107,0.4)",
          }}
        >
          {isDark ? (
            /* Moon icon */
            <svg width={sizes.icon * 0.6} height={sizes.icon * 0.6} viewBox="0 0 24 24" fill="currentColor" className="text-black">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            /* Sun icon */
            <svg width={sizes.icon * 0.6} height={sizes.icon * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          )}
        </div>

        {/* Background icons */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {/* Sun on left when dark mode */}
          {isDark && (
            <div className="ml-1.5 opacity-30">
              <svg width={sizes.icon * 0.45} height={sizes.icon * 0.45} viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/>
              </svg>
            </div>
          )}
          {/* Moon on right when light mode */}
          {!isDark && (
            <div className="ml-auto mr-1.5 opacity-30">
              <svg width={sizes.icon * 0.45} height={sizes.icon * 0.45} viewBox="0 0 24 24" fill="#1a3a6b">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`${sizes.label} font-semibold transition-colors`}
          style={{ color: isDark ? "#d4af37" : "#1a3a6b" }}>
          {isDark ? "Gold" : "Blue"}
        </span>
      )}
    </button>
  );
}