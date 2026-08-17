// src/app/maintenance/page.tsx — Shown to non-admin users when maintenance mode is ON
import type { Metadata } from "next";
import { MaintenanceContent } from "./maintenance-content";

export const metadata: Metadata = {
  title: "Maintenance — NEX CARD",
  description: "NEX CARD is currently undergoing scheduled maintenance.",
};

export default function MaintenancePage() {
  return <MaintenanceContent />;
}
