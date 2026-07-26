"use client";

import { Component, type ReactNode } from "react";
import { TemplateRenderer, type TemplateRendererProps } from "@/components/templates/template-renderer";
import { AlertTriangle } from "lucide-react";

class TemplateErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[TemplateErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
      <div className="relative z-10 max-w-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-black">Profile Rendering Error</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          This profile has invalid data. The owner needs to re-save their profile from the dashboard.
        </p>
      </div>
    </main>
  );
}

export function SafeTemplateRenderer(props: TemplateRendererProps) {
  return (
    <TemplateErrorBoundary fallback={<ErrorFallback />}>
      <TemplateRenderer {...props} />
    </TemplateErrorBoundary>
  );
}
