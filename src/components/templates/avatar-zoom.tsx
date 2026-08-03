"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { TemplateImage } from "@/components/templates/template-image";

export function AvatarZoom({
  src,
  alt,
  className = "",
  imageClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative ${className}`}
        aria-label="View full size photo"
      >
        <TemplateImage
          src={src}
          alt={alt}
          fill
          className={`object-cover ${imageClassName}`}
          sizes="160px"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <TemplateImage
              src={src}
              alt={alt}
              width={1200}
              height={1200}
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
