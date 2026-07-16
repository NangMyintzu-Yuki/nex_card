// scripts/patch-logo-theme.mjs
import fs from "fs";

let s = fs.readFileSync("src/components/ui/nex-card-logo.tsx", "utf8");

if (!s.includes('import { useId }')) {
  s = s.replace(
    'import { useTheme } from "@/lib/theme/theme-context";',
    'import { useId } from "react";\nimport { useTheme } from "@/lib/theme/theme-context";'
  );
}

s = s.replace(
  "function LogoMark({ size }: { size: number }) {",
  "function LogoMark({ size, isDark }: { size: number; isDark: boolean }) {"
);

const oldOpen = `  const h = size;
  const w = Math.round((size * 1380) / 752);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 1380 752"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
      aria-label="NEX CARD"
    >`;

const newOpen = `  const h = size;
  const w = Math.round((size * 1380) / 752);
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 1380 752"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "block",
        // Gold mark → navy/blue in light mode
        filter: isDark
          ? undefined
          : "hue-rotate(175deg) saturate(2.4) brightness(0.72)",
      }}
      aria-label="NEX CARD"
    >`;

if (s.includes(oldOpen)) {
  s = s.replace(oldOpen, newOpen);
} else {
  console.error("Could not find LogoMark svg open block");
  process.exit(1);
}

// Unique gradient ids to avoid clashes when multiple logos render
s = s.replace(/id="nx-([a-s])"/g, 'id={`nx-$1-${uid}`}');
s = s.replace(/url\(#nx-([a-s])\)/g, "url(#nx-$1-${uid})");

s = s.replace(/<LogoMark size=\{size\} \/>/g, "<LogoMark size={size} isDark={isDark} />");

fs.writeFileSync("src/components/ui/nex-card-logo.tsx", s);
console.log("LogoMark is now theme-aware");
