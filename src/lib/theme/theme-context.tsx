// src/lib/theme/theme-context.tsx
// NEX CARD Theme System
// Light mode: white/navy blue | Dark mode: black/gold

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("nc-dark", theme === "dark");
  root.classList.toggle("nc-light", theme === "light");
  root.style.colorScheme = theme;
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("nexcard-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  // Prefer whatever class is already on <html> (survives provider remounts)
  if (document.documentElement.classList.contains("nc-dark")) return "dark";
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("nc-dark") ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeClass(theme);
    try {
      localStorage.setItem("nexcard-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyThemeClass(next);
      try {
        localStorage.setItem("nexcard-theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
