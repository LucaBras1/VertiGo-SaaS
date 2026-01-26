/**
 * GigPriceAI - AI-powered gig pricing suggestions
 *
 * Suggests competitive pricing based on:
 * - Event type and venue
 * - Geographic location
 * - Date and time (weekday vs weekend, peak season)
 * - Band size and experience
 * - Duration and travel requirements
 * - Market rates
 */

import { z } from 'zod'
import { generateCompletion, isOpenAIAvailable } from './openai-client'

// Input schema
export const GigPriceInputSchema = z.object({
  eventType: z.enum(['wedding', 'corporate', 'party', 'concert', 'festival', 'private', 'restaurant', 'other']),
  location: z.object({
    city: z.string(),
    country: z.string().default('CZ'),
    region: z.string().optional(), // Prague, Moravia, etc.
  }),
  date: z.string(), // ISO date
  isWeekend: z.boolean().optional(),
  isPeakSeason: z.boolean().optional(), // May-September for outdoor events

  // Performance details
  duration: z.number().min(30).max(480), // Minutes
  numberOfSets: z.number().min(1).max(5).default(1),
  breakDuration: z.number().default(15),

  // Band details
  bandSize: z.number().min(1).max(20),
  experienceLevel: z.enum(['beginner', 'intermediate', 'professional', 'premium']).default('professional'),
  hasOwnPA: z.boolean().default(false),
  providesLighting: z.boolean().default(false),

  // Travel
  travelDistance: z.number().default(0), // Kilometers
  requiresAccommodation: z.boolean().default(false),

  // Additional services
  additionalServices: z.array(z.object({
    type: z.string(),
    cost: z.number().optional(),
  })).optional(),

  // Market data (optional)
  previousGigPrices: z.array(z.object({
    eventType: z.string(),
    price: z.number(),
    date: z.string(),
  })).optional(),
})

// Output schema
export const GigPricingSchema = z.object({
  currency: z.string().default('CZK'),

  // Three-tier pricing
  economy: z.object({
    basePrice: z.number(),
    travelCosts: z.number(),
    totalPrice: z.number(),
    features: z.array(z.string()),
    description: z.string(),
  }),

  standard: z.object({
    basePrice: z.number(),
    travelCosts: z.number(),
    totalPrice: z.number(),
    features: z.array(z.string()),
    description: z.string(),
    recommended: z.boolean().default(true),
  }),

  premium: z.object({
    basePrice: z.number(),
    travelCosts: z.number(),
    totalPrice: z.number(),
    features: z.array(z.string()),
    description: z.string(),
  }),

  // Pricing breakdown
  breakdown: z.object({
    baseRate: z.object({
      amount: z.number(),
      reasoning: z.string(),
    }),
    multipliers: z.array(z.object({
      factor: z.string(),
      multiplier: z.number(),
      impact: z.string(),
    })),
    additionalCosts: z.array(z.object({
      item: z.string(),
      amount: z.number(),
    })),
  }),

  // Market analysis
  marketAnalysis: z.object({
    averageForEventType: z.number().optional(),
    competitiveRange: z.object({
      low: z.number(),
      high: z.number(),
    }),
    yourPositioning: z.string(),
    marketFactors: z.array(z.string()),
  }),

  // Recommendations
  recommendations: z.array(z.string()),

  // Negotiation tips
  negotiationTips: z.array(z.string()).optional(),
})

export type GigPriceInput = z.infer<typeof GigPriceInputSchema>
export type GigPricing = z.infer<typeof GigPricingSchema>

/**
 * Calculate gig pricing with AI-powered market analysis
 */
