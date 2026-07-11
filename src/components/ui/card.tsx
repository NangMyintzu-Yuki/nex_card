// src/components/ui/card.tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING_STYLES = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({
  children,
  className,
  glass = false,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5",
        glass
          ? "bg-white/[0.04] backdrop-blur-xl"
          : "bg-white/[0.03]",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-xl",
        PADDING_STYLES[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-white/5 px-6 py-4", className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className="shrink-0 text-neutral-500">{icon}</div>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-600 truncate">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-5", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-t border-white/5 px-6 py-4", className)}>
      {children}
    </div>
  );
}
