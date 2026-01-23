/**
 * GuestExperienceAnalyzerAI - Predict and optimize guest satisfaction
 *
 * Analyzes event components to predict guest satisfaction and
 * suggests improvements for better experience
 */

import { z } from 'zod'

export const ExperienceInputSchema = z.object({
  event: z.object({
    type: z.string(),
    duration: z.number(), // minutes
    guestCount: z.number(),
    guestProfile: z.enum(['corporate', 'social', 'mixed']),
  }),

  components: z.object({
    entertainment: z.array(z.object({
      type: z.string(),
      duration: z.number(),
      interactivity: z.enum(['passive', 'semi-active', 'interactive']),
    })),

    catering: z.object({
      style: z.enum(['buffet', 'plated', 'cocktail', 'food_trucks']),
      quality: z.enum(['standard', 'premium', 'luxury']),
    }),

    venue: z.object({
      ambiance: z.enum(['casual', 'elegant', 'modern', 'rustic']),
      comfort: z.number().min(1).max(10),
    }),

    logistics: z.object({
      parkingAvailable: z.boolean(),
      accessibleVenue: z.boolean(),
      waitingAreas: z.boolean(),
    }),
  }),

  timing: z.object({
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
    dayOfWeek: z.enum(['weekday', 'weekend']),
  }),
})

export const ExperienceAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),

  categoryScores: z.object({
    entertainment: z.number().min(0).max(100),
    catering: z.number().min(0).max(100),
    venue: z.number().min(0).max(100),
    logistics: z.number().min(0).max(100),
    timing: z.number().min(0).max(100),
  }),

  strengths: z.array(z.object({
    category: z.string(),
    description: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
  })),

  improvements: z.array(z.object({
    category: z.string(),
    issue: z.string(),
    suggestion: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    expectedImpact: z.string(),
  })),

  guestJourney: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    satisfaction: z.enum(['excellent', 'good', 'neutral', 'poor']),
    notes: z.string(),
  })),

  predictedOutcomes: z.object({
    satisfactionRate: z.number().min(0).max(100),
    engagementLevel: z.enum(['very_high', 'high', 'moderate', 'low']),
    memorability: z.enum(['unforgettable', 'memorable', 'pleasant', 'forgettable']),
    likelyRecommendation: z.number().min(0).max(100),
  }),
})

export type ExperienceInput = z.infer<typeof ExperienceInputSchema>
export type ExperienceAnalysis = z.infer<typeof ExperienceAnalysisSchema>

/**
 * Analyze guest experience and provide recommendations
 */
export async function analyzeGuestExperience(
  input: ExperienceInput,
  context: { tenantId: string }
): Promise<ExperienceAnalysis> {
  const validated = ExperienceInputSchema.parse(input)

  // TODO: Integrate with @vertigo/ai-core
  // Use ML model trained on past event feedback

  return generateExperienceAnalysis(validated)
}

