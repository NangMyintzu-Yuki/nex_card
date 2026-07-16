// src/app/icon.tsx
// Auto-generated favicon for NEX CARD

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
          color: "#f59e0b",
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}
