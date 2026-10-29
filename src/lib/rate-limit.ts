import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      const active = record.timestamps.filter((ts) => now - ts < 300_000);
      if (active.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, { timestamps: active });
      }
    }
  }, 300_000);
}

export interface RateLimitOptions {
  limit?: number;        // Max requests per window
  windowMs?: number;     // Window duration in ms (default: 60,000 = 1 minute)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory sliding-window rate limiter for server-side API routes.
 */
export function rateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitStore.get(key) || { timestamps: [] };
  // Keep only timestamps within the sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const resetTime = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(resetTime, 1),
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    success: true,
    limit,
    remaining: limit - activeTimestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extracts client IP identifier from incoming request headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Pre-flight rate limit check helper for Next.js Route Handlers.
 * Returns null if allowed, or a 429 response if rate limit was exceeded.
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): NextResponse | null {
  const ip = getClientIp(request);
  const route = request.nextUrl.pathname;
  const key = `${ip}:${route}`;

  const result = rateLimit(key, options);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait before making further requests.",
        limit: result.limit,
        remaining: result.remaining,
        retryAfterSeconds: result.reset,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.reset),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  return null;
}

