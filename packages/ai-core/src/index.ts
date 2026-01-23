/**
 * VertiGo AI Core
 *
 * Shared AI utilities for all VertiGo verticals.
 * Provides OpenAI integration with rate limiting, caching, and usage tracking.
 */

export { AIClient, createAIClient } from './client'
export type { AIClientConfig, AIClientOptions } from './client'

export { PromptManager, createPromptManager } from './prompts'
export type { PromptTemplate, PromptVariables } from './prompts'

export { EmbeddingService, createEmbeddingService } from './embeddings'
export type { EmbeddingConfig } from './embeddings'

export { UsageTracker, createUsageTracker } from './usage'
export type { UsageRecord, UsageStats } from './usage'

export { AICache, createAICache } from './cache'
export type { CacheConfig } from './cache'

export { RateLimiter, createRateLimiter } from './rate-limiter'
export type { RateLimitConfig } from './rate-limiter'

// Utility types
export type { Vertical, TenantId } from './types'

// Response parsers
export { parseStructuredResponse, validateAIResponse } from './parsers'
