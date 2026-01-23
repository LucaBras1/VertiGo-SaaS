/**
 * AI Response Cache - LRU cache for AI responses
 */

import { LRUCache } from 'lru-cache'

export interface CacheConfig {
  ttlMs: number
  maxSize: number
}

export class AICache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache: LRUCache<string, any>

  constructor(config: CacheConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.cache = new LRUCache<string, any>({
      max: config.maxSize,
      ttl: config.ttlMs,
    })
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
    }
  }
}

export function createAICache(config: CacheConfig): AICache {
  return new AICache(config)
}
