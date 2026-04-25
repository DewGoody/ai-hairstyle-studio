import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const DAILY_LIMIT = 5;

let ratelimit: Ratelimit;

if (url && token) {
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "24 h"),
    analytics: false,
    prefix: "hairstyle",
  });
} else {
  // Test/dev fallback: in-memory limiter so tests can run without Upstash creds.
  const counts = new Map<string, { count: number; resetAt: number }>();
  ratelimit = {
    limit: async (key: string) => {
      const now = Date.now();
      const entry = counts.get(key);
      if (!entry || entry.resetAt < now) {
        counts.set(key, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
        return { success: true, remaining: DAILY_LIMIT - 1, reset: now + 24 * 60 * 60 * 1000, limit: DAILY_LIMIT, pending: Promise.resolve() };
      }
      if (entry.count >= DAILY_LIMIT) {
        return { success: false, remaining: 0, reset: entry.resetAt, limit: DAILY_LIMIT, pending: Promise.resolve() };
      }
      entry.count += 1;
      return { success: true, remaining: DAILY_LIMIT - entry.count, reset: entry.resetAt, limit: DAILY_LIMIT, pending: Promise.resolve() };
    },
  } as unknown as Ratelimit;
}

export { ratelimit };
