"use client";

import { ThemeProvider } from "@/lib/theme/theme-context";

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
