/**
 * AI Client - OpenAI wrapper with rate limiting, caching, and error handling
 */

import OpenAI from 'openai'
import pRetry from 'p-retry'
import { z } from 'zod'
import type { AIModel, AIRequestContext, AIResponse } from './types'
import { createAICache, type AICache } from './cache'
import { createRateLimiter, type RateLimiter } from './rate-limiter'
import { createUsageTracker, type UsageTracker } from './usage'

export interface AIClientConfig {
  apiKey: string
  organization?: string
  defaultModel?: AIModel
  maxRetries?: number
  timeout?: number
  cache?: {
    enabled: boolean
    ttlMs?: number
    maxSize?: number
  }
  rateLimit?: {
    enabled: boolean
    requestsPerMinute?: number
  }
}

export interface AIClientOptions {
  model?: AIModel
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  responseFormat?: 'text' | 'json'
}

export class AIClient {
  private openai: OpenAI
  private config: AIClientConfig
  private cache: AICache | null
  private rateLimiter: RateLimiter | null
  private usageTracker: UsageTracker

  constructor(config: AIClientConfig) {
    this.config = {
      defaultModel: 'gpt-4o-mini',
      maxRetries: 3,
      timeout: 30000,
      ...config,
    }

    this.openai = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      timeout: this.config.timeout,
    })

    this.cache = config.cache?.enabled
      ? createAICache({
          ttlMs: config.cache.ttlMs ?? 300000, // 5 min default
          maxSize: config.cache.maxSize ?? 1000
        })
      : null

    this.rateLimiter = config.rateLimit?.enabled
      ? createRateLimiter({
          requestsPerMinute: config.rateLimit.requestsPerMinute ?? 60
        })
      : null

    this.usageTracker = createUsageTracker()
  }

  /**
   * Generate a chat completion
   */
  async chat<T = string>(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    context: AIRequestContext,
    options: AIClientOptions = {}
  ): Promise<AIResponse<T>> {
    const startTime = Date.now()
    const cacheKey = this.getCacheKey(messages, options)

    // Check cache
    if (this.cache) {
      const cached = this.cache.get<T>(cacheKey)
      if (cached) {
        return {
          data: cached,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cached: true,
          latencyMs: Date.now() - startTime,
        }
      }
    }

    // Rate limit
    if (this.rateLimiter) {
      await this.rateLimiter.acquire(context.tenantId)
    }

    // Make request with retry
    const response = await pRetry(
      async () => {
        const completion = await this.openai.chat.completions.create({
          model: options.model ?? this.config.defaultModel ?? 'gpt-4o-mini',
          messages,
          max_tokens: options.maxTokens,
          temperature: options.temperature ?? 0.7,
          response_format: options.responseFormat === 'json'
            ? { type: 'json_object' }
            : undefined,
        })

        return completion
      },
      {
        retries: this.config.maxRetries ?? 3,
        onFailedAttempt: (error) => {
          console.warn(`AI request failed, attempt ${error.attemptNumber}:`, error.message)
        },
      }
    )

    const content = response.choices[0]?.message?.content ?? ''
    const data = options.responseFormat === 'json'
      ? JSON.parse(content) as T
      : content as T

    const usage = {
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    }

    // Track usage
    this.usageTracker.track({
      tenantId: context.tenantId,
      vertical: context.vertical,
      model: options.model ?? this.config.defaultModel ?? 'gpt-4o-mini',
      ...usage,
      timestamp: new Date(),
    })

    // Cache result
    if (this.cache) {
      this.cache.set(cacheKey, data)
    }

    return {
      data,
      usage,
      cached: false,
      latencyMs: Date.now() - startTime,
    }
  }

  /**
   * Generate structured output with Zod validation
   */
  async chatStructured<T>(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    schema: z.ZodSchema<T>,
    context: AIRequestContext,
    options: AIClientOptions = {}
  ): Promise<AIResponse<T>> {
    const systemPrompt = `${options.systemPrompt ?? ''}

You MUST respond with valid JSON that matches this schema:
${JSON.stringify(zodToJsonSchema(schema), null, 2)}

Do not include any text outside the JSON object.`

    const response = await this.chat<unknown>(
      [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system'),
      ],
      context,
      { ...options, responseFormat: 'json' }
    )

    // Validate with Zod
    const validated = schema.parse(response.data)

    return {
      ...response,
      data: validated,
    }
  }

  /**
   * Simple completion helper
   */
  async complete(
    prompt: string,
    context: AIRequestContext,
    options: AIClientOptions = {}
  ): Promise<AIResponse<string>> {
    return this.chat<string>(
      [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      context,
      options
    )
  }

  /**
   * Get usage statistics
   */
  getUsageStats(tenantId: string) {
    return this.usageTracker.getStats(tenantId)
  }

  private getCacheKey(
    messages: Array<{ role: string; content: string }>,
    options: AIClientOptions
  ): string {
    return JSON.stringify({ messages, options })
  }
}

/**
 * Create AI Client instance
 */
export function createAIClient(config: AIClientConfig): AIClient {
  return new AIClient(config)
}

/**
 * Simple Zod to JSON Schema converter (basic implementation)
 */
function zodToJsonSchema(_schema: z.ZodSchema): Record<string, unknown> {
  // This is a simplified version - in production use zod-to-json-schema package
  return { type: 'object', description: 'Structured response' }
}
