/**
 * OpenAI Client for FitAdmin AI Features
 *
 * Provides centralized OpenAI integration with:
 * - Environment-based configuration
 * - Error handling and fallback logic
 * - Retry mechanism for transient failures
 * - Logging for debugging
 */

import OpenAI from 'openai'

// Initialize OpenAI client
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[OpenAI] OPENAI_API_KEY not set. AI features will use mock/template data.')
    return null
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return openaiClient
}

export interface CompletionOptions {
  temperature?: number
  maxTokens?: number
  model?: string
  retries?: number
  jsonMode?: boolean
}

/**
 * Generate AI completion with retry logic and error handling
 */
export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {}
): Promise<string | null> {
  const client = getOpenAIClient()

  if (!client) {
    return null // Will trigger fallback to mock/template data
  }

  const {
    temperature = 0.7,
    maxTokens = 2000,
    model = 'gpt-4o-mini',
    retries = 2,
    jsonMode = false,
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      })

      const content = response.choices[0]?.message?.content

      if (!content) {
        throw new Error('OpenAI returned empty response')
      }

      console.log(`[OpenAI] Completion successful (${response.usage?.total_tokens || 0} tokens)`)
      return content
    } catch (error) {
      lastError = error as Error
      console.error(`[OpenAI] Attempt ${attempt + 1}/${retries + 1} failed:`, error)

      // Don't retry on authentication or rate limit errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401 || error.status === 429) {
          break
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.error('[OpenAI] All attempts failed. Falling back to template data.', lastError)
  return null
}

/**
 * Generate structured JSON response from OpenAI
 */
export async function generateStructuredCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {}
): Promise<T | null> {
  const content = await generateCompletion(systemPrompt, userPrompt, {
    ...options,
    jsonMode: true,
  })

  if (!content) {
    return null
  }

  try {
    return JSON.parse(content) as T
  } catch (error) {
    console.error('[OpenAI] Failed to parse JSON response:', error)
    console.error('[OpenAI] Raw content:', content)
    return null
  }
}

/**
 * Check if OpenAI is available
 */
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Export the raw client for advanced use cases
 */
export { openaiClient as openai }