export async function calculateGigPrice(
  input: GigPriceInput,
  context: { tenantId: string }
): Promise<GigPricing> {
  const validatedInput = GigPriceInputSchema.parse(input)

  // Use rule-based calculation for core pricing
  const pricing = calculatePricingTiers(validatedInput)

  // Optionally enhance with AI insights
  if (isOpenAIAvailable()) {
    try {
      const systemPrompt = buildPricingSystemPrompt()
      const userPrompt = buildPricingUserPrompt(validatedInput)

      const aiInsights = await generateCompletion(
        systemPrompt,
        userPrompt + `\n\nBased on these calculated prices:
- Economy: ${pricing.economy.totalPrice} ${pricing.currency}
- Standard: ${pricing.standard.totalPrice} ${pricing.currency}
- Premium: ${pricing.premium.totalPrice} ${pricing.currency}

Provide brief market positioning insights and negotiation tips (2-3 sentences each).`,
        {
          temperature: 0.7,
          maxTokens: 500,
        }
      )

      if (aiInsights) {
        // Append AI insights to recommendations
        pricing.recommendations.push(`AI Insight: ${aiInsights}`)
        console.log('[GigPriceAI] Enhanced pricing with OpenAI insights')
      }
    } catch (error) {
      console.error('[GigPriceAI] Failed to get AI insights:', error)
      // Continue with rule-based pricing
    }
  }

  return pricing
}

function buildPricingSystemPrompt(): string {
  return `You are an expert music business consultant and band manager with deep knowledge of the live music market.

Your expertise includes:
- Current market rates across different event types and regions
- Factors that influence pricing (experience, equipment, travel, etc.)
- Pricing psychology and positioning strategies
- Competitive analysis and differentiation
- Negotiation tactics

Pricing principles:
1. VALUE-BASED: Price reflects the value delivered, not just time
2. MARKET-AWARE: Consider regional rates and competition
3. TIERED OPTIONS: Offer economy, standard, and premium tiers
4. TRANSPARENT: Clear breakdown of what's included
5. FLEXIBLE: Room for negotiation while protecting margins

Event type multipliers (baseline = 1.0):
- Restaurant/Background music: 0.7-0.9
- Private party: 0.9-1.1
- Wedding: 1.2-1.5 (premium event)
- Corporate: 1.1-1.4 (professional requirement)
- Concert/Festival: 1.0-1.3 (exposure value)

Experience multipliers:
- Beginner: 0.6-0.8
- Intermediate: 0.8-1.0
- Professional: 1.0-1.2
- Premium: 1.3-1.8

Consider regional factors, seasonality, and band-specific value propositions.`
}

function buildPricingUserPrompt(input: GigPriceInput): string {
  return `Calculate pricing for a ${input.eventType} gig:

EVENT DETAILS:
- Location: ${input.location.city}, ${input.location.country}
- Date: ${input.date} (${input.isWeekend ? 'Weekend' : 'Weekday'})
- Peak Season: ${input.isPeakSeason ? 'Yes' : 'No'}

PERFORMANCE:
- Duration: ${input.duration} minutes (${input.numberOfSets} sets)
- Band Size: ${input.bandSize} members
- Experience Level: ${input.experienceLevel}
- Own PA: ${input.hasOwnPA ? 'Yes' : 'No'}
- Lighting: ${input.providesLighting ? 'Yes' : 'No'}

LOGISTICS:
- Travel Distance: ${input.travelDistance} km
- Accommodation Needed: ${input.requiresAccommodation ? 'Yes' : 'No'}

${input.additionalServices?.length ? `ADDITIONAL SERVICES:\n${input.additionalServices.map(s => `- ${s.type}`).join('\n')}` : ''}

${input.previousGigPrices?.length ? `PREVIOUS PRICING DATA:\n${input.previousGigPrices.map(p => `- ${p.eventType}: ${p.price} CZK (${p.date})`).join('\n')}` : ''}

Provide three pricing tiers (Economy, Standard, Premium) with:
1. Detailed pricing breakdown
2. Market analysis and competitive positioning
3. Recommendations for positioning and negotiation
4. Clear value propositions for each tier`
}

