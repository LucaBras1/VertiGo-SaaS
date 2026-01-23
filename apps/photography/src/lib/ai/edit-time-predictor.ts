/**
 * EditTimePredictorAI - AI-powered editing time estimation
 *
 * Provides realistic editing time estimates based on:
 * - Shot count and event type
 * - Editing style complexity
 * - Photographer's historical data
 * - Industry benchmarks
 */

import { z } from 'zod'

// Input schema
export const EditTimeInputSchema = z.object({
  shotCount: z.number().min(1),
  eventType: z.enum(['wedding', 'portrait', 'corporate', 'family', 'product', 'newborn', 'maternity', 'event', 'other']),

  editingComplexity: z.enum(['basic', 'standard', 'advanced', 'extensive']).default('standard'),

  workflow: z.object({
    cullingDone: z.boolean().default(false),
    colorCorrectionOnly: z.boolean().default(false),
    includeRetouching: z.boolean().default(true),
    includeAlbumDesign: z.boolean().default(false),
  }).optional(),

  photographerSpeed: z.enum(['fast', 'average', 'meticulous']).default('average'),

  // Optional: Historical data
  historicalAverageTime: z.number().optional(), // Minutes per photo
})

// Output schema
export const EditTimeOutputSchema = z.object({
  estimatedHours: z.number(),

  breakdown: z.object({
    culling: z.object({
      hours: z.number(),
      description: z.string(),
    }),
    basicEdits: z.object({
      hours: z.number(),
      description: z.string(),
    }),
    advancedEdits: z.object({
      hours: z.number(),
      description: z.string(),
    }).optional(),
    albumDesign: z.object({
      hours: z.number(),
      description: z.string(),
    }).optional(),
  }),

  deliveryDate: z.object({
    turnaroundDays: z.number(),
    suggestedDate: z.string(), // ISO date string
    rushAvailable: z.boolean(),
    rushDays: z.number().optional(),
  }),

  recommendations: z.array(z.string()),

  industryBenchmark: z.object({
    averageMinutesPerPhoto: z.number(),
    yourEstimate: z.number(),
    comparison: z.string(), // "faster", "average", "slower"
  }),

  tips: z.array(z.string()),
})

export type EditTimeInput = z.infer<typeof EditTimeInputSchema>
export type EditTimeOutput = z.infer<typeof EditTimeOutputSchema>

/**
 * EditTimePredictorAI Service
 */
export class EditTimePredictorAI {
  /**
   * Estimate realistic editing time
   */
  async estimateEditingTime(
    input: EditTimeInput,
    context: { tenantId: string }
  ): Promise<EditTimeOutput> {
    const validatedInput = EditTimeInputSchema.parse(input)

    // Calculate base estimate using rule-based logic
    const baseEstimate = this.calculateEditingTime(validatedInput)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set, returning base calculation')
      return baseEstimate
    }

    try {
      // Use AI to enhance recommendations and tips
      const { createAIClient } = await import('@vertigo/ai-core')
      const ai = createAIClient({
        apiKey,
        defaultModel: 'gpt-4o-mini',
        cache: { enabled: true, ttlMs: 600000 },
        rateLimit: { enabled: true, requestsPerMinute: 60 }
      })

      const systemPrompt = `You are an expert photography workflow consultant.
Analyze editing time estimates and provide personalized recommendations.
Consider the photographer's speed preference and event type when giving advice.`

      const userPrompt = `A photographer needs to edit ${validatedInput.shotCount} photos from a ${validatedInput.eventType} shoot.

Details:
- Editing complexity: ${validatedInput.editingComplexity}
- Photographer speed: ${validatedInput.photographerSpeed}
- Culling done: ${validatedInput.workflow?.cullingDone ? 'Yes' : 'No'}
- Album design needed: ${validatedInput.workflow?.includeAlbumDesign ? 'Yes' : 'No'}
${validatedInput.historicalAverageTime ? `- Historical average: ${validatedInput.historicalAverageTime} min/photo` : ''}

Base estimate: ${baseEstimate.estimatedHours} hours

Provide 3-5 specific, actionable recommendations and efficiency tips for this project.`

      const response = await ai.chat<string>(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        { tenantId: context.tenantId, vertical: 'photography' },
        { model: 'gpt-4o-mini', temperature: 0.7 }
      )

      // Parse AI suggestions and merge with base estimate
      const aiSuggestions = response.data.split('\n').filter(line =>
        line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim())
      ).map(line => line.replace(/^[-•\d.]+\s*/, '').trim()).filter(Boolean)

