// src/app/_components/maintenance-guard.tsx
// Client component — redirects non-admin users to /maintenance when maintenance mode is on
// Also checks bypass cookie so developers who entered via /dev prefix aren't redirected.
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const EXEMPT_PATHS = ["/maintenance", "/login", "/register", "/api/auth"];

function hasBypassCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("nxbp="));
}

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  const isExempt = EXEMPT_PATHS.some((p) => pathname.startsWith(p));
  const isBypass = hasBypassCookie();

  useEffect(() => {
    if (!isExempt && !isBypass) {
      router.replace("/maintenance");
    } else {
      setChecked(true);
    }
  }, [isExempt, isBypass, router]);

  if (isExempt || isBypass) {
    return <>{children}</>;
  }

  if (!checked) return null;

  return null;
}
