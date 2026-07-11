// src/tests/utils.test.ts
import { describe, it, expect } from "vitest";
import {
  cn,
  toSlug,
  isValidSlug,
  timeAgo,
  formatDate,
  formatNumber,
  truncate,
  getInitials,
  ensureHttps,
  getDomain,
  hexToRgb,
  hexToRgba,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "false-class", "real")).toBe("base real");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined/null gracefully", () => {
    expect(cn("px-4", undefined, null as never, "py-2")).toBe("px-4 py-2");
  });
});

describe("toSlug", () => {
  it("converts spaces to hyphens", () => {
    expect(toSlug("Alex Rivera")).toBe("alex-rivera");
  });

  it("lowercases input", () => {
    expect(toSlug("HELLO WORLD")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(toSlug("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(toSlug("Alex  --  Rivera")).toBe("alex-rivera");
  });

  it("trims leading/trailing hyphens", () => {
    expect(toSlug("-alex-")).toBe("alex");
  });
});

describe("isValidSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("alex-rivera")).toBe(true);
    expect(isValidSlug("abc123")).toBe(true);
    expect(isValidSlug("my-cool-page-2024")).toBe(true);
  });

  it("rejects slugs with uppercase", () => {
    expect(isValidSlug("Alex-Rivera")).toBe(false);
  });

  it("rejects slugs shorter than 3 chars", () => {
    expect(isValidSlug("ab")).toBe(false);
  });

  it("rejects slugs with spaces", () => {
    expect(isValidSlug("alex rivera")).toBe(false);
  });

  it("rejects slugs with special characters", () => {
    expect(isValidSlug("alex@rivera")).toBe(false);
  });
});

describe("formatNumber", () => {
  it("formats numbers below 1000 as-is", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with K", () => {
    expect(formatNumber(1247)).toBe("1.2K");
    expect(formatNumber(10000)).toBe("10.0K");
  });

  it("formats millions with M", () => {
    expect(formatNumber(1_200_000)).toBe("1.2M");
  });

  it("handles BigInt", () => {
    expect(formatNumber(BigInt(5000))).toBe("5.0K");
  });
});

describe("truncate", () => {
  it("returns string unchanged if within limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates and appends ellipsis", () => {
    expect(truncate("Hello World", 8)).toBe("Hello W…");
  });

  it("handles exact limit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});

describe("getInitials", () => {
  it("returns two initials for full name", () => {
    expect(getInitials("Alex Rivera")).toBe("AR");
  });

  it("returns first two chars for single name", () => {
    expect(getInitials("Madonna")).toBe("MA");
  });

  it("handles names with multiple parts", () => {
    expect(getInitials("Alex James Rivera")).toBe("AR");
  });

  it("uppercases result", () => {
    expect(getInitials("alex rivera")).toBe("AR");
  });
});

describe("ensureHttps", () => {
  it("adds https to bare domain", () => {
    expect(ensureHttps("example.com")).toBe("https://example.com");
  });

  it("preserves existing https", () => {
    expect(ensureHttps("https://example.com")).toBe("https://example.com");
  });

  it("preserves http", () => {
    expect(ensureHttps("http://example.com")).toBe("http://example.com");
  });

  it("returns empty string as-is", () => {
    expect(ensureHttps("")).toBe("");
  });
});

describe("getDomain", () => {
  it("extracts domain from full URL", () => {
    expect(getDomain("https://www.linkedin.com/in/alex")).toBe("linkedin.com");
  });

  it("strips www prefix", () => {
    expect(getDomain("https://www.example.com/path")).toBe("example.com");
  });

  it("handles bare domain", () => {
    expect(getDomain("example.com")).toBe("example.com");
  });
});

describe("hexToRgb", () => {
  it("converts 6-char hex to RGB", () => {
    expect(hexToRgb("#6366f1")).toEqual({ r: 99, g: 102, b: 241 });
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("not-a-hex")).toBeNull();
  });

  it("handles hex without #", () => {
    expect(hexToRgb("6366f1")).toEqual({ r: 99, g: 102, b: 241 });
  });
});

describe("hexToRgba", () => {
  it("returns rgba string with alpha", () => {
    expect(hexToRgba("#6366f1", 0.2)).toBe("rgba(99, 102, 241, 0.2)");
  });

  it("handles invalid hex with fallback", () => {
    expect(hexToRgba("bad", 0.5)).toBe("rgba(0,0,0,0.5)");
  });
});
