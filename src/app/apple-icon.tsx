// src/app/apple-icon.tsx
// Apple touch icon for NEX CARD

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          borderRadius: 36,
          color: "#f59e0b",
          fontSize: 96,
          fontWeight: 900,
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}
