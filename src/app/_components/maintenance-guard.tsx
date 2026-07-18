// src/app/_components/maintenance-guard.tsx
// Client component — redirects non-admin users to /maintenance when maintenance mode is on
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const EXEMPT_PATHS = ["/maintenance", "/login", "/register", "/api/auth"];

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isExempt = EXEMPT_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isExempt) {
      router.replace("/maintenance");
    }
  }, [isExempt, router]);

  if (isExempt) {
    return <>{children}</>;
  }

  return null;
}
