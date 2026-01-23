/**
 * BudgetOptimizerAI - AI-powered budget allocation and cost optimization
 *
 * Analyzes event requirements and suggests optimal budget allocation
 * across performers, venue, catering, and other categories
 */

import { z } from 'zod'

export const BudgetInputSchema = z.object({
  totalBudget: z.number().positive(),
  eventType: z.enum(['corporate', 'wedding', 'festival', 'private_party', 'gala', 'concert', 'product_launch']),
  guestCount: z.number().positive(),
  priorities: z.array(z.enum(['entertainment', 'catering', 'venue', 'decor', 'technology'])),
  requirements: z.object({
    performerCount: z.number().optional(),
    cateringStyle: z.enum(['buffet', 'plated', 'cocktail', 'none']).optional(),
    venueType: z.enum(['indoor', 'outdoor', 'mixed']).optional(),
    techNeeds: z.array(z.string()).optional(),
  }).optional(),
})

export const BudgetAllocationSchema = z.object({
  breakdown: z.array(z.object({
    category: z.string(),
    allocated: z.number(),
    percentage: z.number(),
    items: z.array(z.object({
      name: z.string(),
      estimatedCost: z.number(),
      priority: z.enum(['essential', 'recommended', 'optional']),
      notes: z.string().optional(),
    })),
  })),

  summary: z.object({
    totalAllocated: z.number(),
    remainingBuffer: z.number(),
    costPerGuest: z.number(),
  }),

  recommendations: z.array(z.object({
    category: z.string(),
    suggestion: z.string(),
    potentialSavings: z.number().optional(),
  })),

  alternatives: z.array(z.object({
    scenario: z.string(),
    changes: z.array(z.string()),
    newTotal: z.number(),
  })).optional(),
})

export type BudgetInput = z.infer<typeof BudgetInputSchema>
export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>

/**
 * Generate optimized budget allocation
 */
export async function optimizeBudget(
  input: BudgetInput,
  context: { tenantId: string }
): Promise<BudgetAllocation> {
  const validated = BudgetInputSchema.parse(input)

  // TODO: Integrate with @vertigo/ai-core for intelligent allocation
  // const ai = createAIClient()
  // const response = await ai.chatStructured(...)

  return generateBudgetAllocation(validated)
}

function generateBudgetAllocation(input: BudgetInput): BudgetAllocation {
  const { totalBudget, eventType, guestCount } = input

  // Industry standard percentages (can be adjusted by AI based on priorities)
  const basePercentages = {
    corporate: {
      venue: 0.25,
      catering: 0.30,
      entertainment: 0.20,
      technology: 0.15,
      decor: 0.10,
    },
    wedding: {
      venue: 0.20,
      catering: 0.35,
      entertainment: 0.15,
      decor: 0.20,
      technology: 0.10,
    },
    festival: {
      venue: 0.15,
      entertainment: 0.40,
      catering: 0.20,
      technology: 0.15,
      decor: 0.10,
    },
    gala: {
      venue: 0.25,
      catering: 0.30,
      entertainment: 0.20,
      decor: 0.15,
      technology: 0.10,
    },
  }

  const percentages = basePercentages[eventType as keyof typeof basePercentages] || basePercentages.corporate

  // Keep 10% buffer
  const allocatableBudget = totalBudget * 0.9

  const breakdown = [
    {
      category: 'Venue',
      allocated: allocatableBudget * percentages.venue,
      percentage: percentages.venue * 100,
      items: [
        {
          name: 'Venue rental',
          estimatedCost: allocatableBudget * percentages.venue * 0.7,
          priority: 'essential' as const,
          notes: 'Main venue space',
        },
        {
          name: 'Setup & breakdown',
          estimatedCost: allocatableBudget * percentages.venue * 0.3,
          priority: 'essential' as const,
        },
      ],
    },
    {
      category: 'Entertainment',
      allocated: allocatableBudget * percentages.entertainment,
      percentage: percentages.entertainment * 100,
      items: [
        {
          name: 'Main performers',
          estimatedCost: allocatableBudget * percentages.entertainment * 0.7,
          priority: 'essential' as const,
        },
        {
          name: 'Background entertainment',
          estimatedCost: allocatableBudget * percentages.entertainment * 0.3,
          priority: 'recommended' as const,
        },
      ],
    },
    {
      category: 'Catering',
      allocated: allocatableBudget * percentages.catering,
      percentage: percentages.catering * 100,
      items: [
        {
          name: 'Food service',
          estimatedCost: allocatableBudget * percentages.catering * 0.6,
          priority: 'essential' as const,
        },
        {
          name: 'Beverage service',
          estimatedCost: allocatableBudget * percentages.catering * 0.3,
          priority: 'essential' as const,
        },
        {
          name: 'Bar staff & setup',
          estimatedCost: allocatableBudget * percentages.catering * 0.1,
          priority: 'recommended' as const,
        },
      ],
    },
    {
      category: 'Technology',
      allocated: allocatableBudget * percentages.technology,
      percentage: percentages.technology * 100,
      items: [
        {
          name: 'Sound system',
          estimatedCost: allocatableBudget * percentages.technology * 0.4,
          priority: 'essential' as const,
        },
        {
          name: 'Lighting',
          estimatedCost: allocatableBudget * percentages.technology * 0.4,
          priority: 'recommended' as const,
        },
        {
          name: 'AV technician',
          estimatedCost: allocatableBudget * percentages.technology * 0.2,
          priority: 'recommended' as const,
        },
      ],
    },
    {
      category: 'Decor',
      allocated: allocatableBudget * percentages.decor,
      percentage: percentages.decor * 100,
      items: [
        {
          name: 'Floral arrangements',
          estimatedCost: allocatableBudget * percentages.decor * 0.5,
          priority: 'recommended' as const,
        },
        {
          name: 'Centerpieces',
          estimatedCost: allocatableBudget * percentages.decor * 0.3,
          priority: 'optional' as const,
        },
        {
          name: 'Signage & branding',
          estimatedCost: allocatableBudget * percentages.decor * 0.2,
          priority: 'optional' as const,
        },
      ],
    },
  ]

  const totalAllocated = breakdown.reduce((sum, cat) => sum + cat.allocated, 0)
  const costPerGuest = totalAllocated / guestCount

  return {
    breakdown,
    summary: {
      totalAllocated,
      remainingBuffer: totalBudget - totalAllocated,
      costPerGuest,
    },
    recommendations: [
      {
        category: 'Entertainment',
        suggestion: 'Book performers 3+ months in advance for better rates',
        potentialSavings: totalBudget * 0.05,
      },
      {
        category: 'Catering',
        suggestion: 'Consider buffet style for 150+ guests to reduce service costs',
        potentialSavings: totalBudget * 0.08,
      },
      {
        category: 'Technology',
        suggestion: 'Bundle sound and lighting with single vendor for discount',
        potentialSavings: totalBudget * 0.03,
      },
    ],
    alternatives: [
      {
        scenario: 'Premium Entertainment Focus',
        changes: [
          'Increase entertainment budget by 10%',
          'Reduce decor by 5%',
          'Optimize catering to buffet style',
        ],
        newTotal: totalBudget,
      },
      {
        scenario: 'Luxury Experience',
        changes: [
          'Upgrade venue tier',
          'Premium catering with plated service',
          'Extended entertainment lineup',
        ],
        newTotal: totalBudget * 1.2,
      },
    ],
  }
}
