// scripts/convert-qr-to-svg.mjs
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");

const src =
  process.argv[2] ||
  "C:/Users/Admin/.cursor/projects/c-Users-Admin-Desktop-nmz-games-nex-card/assets/c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_e216dbdb5e6528151d884ffd55a82df6_images_qr-wetechmm-com-16144749-b21c-4227-8281-38d0682a4d3f.png";

const buf = fs.readFileSync(src);
const png = PNG.sync.read(buf);
const { width, height, data } = png;

function lum(x, y) {
  const i = (y * width + x) * 4;
  return (data[i] + data[i + 1] + data[i + 2]) / 3;
}
function isDark(x, y) {
  return lum(x, y) < 128;
}

let minX = width,
  minY = height,
  maxX = 0,
  maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (isDark(x, y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const contentW = maxX - minX + 1;
const contentH = maxY - minY + 1;
const candidates = [];
for (let m = 1; m <= 40; m++) {
  if (contentW % m === 0 && contentH % m === 0) candidates.push(m);
}

let moduleSize =
  candidates.find((m) => {
    const n = contentW / m;
    return n >= 21 && n <= 57;
  }) || candidates[0];

const modules = Math.round(contentW / moduleSize);
console.log({ width, height, minX, minY, maxX, maxY, moduleSize, modules });

const matrix = [];
for (let r = 0; r < modules; r++) {
  const row = [];
  for (let c = 0; c < modules; c++) {
    const sx = minX + Math.floor(c * moduleSize + moduleSize / 2);
    const sy = minY + Math.floor(r * moduleSize + moduleSize / 2);
    row.push(isDark(sx, sy) ? 1 : 0);
  }
  matrix.push(row);
}

const rects = [];
for (let r = 0; r < modules; r++) {
  let c = 0;
  while (c < modules) {
    if (!matrix[r][c]) {
      c++;
      continue;
    }
    let c2 = c;
    while (c2 < modules && matrix[r][c2]) c2++;
    rects.push({ x: c, y: r, w: c2 - c, h: 1 });
    c = c2;
  }
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${modules} ${modules}" width="${modules}" height="${modules}" shape-rendering="crispEdges" role="img" aria-label="NEX CARD QR">
  <rect width="${modules}" height="${modules}" fill="#ffffff"/>
  <g fill="#000000">
${rects.map((r) => `    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>`).join("\n")}
  </g>
</svg>
`;

fs.mkdirSync("public/brand", { recursive: true });
fs.writeFileSync("public/brand/nex-qr.svg", svg);
fs.mkdirSync("scripts", { recursive: true });
fs.writeFileSync(
  "scripts/qr-matrix.json",
  JSON.stringify({ modules, matrix, rects })
);
console.log("wrote public/brand/nex-qr.svg with", rects.length, "rects");
