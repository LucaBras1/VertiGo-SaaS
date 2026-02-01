import OpenAI from 'openai'

/**
 * OpenAI client with lazy loading pattern
 * Allows builds to complete without OPENAI_API_KEY
 */

let _openai: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

// Proxy for backwards compatibility - lazy initialization
export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(target, prop) {
    if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') {
      return undefined
    }
    const client = getOpenAIClient()
    const value = client[prop as keyof OpenAI]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export default openai
