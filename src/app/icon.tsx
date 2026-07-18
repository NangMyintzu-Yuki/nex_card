// src/app/icon.tsx — NEX CARD favicon from brand asset
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const img = readFileSync(join(process.cwd(), "public/favicon.png"));
  return new Response(img, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
