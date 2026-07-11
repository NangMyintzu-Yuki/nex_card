// src/components/ui/input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftAddon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-semibold text-neutral-400"
          >
            {label}
            {props.required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}

        <div className={cn("relative flex overflow-hidden rounded-xl border transition-colors", error ? "border-red-500/40 focus-within:border-red-500/60" : "border-white/10 focus-within:border-indigo-500/50", "bg-white/5")}>
          {leftAddon && (
            <div className="flex items-center border-r border-white/10 px-3 text-sm text-neutral-600">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none",
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-neutral-600">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
