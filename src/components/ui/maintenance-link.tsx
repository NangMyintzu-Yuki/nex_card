"use client";

import Link from "next/link";
import { type ComponentProps } from "react";
import { useMaintenanceMode } from "@/app/_components/theme-root";

const BYPASS_PREFIX = "/dev";

export function MaintenanceLink({ href, ...props }: ComponentProps<typeof Link>) {
  const isMaintenance = useMaintenanceMode();

  if (!isMaintenance) {
    return <Link href={href} {...props} />;
  }

  // During maintenance, prefix all internal links with /dev
  if (typeof href === "string") {
    // Already prefixed or external
    if (href.startsWith(BYPASS_PREFIX) || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
      return <Link href={href} {...props} />;
    }
    return <Link href={`${BYPASS_PREFIX}${href}`} {...props} />;
  }

  // Object href (e.g. { pathname: '/dashboard', query: {...} })
  if (href.pathname) {
    if (href.pathname.startsWith(BYPASS_PREFIX) || href.pathname.startsWith("http")) {
      return <Link href={href} {...props} />;
    }
    return <Link href={{ ...href, pathname: `${BYPASS_PREFIX}${href.pathname}` }} {...props} />;
  }

  return <Link href={href} {...props} />;
}
