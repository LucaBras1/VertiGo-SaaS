/**
 * Prompt Manager - Manage and version prompts for different verticals
 */

import type { Vertical } from '../types'
import { partyPalPrompts } from './partypal'

export interface PromptTemplate {
  id: string
  name: string
  version: string
  vertical: Vertical | 'shared'
  description?: string
  systemPrompt: string
  userPromptTemplate: string
  variables: string[]
  examples?: Array<{
    input: Record<string, string>
    output: string
  }>
}

export type PromptVariables = Record<string, string | number | boolean | string[]>

export class PromptManager {
  private templates: Map<string, PromptTemplate> = new Map()

  constructor() {
    this.loadDefaultTemplates()
  }

  /**
   * Register a prompt template
   */
  register(template: PromptTemplate): void {
    const key = `${template.vertical}:${template.id}`
    this.templates.set(key, template)
  }

  /**
   * Get a prompt template
   */
  get(vertical: Vertical | 'shared', templateId: string): PromptTemplate | undefined {
    return this.templates.get(`${vertical}:${templateId}`)
      ?? this.templates.get(`shared:${templateId}`)
  }

  /**
   * Render a prompt with variables
   */
  render(
    vertical: Vertical | 'shared',
    templateId: string,
    variables: PromptVariables
  ): { systemPrompt: string; userPrompt: string } | null {
    const template = this.get(vertical, templateId)
    if (!template) return null

    let userPrompt = template.userPromptTemplate

    for (const [key, value] of Object.entries(variables)) {
      const replacement = Array.isArray(value) ? value.join(', ') : String(value)
      userPrompt = userPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), replacement)
    }

    return {
      systemPrompt: template.systemPrompt,
      userPrompt,
    }
  }

  /**
   * List all templates for a vertical
   */
  listTemplates(vertical?: Vertical): PromptTemplate[] {
    const templates: PromptTemplate[] = []
    for (const template of this.templates.values()) {
      if (!vertical || template.vertical === vertical || template.vertical === 'shared') {
        templates.push(template)
      }
    }
    return templates
  }

  /**
   * Load default shared templates
   */
  private loadDefaultTemplates(): void {
    // Load PartyPal prompts
    Object.values(partyPalPrompts).forEach(prompt => {
      this.register(prompt)
    })

    // Load shared prompts
    // Quote Generator (shared)
    this.register({
      id: 'quote-generator',
      name: 'Quote Generator',
      version: '1.0.0',
      vertical: 'shared',
      systemPrompt: `You are a pricing expert assistant. Analyze the service request and suggest optimal pricing.
Consider market rates, complexity, timing, and client type.
Always provide 3 price tiers: economy, standard, and premium.
Include reasoning for each price point.`,
      userPromptTemplate: `Generate pricing suggestions for this request:

Service Type: {serviceType}
Location: {location}
Date: {date}
Duration: {duration}
Special Requirements: {requirements}
Client Type: {clientType}

Respond in JSON format with this structure:
{
  "economy": { "price": number, "features": string[], "reasoning": string },
  "standard": { "price": number, "features": string[], "reasoning": string },
  "premium": { "price": number, "features": string[], "reasoning": string },
  "recommendation": "economy" | "standard" | "premium",
  "recommendationReasoning": string
}`,
      variables: ['serviceType', 'location', 'date', 'duration', 'requirements', 'clientType'],
    })

    // Email Composer (shared)
    this.register({
      id: 'email-composer',
      name: 'Email Composer',
      version: '1.0.0',
      vertical: 'shared',
      systemPrompt: `You are a professional communication assistant.
Write clear, friendly, and professional emails.
Match the tone to the context (formal for business, warm for individuals).
Keep emails concise but complete.`,
      userPromptTemplate: `Compose an email with these details:

Purpose: {purpose}
Recipient: {recipientName}
Context: {context}
Key Points: {keyPoints}
Tone: {tone}
Language: {language}

Respond in JSON format:
{
  "subject": string,
  "body": string,
  "suggestedFollowUp": string
}`,
      variables: ['purpose', 'recipientName', 'context', 'keyPoints', 'tone', 'language'],
    })

    // Content Generator (shared)
    this.register({
      id: 'content-generator',
      name: 'Service Description Generator',
      version: '1.0.0',
      vertical: 'shared',
      systemPrompt: `You are a marketing copywriter specializing in service businesses.
Write compelling, SEO-friendly descriptions that highlight benefits.
Use action words and create emotional connection.`,
      userPromptTemplate: `Create a service description:

Service Name: {serviceName}
Category: {category}
Key Features: {features}
Target Audience: {targetAudience}
Unique Selling Points: {usp}
Tone: {tone}

Respond in JSON format:
{
  "headline": string,
  "shortDescription": string (max 160 chars for meta),
  "fullDescription": string,
  "keyBenefits": string[],
  "seoKeywords": string[],
  "callToAction": string
}`,
      variables: ['serviceName', 'category', 'features', 'targetAudience', 'usp', 'tone'],
    })
  }
}

export function createPromptManager(): PromptManager {
  return new PromptManager()
}

export default PromptManager
