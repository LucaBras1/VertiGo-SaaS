/**
 * Response Parsers - Utilities for parsing and validating AI responses
 */

import { z } from 'zod'

/**
 * Parse a structured JSON response from AI
 */
export function parseStructuredResponse<T>(
  content: string,
  fallback?: T
): T | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim()

    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.warn('Failed to parse AI response as JSON:', error)
    return fallback ?? null
  }
}

/**
 * Validate AI response against a Zod schema
 */
export function validateAIResponse<T>(
  content: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(content)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}

// Common response schemas
export const QuoteSuggestionSchema = z.object({
  economy: z.object({
    price: z.number(),
    features: z.array(z.string()),
    reasoning: z.string(),
  }),
  standard: z.object({
    price: z.number(),
    features: z.array(z.string()),
    reasoning: z.string(),
  }),
  premium: z.object({
    price: z.number(),
    features: z.array(z.string()),
    reasoning: z.string(),
  }),
  recommendation: z.enum(['economy', 'standard', 'premium']),
  recommendationReasoning: z.string(),
})

export const EmailDraftSchema = z.object({
  subject: z.string(),
  body: z.string(),
  suggestedFollowUp: z.string().optional(),
})

export const ContentSuggestionSchema = z.object({
  headline: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  keyBenefits: z.array(z.string()),
  seoKeywords: z.array(z.string()),
  callToAction: z.string(),
})

export type QuoteSuggestion = z.infer<typeof QuoteSuggestionSchema>
export type EmailDraft = z.infer<typeof EmailDraftSchema>
export type ContentSuggestion = z.infer<typeof ContentSuggestionSchema>
