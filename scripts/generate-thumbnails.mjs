// scripts/generate-thumbnails.mjs
// Generates local SVG template thumbnails (no placehold.co)
import fs from "fs";

const templates = [
  ["aurora", "Aurora", "6366f1"],
  ["obsidian", "Obsidian", "18181b"],
  ["prism", "Prism", "a855f7"],
  ["coral", "Coral", "f97316"],
  ["titanium", "Titanium", "64748b"],
  ["portfolio", "Portfolio", "e11d48"],
  ["minimal", "Minimal", "737373"],
  ["terminal", "Terminal", "22c55e"],
  ["enterprise", "Enterprise", "1e40af"],
  ["executive", "Executive", "b45309"],
  ["founder", "Founder", "7c2d12"],
  ["canvas", "Canvas", "0ea5e9"],
  ["studio", "Studio", "ec4899"],
  ["forge", "Forge", "22c55e"],
  ["spectrum", "Spectrum", "f59e0b"],
  ["blueprint", "Blueprint", "3b82f6"],
  ["marquee", "Marquee", "ef4444"],
  ["district", "District", "0284c7"],
  ["empire", "Empire", "7c3aed"],
  ["neon", "Neon", "a3e635"],
  ["vault", "Vault", "d4af37"],
  ["eternal", "Eternal", "c9a96e"],
  ["blossom", "Blossom", "f472b6"],
  ["noir", "Noir", "27272a"],
  ["celestial", "Celestial", "1e0050"],
  ["rustic", "Rustic", "65a30d"],
];

function svg(name, bg) {
  const light = ["18181b", "27272a", "1e0050", "7c2d12", "1e40af"].includes(bg);
  const fg = light ? "#ffffff" : "#0a0a0a";
  const muted = light ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340" role="img" aria-label="${name} template">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#${bg}"/>
      <stop offset="100%" stop-color="#${bg}" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect width="600" height="340" fill="url(#g)"/>
  <circle cx="520" cy="-20" r="140" fill="${fg}" fill-opacity="0.08"/>
  <circle cx="40" cy="300" r="100" fill="${fg}" fill-opacity="0.06"/>
  <rect x="36" y="36" width="120" height="8" rx="4" fill="${fg}" fill-opacity="0.25"/>
  <text x="36" y="190" fill="${fg}" font-family="system-ui,Segoe UI,sans-serif" font-size="42" font-weight="800">${name}</text>
  <text x="36" y="230" fill="${muted}" font-family="system-ui,Segoe UI,sans-serif" font-size="16" font-weight="600">NEX CARD template</text>
</svg>
`;
}

fs.mkdirSync("public/thumbnails", { recursive: true });
for (const [slug, name, bg] of templates) {
  fs.writeFileSync(`public/thumbnails/${slug}.svg`, svg(name, bg));
}
console.log("wrote", templates.length, "thumbnails");
