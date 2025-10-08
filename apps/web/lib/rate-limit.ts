/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Cloudflare Rate Limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  entry.count++;
  return true;
}

export function getRateLimitIdentifier(req: Request): string {
  // Try to get IP from various headers (Cloudflare, proxy, etc.)
  const headers = req.headers;
  const ip =
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    'unknown';

  return ip;
}

export function rateLimitResponse(retryAfter: number = 60): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': retryAfter.toString(),
      },
    }
  );
}

// Pre-configured rate limiters for different endpoints
export const RATE_LIMITS = {
  // Auth endpoints - stricter
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes

  // Upload endpoints - moderate
  upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute

  // API endpoints - generous
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute

  // Download endpoints - very generous
  download: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 requests per minute
};

