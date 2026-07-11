// src/components/ui/spinner.tsx
import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const SIZE_STYLES: Record<SpinnerSize, string> = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "md", className, label = "Loading…" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-white/20 border-t-white",
        SIZE_STYLES[size],
        className
      )}
    />
  );
}

interface SpinnerOverlayProps {
  visible: boolean;
  label?: string;
}

export function SpinnerOverlay({ visible, label = "Loading…" }: SpinnerOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-neutral-950/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  );
}
