// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "premium";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default:  "bg-white/5 border-white/10 text-neutral-400",
  success:  "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  warning:  "bg-amber-500/10 border-amber-500/20 text-amber-400",
  danger:   "bg-red-500/10 border-red-500/20 text-red-400",
  info:     "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  premium:  "bg-amber-500/20 border-amber-400/30 text-amber-300",
};

const DOT_STYLES: Record<BadgeVariant, string> = {
  default:  "bg-neutral-400",
  success:  "bg-emerald-400",
  warning:  "bg-amber-400",
  danger:   "bg-red-400",
  info:     "bg-indigo-400",
  premium:  "bg-amber-300",
};

export function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        BADGE_STYLES[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT_STYLES[variant])}
        />
      )}
      {children}
    </span>
  );
}
