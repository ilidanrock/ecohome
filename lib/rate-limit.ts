import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiting Configuration
 *
 * In-memory rate limiting for development.
 * For production, consider using @upstash/ratelimit or Redis-based solution.
 */

interface RateLimitConfig {
  /**
   * Time window in milliseconds
   */
  interval: number;
  /**
   * Maximum number of requests allowed in the interval
   */
  limit: number;
  /**
   * Unique identifier per interval (e.g., IP address, user ID)
   */
  uniqueTokenPerInterval?: number;
}

/**
 * In-memory store for rate limit tracking
 * Key: identifier (IP or user ID)
 * Value: { count: number, resetAt: number }
 */
const rateLimitStore = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

/**
 * Clean up expired entries periodically (every 5 minutes)
 */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
); // 5 minutes

/**
 * Get identifier for rate limiting
 * Uses IP address for unauthenticated requests, or user ID for authenticated requests
 */
function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  // Get IP address from request
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check if request exceeds rate limit
 *
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @param userId - Optional user ID for authenticated requests
 * @returns Object with `success` boolean and optional `response` if rate limited
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const identifier = getIdentifier(request, userId);
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier);

  // If entry doesn't exist or has expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.interval,
    };
    rateLimitStore.set(identifier, entry);
    return { success: true };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again after ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(entry.resetAt),
          },
        }
      ),
    };
  }

  // Update entry
  rateLimitStore.set(identifier, entry);

  return { success: true };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  /**
   * Rate limiter for payment endpoints
   * 100 requests per minute
   */
  payments: (request: NextRequest, userId?: string) =>
    rateLimit(request, { interval: 60 * 1000, limit: 100 }, userId),

  /**
   * Rate limiter for Cloudinary sign endpoint
   * 50 requests per minute
   */
  cloudinary: (request: NextRequest, userId?: string) =>
    rateLimit(request, { interval: 60 * 1000, limit: 50 }, userId),

  /**
   * Rate limiter for consumption endpoint
   * 200 requests per minute
   */
  consumption: (request: NextRequest, userId?: string) =>
    rateLimit(request, { interval: 60 * 1000, limit: 200 }, userId),
};
