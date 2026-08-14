// src/lib/security/maintenance.ts
import { NextResponse } from "next/server";
import { getSettingsSyncFallback } from "@/lib/settings";

const ALLOWED_PREFIXES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/auth/2fa",
  "/api/health",
  "/api/cron/",
  "/api/admin/",
];

export function isMaintenanceMode(): boolean {
  return getSettingsSyncFallback().maintenance_mode === true;
}

export const MAINTENANCE_MESSAGE =
  "The site is under maintenance. Please try again later.";

/** Call at the start of mutating public API routes. */
export function rejectIfMaintenance(pathname: string): NextResponse | null {
  if (!isMaintenanceMode()) return null;
  if (ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return NextResponse.json(
    { error: MAINTENANCE_MESSAGE },
    { status: 503, headers: { "Retry-After": "3600" } }
  );
}
