// src/app/dashboard/nfc/[slug]/_components/nfc-web-write.tsx
"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    NDEFReader?: new () => {
      write: (message: {
        records: Array<{ recordType: string; data: string }>;
      }) => Promise<void>;
    };
  }
}

export function NfcWebWriteButton({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "writing" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window.NDEFReader === "function");
  }, []);

  async function writeTag() {
    if (!window.NDEFReader) {
      setStatus("error");
      setMessage("Web NFC is only available in Chrome on Android.");
      return;
    }
    setStatus("writing");
    setMessage("Hold your NFC tag near the phone…");
    try {
      const reader = new window.NDEFReader();
      await reader.write({
        records: [{ recordType: "url", data: url }],
      });
      setStatus("ok");
      setMessage("Tag written. Tap it to verify, then mark as programmed.");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Write failed or was cancelled."
      );
    }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={writeTag}
        disabled={status === "writing"}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{
          background: "rgba(34,197,94,0.15)",
          border: "1px solid rgba(34,197,94,0.35)",
          color: "#22c55e",
        }}
      >
        {status === "writing" ? "Waiting for tag…" : "Write with Web NFC"}
      </button>
      {!supported && (
        <p className="mt-2 text-xs" style={{ color: "var(--nc-text-3)" }}>
          Web NFC requires Chrome on Android. On other devices, use NFC Tools with the URL above.
        </p>
      )}
      {message && (
        <p
          className="mt-2 text-xs"
          style={{ color: status === "error" ? "#ef4444" : "#22c55e" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
