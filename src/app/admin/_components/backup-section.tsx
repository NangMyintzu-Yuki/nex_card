// src/app/admin/_components/backup-section.tsx
"use client";

import { useState } from "react";
import { Database, Mail, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function BackupSection() {
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  async function sendEmailBackup() {
    setEmailStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Backup failed");
      setEmailStatus("success");
      setMessage(`Backup sent! ${data.stats.sizeRaw} → ${data.stats.sizeCompressed} (${data.stats.reduction} compressed)`);
    } catch (err) {
      setEmailStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function downloadBackup() {
    setDownloadStatus("loading");
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexcard-backup-${new Date().toISOString().slice(0, 10)}.sql.gz`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadStatus("idle");
    } catch {
      setDownloadStatus("idle");
    }
  }

  const cardStyle = {
    background: "var(--nc-bg-card)",
    border: "1px solid var(--nc-border)",
  };

  return (
    <div className="nc-card overflow-hidden rounded-2xl" style={cardStyle}>
      <div className="flex items-center gap-2.5 px-6 py-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <Database className="h-4 w-4" style={{ color: "var(--nc-text-3)" }} />
        <h2 className="text-sm font-bold" style={{ color: "var(--nc-text)" }}>Database Backup</h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Export all database tables as a compressed SQL file. Email backup sends the <code className="rounded px-1 font-mono" style={{ background: "var(--nc-bg-hover)" }}>.sql.gz</code> file to your registered admin email.
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Email backup */}
          <button
            onClick={sendEmailBackup}
            disabled={emailStatus === "loading"}
            className="nc-btn-brand flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--nc-brand-grad)" }}>
            {emailStatus === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            {emailStatus === "loading" ? "Generating & Sending…" : "Backup & Email"}
          </button>

          {/* Download backup */}
          <button
            onClick={downloadBackup}
            disabled={downloadStatus === "loading"}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--nc-bg-hover)", border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}>
            {downloadStatus === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {downloadStatus === "loading" ? "Generating…" : "Download .sql.gz"}
          </button>
        </div>

        {/* Status message */}
        {message && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs"
            style={{
              background: emailStatus === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${emailStatus === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              color: emailStatus === "success" ? "#22c55e" : "#ef4444",
            }}>
            {emailStatus === "success" ? (
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            )}
            {message}
          </div>
        )}

        <p className="text-[10px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          Tables included: users, sessions, categories, templates, user_profiles, payments. Files are gzip-compressed (~70-90% smaller).
        </p>
      </div>
    </div>
  );
}
