// src/app/global-error.tsx
// Root error boundary (replaces root layout when it fails)

"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootGlobalError]", error);
    void import("@/lib/observability").then(({ captureException }) =>
      captureException(error, { digest: error.digest, source: "global-error" })
    );
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ opacity: 0.6, marginBottom: 20, fontSize: 14 }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              background: "#4f46e5",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
