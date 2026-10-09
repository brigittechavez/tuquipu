/**
 * In-memory sliding window limiter. Adequate for a single instance; a shared
 * store is required once the hosting target is known.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string, now = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) hits.clear();
      return true;
    },
  };
}

export const leadRateLimiter = createRateLimiter(5, 10 * 60 * 1000);
