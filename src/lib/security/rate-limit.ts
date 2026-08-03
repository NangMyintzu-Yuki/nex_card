// src/lib/security/rate-limit.ts
// In-memory sliding-window rate limiter (single Node process / PM2 instance).
// For multi-instance deploys, put limits at Nginx or swap for Upstash Redis.

type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

/**
 * @param key   unique key e.g. `auth:login:1.2.3.4`
 * @param limit max requests in the window
 * @param windowMs window length in ms
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    store.set(key, bucket);
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, remaining: 0, retryAfterSec };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSec: 0,
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Periodic cleanup to avoid unbounded Map growth */
const CLEAN_EVERY = 200;
let ops = 0;
export function maybeCleanupRateLimits(windowMs = 60_000) {
  ops += 1;
  if (ops % CLEAN_EVERY !== 0) return;
  const now = Date.now();
  for (const [key, bucket] of store) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs * 2);
    if (bucket.timestamps.length === 0) store.delete(key);
  }
}
