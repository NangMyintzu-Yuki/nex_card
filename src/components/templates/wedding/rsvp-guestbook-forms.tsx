// src/components/templates/wedding/rsvp-guestbook-forms.tsx
"use client";

import { useEffect, useState } from "react";

export function WeddingRsvpForm({
  slug,
  accentColor = "#c9a96e",
}: {
  slug: string;
  accentColor?: string;
}) {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState(true);
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/public/rsvp/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          email,
          attending,
          guestCount,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.message ?? "Could not submit RSVP.");
        return;
      }
      setStatus("ok");
      setGuestName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none";

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-md space-y-3 text-left">
      <input
        required
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        placeholder="Your name"
        className={inputClass}
        style={{ borderColor: `${accentColor}55` }}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className={inputClass}
        style={{ borderColor: `${accentColor}55` }}
      />
      <div className="flex gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={attending}
            onChange={() => setAttending(true)}
          />
          Attending
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!attending}
            onChange={() => setAttending(false)}
          />
          Decline
        </label>
      </div>
      {attending && (
        <input
          type="number"
          min={1}
          max={20}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
          className={inputClass}
          style={{ borderColor: `${accentColor}55` }}
          placeholder="Guest count"
        />
      )}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message (optional)"
        rows={3}
        className={inputClass}
        style={{ borderColor: `${accentColor}55` }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {status === "ok" && (
        <p className="text-xs" style={{ color: accentColor }}>
          Thank you — your RSVP was received.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60"
        style={{ background: accentColor }}
      >
        {status === "loading" ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}

export function WeddingGuestbookForm({
  slug,
  accentColor = "#c9a96e",
  title = "Leave a wish",
}: {
  slug: string;
  accentColor?: string;
  title?: string;
}) {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<
    Array<{ id: string; author: string; message: string; createdAt: string }>
  >([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/guestbook/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.entries) setEntries(data.entries);
      })
      .catch(() => {});
  }, [slug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(
        `/api/public/guestbook/${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author, message }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.message ?? "Could not post.");
        return;
      }
      setEntries((prev) => [data.entry, ...prev].slice(0, 50));
      setAuthor("");
      setMessage("");
      setStatus("ok");
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  }

  const inputClass =
    "w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none";

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-widest"
        style={{ color: accentColor }}>
        {title}
      </h3>
      <form onSubmit={onSubmit} className="space-y-3 text-left">
        <input
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className={inputClass}
          style={{ borderColor: `${accentColor}55` }}
        />
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your wish"
          rows={3}
          className={inputClass}
          style={{ borderColor: `${accentColor}55` }}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: accentColor }}
        >
          {status === "loading" ? "Posting…" : "Post wish"}
        </button>
      </form>
      {entries.length > 0 && (
        <ul className="mt-6 space-y-3 text-left text-sm">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border px-3 py-2"
              style={{ borderColor: `${accentColor}33` }}
            >
              <p className="font-semibold">{e.author}</p>
              <p className="opacity-80">{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
