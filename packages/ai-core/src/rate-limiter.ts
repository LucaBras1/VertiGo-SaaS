/**
 * Rate Limiter - Token bucket algorithm for API rate limiting
 */

export interface RateLimitConfig {
  requestsPerMinute: number
}

interface TenantBucket {
  tokens: number
  lastRefill: number
}

export class RateLimiter {
  private config: RateLimitConfig
  private buckets: Map<string, TenantBucket> = new Map()

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async acquire(tenantId: string): Promise<void> {
    const bucket = this.getBucket(tenantId)
    this.refillBucket(bucket)

    if (bucket.tokens < 1) {
      // Calculate wait time
      const waitMs = this.calculateWaitTime(bucket)
      await this.sleep(waitMs)
      this.refillBucket(bucket)
    }

    bucket.tokens -= 1
  }

  private getBucket(tenantId: string): TenantBucket {
    let bucket = this.buckets.get(tenantId)
    if (!bucket) {
      bucket = {
        tokens: this.config.requestsPerMinute,
        lastRefill: Date.now(),
      }
      this.buckets.set(tenantId, bucket)
    }
    return bucket
  }

  private refillBucket(bucket: TenantBucket): void {
    const now = Date.now()
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = (timePassed / 60000) * this.config.requestsPerMinute

    bucket.tokens = Math.min(
      this.config.requestsPerMinute,
      bucket.tokens + tokensToAdd
    )
    bucket.lastRefill = now
  }

  private calculateWaitTime(bucket: TenantBucket): number {
    const tokensNeeded = 1 - bucket.tokens
    return (tokensNeeded / this.config.requestsPerMinute) * 60000
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getStats(tenantId: string) {
    const bucket = this.buckets.get(tenantId)
    return bucket ? {
      availableTokens: bucket.tokens,
      maxTokens: this.config.requestsPerMinute,
    } : null
  }
}

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}
