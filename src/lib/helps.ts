export function formatWeddingDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatEventDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}


export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return iso; }
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

// Wedding countdown — days until the wedding
export function daysUntil(iso: string): number | null {
  try {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return null;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch { return null; }
}