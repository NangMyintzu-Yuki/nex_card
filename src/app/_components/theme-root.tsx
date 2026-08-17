"use client";

import { createContext, useContext } from "react";
import { ThemeProvider } from "@/lib/theme/theme-context";

export const MaintenanceContext = createContext(false);

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  return (
    <MaintenanceContext.Provider value={isMaintenance}>
      <ThemeProvider>{children}</ThemeProvider>
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceMode(): boolean {
  return useContext(MaintenanceContext);
}
