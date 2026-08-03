// src/components/templates/template-image.tsx
// next/image wrapper for public templates (remote + local URLs)
"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

export function TemplateImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 800px",
  priority,
}: Props) {
  if (!src) return null;

  // Absolute positioned fills need a positioned parent
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("data:")}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("data:")}
    />
  );
}
