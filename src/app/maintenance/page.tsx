// src/app/maintenance/page.tsx — Shown to non-admin users when maintenance mode is ON
import type { Metadata } from "next";
import { MaintenanceContent } from "./maintenance-content";
import "../globals.css";

export const metadata: Metadata = {
  title: "Maintenance — NEX CARD",
  description: "NEX CARD is currently undergoing scheduled maintenance.",
};

export default function MaintenancePage() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh overflow-hidden">
        <MaintenanceContent />
      </body>
    </html>
  );
}