function calculatePricingTiers(input: GigPriceInput): GigPricing {
  // Base rates per hour by experience level (CZK)
  const hourlyRates: Record<string, number> = {
    beginner: 3000,
    intermediate: 5000,
    professional: 8000,
    premium: 12000,
  }

  const baseHourlyRate = hourlyRates[input.experienceLevel]
  const hours = input.duration / 60

  // Calculate base price
  let basePrice = baseHourlyRate * hours * input.bandSize

  // Event type multipliers
  const eventMultipliers: Record<string, number> = {
    wedding: 1.4,
    corporate: 1.3,
    festival: 1.2,
    concert: 1.1,
    party: 1.0,
    private: 1.0,
    restaurant: 0.8,
    other: 1.0,
  }

  basePrice *= eventMultipliers[input.eventType] || 1.0

  // Weekend premium
  if (input.isWeekend) {
    basePrice *= 1.2
  }

  // Peak season premium
  if (input.isPeakSeason) {
    basePrice *= 1.15
  }

  // Equipment premium
  if (input.hasOwnPA) {
    basePrice *= 1.25 // +25% for providing sound system
  }

  if (input.providesLighting) {
    basePrice *= 1.15 // +15% for providing lights
  }

  // Calculate travel costs
  const travelCosts = calculateTravelCosts(
    input.travelDistance,
    input.requiresAccommodation,
    input.bandSize
  )

  // Calculate three tiers
  const economy = {
    basePrice: Math.round(basePrice * 0.75),
    travelCosts: Math.round(travelCosts * 0.8),
    totalPrice: Math.round(basePrice * 0.75 + travelCosts * 0.8),
    features: [
      `${input.numberOfSets} set(s) of ${input.duration} minutes`,
      `${input.bandSize}-piece band`,
      'Standard repertoire',
      ...(input.hasOwnPA ? ['Basic PA system'] : []),
    ],
    description: 'Budget-friendly option with core performance',
  }

  const standard = {
    basePrice: Math.round(basePrice),
    travelCosts,
    totalPrice: Math.round(basePrice + travelCosts),
    features: [
      `${input.numberOfSets} set(s) of ${input.duration} minutes`,
      `${input.bandSize}-piece band`,
      'Custom setlist creation',
      'Pre-event consultation',
      ...(input.hasOwnPA ? ['Professional PA system'] : []),
      ...(input.providesLighting ? ['Stage lighting'] : []),
      'Basic sound engineering',
    ],
    description: 'Recommended package with professional service',
    recommended: true,
  }

  const premium = {
    basePrice: Math.round(basePrice * 1.35),
    travelCosts: Math.round(travelCosts * 1.1),
    totalPrice: Math.round(basePrice * 1.35 + travelCosts * 1.1),
    features: [
      ...standard.features,
      'AI-generated custom setlist',
      'Detailed technical rider',
      'Dedicated sound engineer',
      'Extended soundcheck time',
      'Backup equipment',
      'Post-event recording',
    ],
    description: 'Premium experience with full technical support',
  }

  // Market analysis
  const competitiveRange = {
    low: Math.round(basePrice * 0.7),
    high: Math.round(basePrice * 1.5),
  }

  const pricing: GigPricing = {
    currency: 'CZK',
    economy,
    standard,
    premium,

    breakdown: {
      baseRate: {
        amount: Math.round(baseHourlyRate * input.bandSize),
        reasoning: `${baseHourlyRate} CZK/hour × ${input.bandSize} members × ${hours.toFixed(1)} hours`,
      },
      multipliers: [
        {
          factor: 'Event type',
          multiplier: eventMultipliers[input.eventType],
          impact: `${input.eventType} events command ${((eventMultipliers[input.eventType] - 1) * 100).toFixed(0)}% premium`,
        },
        ...(input.isWeekend ? [{
          factor: 'Weekend',
          multiplier: 1.2,
          impact: '20% premium for weekend booking',
        }] : []),
        ...(input.isPeakSeason ? [{
          factor: 'Peak season',
          multiplier: 1.15,
          impact: '15% premium for peak season',
        }] : []),
        ...(input.hasOwnPA ? [{
          factor: 'PA system provided',
          multiplier: 1.25,
          impact: '25% premium for providing sound system',
        }] : []),
      ],
      additionalCosts: [
        ...(travelCosts > 0 ? [{
          item: `Travel (${input.travelDistance} km${input.requiresAccommodation ? ' + accommodation' : ''})`,
          amount: travelCosts,
        }] : []),
      ],
    },

    marketAnalysis: {
      competitiveRange,
      yourPositioning: 'Mid-to-high tier professional service',
      marketFactors: [
        `${input.location.city} is a ${getMarketTier(input.location.city)} market`,
        `${input.eventType} events typically range ${formatCurrency(competitiveRange.low)}-${formatCurrency(competitiveRange.high)}`,
        input.experienceLevel === 'premium' ? 'Your premium positioning justifies higher rates' : '',
        input.isWeekend ? 'Weekend dates command 15-25% premium' : '',
      ].filter(Boolean),
    },

    recommendations: [
      `Lead with Standard package (${formatCurrency(standard.totalPrice)}) - best value proposition`,
      economy.totalPrice < 15000 ? 'Economy tier may be too low for perceived value' : 'Economy tier provides competitive entry point',
      `Emphasize ${input.hasOwnPA ? 'professional PA system' : 'experienced performance'} as key differentiator`,
      input.experienceLevel === 'professional' || input.experienceLevel === 'premium' ?
        'Highlight experience and past performances to justify premium pricing' : '',
      'Offer flexible payment terms (deposit + balance) to ease decision',
    ].filter(Boolean),

    negotiationTips: [
      'Start with Standard tier, have Economy as fallback',
      'Bundle value-adds (custom setlist, consultation) rather than discounting price',
      `If asked to lower price, remove features rather than discount (e.g., fewer sets, shorter duration)`,
      'Emphasize scarcity for peak dates',
      `For ${input.eventType} events, stress reliability and professionalism over price`,
    ],
  }

  return pricing
}

