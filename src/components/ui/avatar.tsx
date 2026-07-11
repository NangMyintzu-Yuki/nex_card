// src/components/ui/avatar.tsx
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  rounded?: "full" | "xl" | "2xl";
}

const SIZE_PX: Record<AvatarSize, number> = {
  "xs":  24,
  "sm":  32,
  "md":  40,
  "lg":  56,
  "xl":  80,
  "2xl": 112,
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  "xs":  "h-6 w-6 text-xs",
  "sm":  "h-8 w-8 text-xs",
  "md":  "h-10 w-10 text-sm",
  "lg":  "h-14 w-14 text-base",
  "xl":  "h-20 w-20 text-xl",
  "2xl": "h-28 w-28 text-3xl",
};

// Deterministic accent color from name
function nameToColor(name: string): string {
  const COLORS = [
    "#6366f1", "#0ea5e9", "#f59e0b", "#ec4899",
    "#22c55e", "#a855f7", "#06b6d4", "#f97316",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length]!;
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
  rounded = "full",
}: AvatarProps) {
  const px = SIZE_PX[size];
  const sizeClass = SIZE_CLASSES[size];
  const roundedClass = rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-xl" : "rounded-2xl";
  const color = nameToColor(name);
  const initials = getInitials(name);

  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          sizeClass,
          roundedClass,
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold text-white",
        sizeClass,
        roundedClass,
        className
      )}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}

// Stack of overlapping avatars
interface AvatarGroupProps {
  users: Array<{ name: string; avatarUrl?: string | null }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = "sm", className }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((u, i) => (
        <Avatar
          key={i}
          src={u.avatarUrl}
          name={u.name}
          size={size}
          className="ring-2 ring-neutral-950"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-800 font-bold text-neutral-400 ring-2 ring-neutral-950 text-xs",
            SIZE_CLASSES[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
