// scripts/export-qr-data.mjs
import fs from "fs";

const { modules, rects } = JSON.parse(
  fs.readFileSync("scripts/qr-matrix.json", "utf8")
);

const out = `// Auto-generated from attached QR — regenerate via scripts/convert-qr-to-svg.mjs
export const NEX_QR_MODULES = ${modules};
export const NEX_QR_RECTS = ${JSON.stringify(rects)} as const;
`;

fs.writeFileSync("src/components/ui/nex-qr-data.ts", out);
console.log("wrote nex-qr-data.ts", rects.length, "rects,", modules, "modules");