      return {
        ...baseEstimate,
        recommendations: aiSuggestions.length > 0 ? aiSuggestions.slice(0, 5) : baseEstimate.recommendations,
        tips: aiSuggestions.length > 5 ? aiSuggestions.slice(5, 10) : baseEstimate.tips
      }
    } catch (error) {
      console.error('AI edit time enhancement failed, using base calculation:', error)
      return baseEstimate
    }
  }

  private calculateEditingTime(input: EditTimeInput): EditTimeOutput {
    const { shotCount, eventType, editingComplexity, workflow, photographerSpeed } = input

    // Base minutes per photo by editing complexity
    const baseTimeMap = {
      basic: 2,      // Quick color correction only
      standard: 5,   // Standard editing workflow
      advanced: 10,  // Detailed retouching
      extensive: 20, // Heavy manipulation/compositing
    }

    const baseMinutesPerPhoto = baseTimeMap[editingComplexity]

    // Event type multiplier (some events need more careful editing)
    const eventMultiplier = {
      wedding: 1.2,      // High importance, careful selection
      portrait: 1.3,     // Detailed skin retouching
      corporate: 0.9,    // Less creative editing
      family: 1.0,       // Standard workflow
      product: 1.5,      // Precision required
      newborn: 1.4,      // Safety compositing sometimes
      maternity: 1.1,    // Beauty retouching
      event: 0.8,        // Volume over perfection
      other: 1.0,
    }

    const multiplier = eventMultiplier[eventType]

    // Photographer speed adjustment
    const speedMultiplier = {
      fast: 0.7,
      average: 1.0,
      meticulous: 1.3,
    }

    const speedAdjustment = speedMultiplier[photographerSpeed]

    // Calculate culling time (if not done)
    const cullingHours = workflow?.cullingDone ? 0 : this.calculateCullingTime(shotCount, eventType)

    // Calculate base editing time
    const editingMinutes = shotCount * baseMinutesPerPhoto * multiplier * speedAdjustment
    const editingHours = editingMinutes / 60

    // Split into basic and advanced if applicable
    const basicEditingHours = editingComplexity === 'basic' || workflow?.colorCorrectionOnly
      ? editingHours
      : editingHours * 0.6

    const advancedEditingHours = editingComplexity !== 'basic' && !workflow?.colorCorrectionOnly
      ? editingHours * 0.4
      : undefined

    // Album design time (if requested)
    const albumDesignHours = workflow?.includeAlbumDesign
      ? this.calculateAlbumDesignTime(shotCount)
      : undefined

    // Total hours
    const totalHours = cullingHours + editingHours + (albumDesignHours || 0)

    // Calculate delivery date
    const turnaroundDays = this.calculateTurnaroundDays(totalHours, eventType)
    const suggestedDate = this.addBusinessDays(new Date(), turnaroundDays)

    // Industry benchmarks
    const industryAverage = this.getIndustryBenchmark(eventType)
    const yourMinutesPerPhoto = editingMinutes / shotCount
    const comparison = yourMinutesPerPhoto < industryAverage * 0.9 ? 'faster'
      : yourMinutesPerPhoto > industryAverage * 1.1 ? 'slower'
      : 'average'

    return {
      estimatedHours: Math.round(totalHours * 10) / 10,

      breakdown: {
        culling: {
          hours: Math.round(cullingHours * 10) / 10,
          description: workflow?.cullingDone
            ? 'Already completed'
            : `Review ${shotCount} photos, select best ${Math.round(shotCount * 0.3)} for editing`,
        },
        basicEdits: {
          hours: Math.round(basicEditingHours * 10) / 10,
          description: 'Exposure, white balance, color correction, cropping',
        },
        advancedEdits: advancedEditingHours ? {
          hours: Math.round(advancedEditingHours * 10) / 10,
          description: 'Skin retouching, blemish removal, advanced color grading',
        } : undefined,
        albumDesign: albumDesignHours ? {
          hours: Math.round(albumDesignHours * 10) / 10,
          description: 'Album layout design, photo selection and sequencing',
        } : undefined,
      },

      deliveryDate: {
        turnaroundDays,
        suggestedDate: suggestedDate.toISOString().split('T')[0],
        rushAvailable: turnaroundDays > 7,
        rushDays: turnaroundDays > 7 ? Math.ceil(turnaroundDays / 2) : undefined,
      },

      recommendations: this.generateRecommendations(input, totalHours),

      industryBenchmark: {
        averageMinutesPerPhoto: industryAverage,
        yourEstimate: Math.round(yourMinutesPerPhoto * 10) / 10,
        comparison,
      },

      tips: this.generateEfficiencyTips(editingComplexity, eventType),
    }
  }

  private calculateCullingTime(shotCount: number, eventType: string): number {
    // Culling is typically 20-30% of total time for weddings, less for others
    const cullingMinutes = eventType === 'wedding'
      ? shotCount * 0.5  // 30 seconds per photo review
      : shotCount * 0.3  // 18 seconds per photo review

    return cullingMinutes / 60
  }

  private calculateAlbumDesignTime(shotCount: number): number {
    // Album design: ~2-4 hours base + time per spread
    const spreads = Math.ceil(shotCount / 2)
    const minutesPerSpread = 10
    const baseHours = 2
    return baseHours + (spreads * minutesPerSpread / 60)
  }

  private calculateTurnaroundDays(totalHours: number, eventType: string): number {
    // Assume 4 productive editing hours per day
    const editingDaysNeeded = Math.ceil(totalHours / 4)

    // Add buffer based on event type priority
    const bufferMultiplier = eventType === 'wedding' ? 1.5 : 1.2
    const totalDays = Math.ceil(editingDaysNeeded * bufferMultiplier)

    // Minimum turnaround based on event type
    const minimumDays = {
      wedding: 14,
      portrait: 7,
      corporate: 5,
      family: 7,
      product: 5,
      newborn: 10,
      maternity: 7,
      event: 7,
      other: 7,
    }

    return Math.max(totalDays, minimumDays[eventType as keyof typeof minimumDays] || 7)
  }

  private addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date)
    let addedDays = 0

    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      // Skip weekends
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++
      }
    }

    return result
  }

  private getIndustryBenchmark(eventType: string): number {
    // Industry average minutes per photo
    const benchmarks = {
      wedding: 5,
      portrait: 8,
      corporate: 3,
      family: 5,
      product: 12,
      newborn: 10,
      maternity: 7,
      event: 3,
      other: 5,
    }

    return benchmarks[eventType as keyof typeof benchmarks] || 5
  }

  private generateRecommendations(input: EditTimeInput, totalHours: number): string[] {
    const recommendations: string[] = []

    if (totalHours > 40) {
      recommendations.push('Consider hiring an editing assistant for large projects')
    }

    if (!input.workflow?.cullingDone) {
      recommendations.push('Pre-cull in-camera during shooting to reduce editing time')
    }

    if (input.editingComplexity === 'extensive') {
      recommendations.push('Batch process similar shots to save time on repetitive edits')
    }

    if (input.shotCount > 500) {
      recommendations.push('Use presets and synchronization for consistent batch editing')
    }

    recommendations.push('Set client expectations early with realistic delivery dates')

    return recommendations
  }

  private generateEfficiencyTips(complexity: string, eventType: string): string[] {
    const tips: string[] = [
      'Create and use custom presets for consistent editing',
      'Edit in batches by lighting condition or scene',
      'Use keyboard shortcuts to speed up workflow',
    ]

    if (complexity === 'advanced' || complexity === 'extensive') {
      tips.push('Use frequency separation for efficient skin retouching')
      tips.push('Consider outsourcing heavy retouching for large projects')
    }

    if (eventType === 'wedding') {
      tips.push('Prioritize key moments first (ceremony, first kiss, first dance)')
      tips.push('Sync similar shots for consistent group photo editing')
    }

    return tips
  }
}

/**
 * Create EditTimePredictorAI instance
 */
export function createEditTimePredictorAI(): EditTimePredictorAI {
  return new EditTimePredictorAI()
}

/**
 * Quick estimate for common scenarios
 */
export function quickEstimate(shotCount: number, eventType: string): number {
  const predictor = new EditTimePredictorAI()
  const result = predictor['calculateEditingTime']({
    shotCount,
    eventType: eventType as any,
    editingComplexity: 'standard',
    photographerSpeed: 'average',
  })
  return result.estimatedHours
}
