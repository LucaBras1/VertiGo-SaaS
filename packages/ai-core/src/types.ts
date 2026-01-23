/**
 * Core types for VertiGo AI
 */

export type Vertical =
  | 'photography'
  | 'musicians'
  | 'fitness'
  | 'events'
  | 'performing_arts'
  | 'team_building'
  | 'kids_entertainment'

export type TenantId = string

export interface AIRequestContext {
  tenantId: TenantId
  vertical: Vertical
  userId?: string
  requestId?: string
}

export interface AIResponse<T = unknown> {
  data: T
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cached: boolean
  latencyMs: number
}

export interface AIError {
  code: string
  message: string
  retryable: boolean
  details?: Record<string, unknown>
}

export type AIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'

export interface ModelConfig {
  model: AIModel
  maxTokens?: number
  temperature?: number
  topP?: number
}

// Vertical-specific AI feature types
export interface QuoteSuggestion {
  economyPrice: number
  standardPrice: number
  premiumPrice: number
  reasoning: string
  conversionPrediction: {
    economy: number
    standard: number
    premium: number
  }
}

export interface ContentSuggestion {
  title: string
  description: string
  seoKeywords: string[]
  tone: 'professional' | 'friendly' | 'casual'
}

export interface CommunicationDraft {
  subject: string
  body: string
  sentiment: 'positive' | 'neutral' | 'negative'
  urgency: 'low' | 'medium' | 'high'
}
