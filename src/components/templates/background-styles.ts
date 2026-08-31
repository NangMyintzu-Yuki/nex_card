// src/components/templates/background-styles.ts
// Shared background style generator for digital-name-card templates

export type BackgroundStyle = "gradient" | "solid" | "mesh" | "noise";

export function getBackground(accentColor: string, style?: BackgroundStyle): string {
  switch (style) {
    case "solid":
      return `linear-gradient(160deg, #050508 0%, #080812 100%)`;
    case "mesh":
      return `radial-gradient(at 20% 20%, ${accentColor}25 0%, transparent 50%),
              radial-gradient(at 80% 20%, #06b6d420 0%, transparent 50%),
              radial-gradient(at 50% 80%, ${accentColor}15 0%, transparent 50%),
              linear-gradient(160deg, #050508 0%, #080812 100%)`;
    case "noise":
      return `radial-gradient(ellipse 80% 55% at 50% -5%, ${accentColor}30 0%, transparent 60%),
              repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px,
              linear-gradient(160deg, #050508 0%, #080812 100%)`;
    case "gradient":
    default:
      return `radial-gradient(ellipse 80% 55% at 50% -5%, ${accentColor}35 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 90% 90%, #06b6d420 0%, transparent 50%),
              linear-gradient(160deg, #050508 0%, #080812 100%)`;
  }
}
