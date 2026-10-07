/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Good enough for a single-instance deployment (Node server / local dev).
 * In serverless environments each instance keeps its own window - see
 * docs/deployment.md for the production upgrade path (e.g. Redis / Upstash).
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfter = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000)
    );
    return { ok: false, retryAfter };
  }

  bucket.timestamps.push(now);

  // Opportunistic cleanup so the map does not grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.timestamps.every((t) => now - t >= windowMs)) {
        buckets.delete(k);
      }
    }
  }

  return { ok: true };
}
