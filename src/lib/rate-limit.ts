import { prisma } from './prisma';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Database-backed rate limiter for Next.js API Routes using MongoDB
 * @param key Unique key to identify the client/action (e.g. "login:127.0.0.1")
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const cleanKey = key.trim().toLowerCase();

  try {
    // First, delete any expired rate limits to keep database clean
    await prisma.rateLimit.deleteMany({
      where: {
        expireAt: {
          lt: now,
        },
      },
    });

    // Find or create rate limit entry
    const entry = await prisma.rateLimit.upsert({
      where: { key: cleanKey },
      update: {
        points: {
          increment: 1,
        },
      },
      create: {
        key: cleanKey,
        points: 1,
        expireAt: new Date(now.getTime() + windowMs),
      },
    });

    const remaining = Math.max(0, limit - entry.points);
    const success = entry.points <= limit;

    return {
      success,
      limit,
      remaining,
      reset: entry.expireAt,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail-safe: allow requests to go through if database rate-limiting fails
    return {
      success: true,
      limit,
      remaining: limit,
      reset: new Date(now.getTime() + windowMs),
    };
  }
}