function calculateTravelCosts(distance: number, accommodation: boolean, bandSize: number): number {
  if (distance === 0) return 0

  // Fuel costs: 8 CZK/km (typical van/minibus)
  const fuelCosts = distance * 2 * 8 // Round trip

  // Accommodation: 800 CZK per person per night
  const accommodationCosts = accommodation ? bandSize * 800 : 0

  // Driver time/wear: 100 CZK per hour (estimate 60km/h avg)
  const driverCosts = (distance * 2 / 60) * 100

  return Math.round(fuelCosts + accommodationCosts + driverCosts)
}

function getMarketTier(city: string): string {
  const premiumCities = ['prague', 'praha', 'brno', 'vienna', 'wien']
  const midTierCities = ['ostrava', 'plzen', 'liberec', 'olomouc']

  const cityLower = city.toLowerCase()

  if (premiumCities.some(c => cityLower.includes(c))) return 'premium'
  if (midTierCities.some(c => cityLower.includes(c))) return 'mid-tier'
  return 'regional'
}

function formatCurrency(amount: number, currency: string = 'CZK'): string {
  return `${amount.toLocaleString('cs-CZ')} ${currency}`
}

/**
 * Calculate deposit amount (typically 30-50% of total)
 */
export function calculateDeposit(totalPrice: number, percentage: number = 30): number {
  return Math.round(totalPrice * (percentage / 100))
}

/**
 * Generate payment schedule
 */
export function generatePaymentSchedule(
  totalPrice: number,
  gigDate: string
): Array<{ description: string; amount: number; dueDate: string }> {
  const deposit = calculateDeposit(totalPrice, 30)
  const balance = totalPrice - deposit

  const gigDateObj = new Date(gigDate)
  const depositDueDate = new Date()
  depositDueDate.setDate(depositDueDate.getDate() + 7) // 7 days to pay deposit

  return [
    {
      description: 'Booking deposit (30%)',
      amount: deposit,
      dueDate: depositDueDate.toISOString().split('T')[0],
    },
    {
      description: 'Balance payment (70%)',
      amount: balance,
      dueDate: gigDate, // Due on gig day
    },
  ]
}
