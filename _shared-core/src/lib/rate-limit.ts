/**
 * Simple In-Memory Rate Limiter
 *
 * Limits requests per IP address using a sliding window algorithm.
 * Note: This is per-instance, so it won't work across multiple serverless instances.
 * For production with serverless, consider using Redis or a similar distributed store.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowInSeconds: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowInSeconds * 1000
  const key = `rate-limit:${identifier}`

  const record = rateLimitStore.get(key)

  // If no record or window has expired, create new record
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, newRecord)
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: newRecord.resetTime,
    }
  }

  // Check if limit exceeded
  if (record.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Increment count
  record.count++
  return {
    success: true,
    remaining: config.limit - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Get the client IP address from the request
 * Handles various proxy headers
 */
export function getClientIp(request: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default (this shouldn't happen in production)
  return 'unknown'
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Contact form: 5 requests per minute
  contactForm: (ip: string) => rateLimit(ip, { limit: 5, windowInSeconds: 60 }),

  // API general: 100 requests per minute
  api: (ip: string) => rateLimit(ip, { limit: 100, windowInSeconds: 60 }),

  // Login attempts: 5 per minute
  login: (ip: string) => rateLimit(ip, { limit: 5, windowInSeconds: 60 }),

  // Strict: 10 requests per minute (for sensitive endpoints)
  strict: (ip: string) => rateLimit(ip, { limit: 10, windowInSeconds: 60 }),
}
