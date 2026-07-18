// src/app/apple-icon.tsx — NEX CARD Apple touch icon from brand asset
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const img = readFileSync(join(process.cwd(), "public/apple-touch-icon.png"));
  return new Response(img, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