function generateExperienceAnalysis(input: ExperienceInput): ExperienceAnalysis {
  const { event, components, timing } = input

  // Calculate category scores (simplified algorithm)
  const entertainmentScore = calculateEntertainmentScore(components.entertainment, event.duration)
  const cateringScore = calculateCateringScore(components.catering, event.guestProfile)
  const venueScore = components.venue.comfort * 10
  const logisticsScore = calculateLogisticsScore(components.logistics)
  const timingScore = calculateTimingScore(timing, event.type)

  const overallScore =
    (entertainmentScore * 0.3 +
      cateringScore * 0.25 +
      venueScore * 0.2 +
      logisticsScore * 0.15 +
      timingScore * 0.1)

  return {
    overallScore: Math.round(overallScore),

    categoryScores: {
      entertainment: Math.round(entertainmentScore),
      catering: Math.round(cateringScore),
      venue: Math.round(venueScore),
      logistics: Math.round(logisticsScore),
      timing: Math.round(timingScore),
    },

    strengths: [
      {
        category: 'Entertainment',
        description: 'Diverse entertainment lineup maintains guest engagement',
        impact: 'high',
      },
      {
        category: 'Catering',
        description: 'Premium catering quality enhances overall experience',
        impact: 'high',
      },
    ],

    improvements: [
      {
        category: 'Logistics',
        issue: 'Limited parking may cause arrival stress',
        suggestion: 'Arrange shuttle service or valet parking',
        priority: 'high',
        expectedImpact: '+8% satisfaction',
      },
      {
        category: 'Entertainment',
        issue: 'Long passive entertainment segment',
        suggestion: 'Add interactive element or break into shorter segments',
        priority: 'medium',
        expectedImpact: '+5% engagement',
      },
      {
        category: 'Venue',
        issue: 'Comfort rating could be improved',
        suggestion: 'Add lounge areas and ensure adequate seating',
        priority: 'medium',
        expectedImpact: '+6% overall satisfaction',
      },
    ],

    guestJourney: [
      {
        phase: 'Arrival',
        duration: '15-30 minutes',
        satisfaction: 'good',
        notes: 'Welcoming atmosphere, but parking logistics need attention',
      },
      {
        phase: 'Welcome & Networking',
        duration: '30-45 minutes',
        satisfaction: 'excellent',
        notes: 'Interactive entertainment creates great atmosphere',
      },
      {
        phase: 'Main Program',
        duration: '90-120 minutes',
        satisfaction: 'excellent',
        notes: 'Well-paced entertainment and quality catering',
      },
      {
        phase: 'Closing',
        duration: '15-30 minutes',
        satisfaction: 'good',
        notes: 'Strong finale but exit logistics could be smoother',
      },
    ],

    predictedOutcomes: {
      satisfactionRate: Math.round(overallScore),
      engagementLevel: overallScore > 85 ? 'very_high' : overallScore > 70 ? 'high' : 'moderate',
      memorability: overallScore > 85 ? 'unforgettable' : overallScore > 70 ? 'memorable' : 'pleasant',
      likelyRecommendation: Math.round(overallScore * 0.9), // Typically slightly lower than satisfaction
    },
  }
}

function calculateEntertainmentScore(
  entertainment: ExperienceInput['components']['entertainment'],
  eventDuration: number
): number {
  if (entertainment.length === 0) return 40

  // More variety = better
  const varietyScore = Math.min(entertainment.length * 15, 40)

  // Interactive content scores higher
  const interactivityBonus = entertainment.filter(e => e.interactivity === 'interactive').length * 10

  // Good pacing (entertainment should be ~40-60% of event)
  const totalEntertainmentTime = entertainment.reduce((sum, e) => sum + e.duration, 0)
  const ratio = totalEntertainmentTime / eventDuration
  const pacingScore = ratio >= 0.4 && ratio <= 0.6 ? 30 : 20

  return Math.min(varietyScore + interactivityBonus + pacingScore, 100)
}

function calculateCateringScore(
  catering: ExperienceInput['components']['catering'],
  guestProfile: string
): number {
  const qualityScores = { standard: 60, premium: 80, luxury: 95 }
  const baseScore = qualityScores[catering.quality]

  // Style matching
  const styleBonus =
    (guestProfile === 'corporate' && catering.style === 'plated') ||
    (guestProfile === 'social' && catering.style === 'buffet')
      ? 10
      : 0

  return Math.min(baseScore + styleBonus, 100)
}

function calculateLogisticsScore(logistics: ExperienceInput['components']['logistics']): number {
  let score = 60 // Base score

  if (logistics.parkingAvailable) score += 15
  if (logistics.accessibleVenue) score += 15
  if (logistics.waitingAreas) score += 10

  return Math.min(score, 100)
}

function calculateTimingScore(
  timing: ExperienceInput['timing'],
  eventType: string
): number {
  let score = 70 // Base score

  // Evening events for galas/corporate
  if (
    (eventType === 'gala' || eventType === 'corporate') &&
    timing.timeOfDay === 'evening'
  ) {
    score += 20
  }

  // Weekend bonus for social events
  if (timing.dayOfWeek === 'weekend' && eventType !== 'corporate') {
    score += 10
  }

  return Math.min(score, 100)
}
