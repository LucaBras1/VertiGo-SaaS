/**
 * AI Features for PartyPal
 * Wrappers for @vertigo/ai-core prompts with fallback for missing API key
 */

import { createAIClient, createPromptManager, type AIClient } from '@vertigo/ai-core'

// Check if AI is available
function isAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}

// Lazy-load AI client to avoid build-time errors
let _ai: AIClient | null = null
function getAIClient(): AIClient {
  if (!_ai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    _ai = createAIClient({ apiKey })
  }
  return _ai
}

const prompts = createPromptManager()

export interface AgeOptimizerInput {
  ageGroup: 'TODDLER_3_5' | 'KIDS_6_9' | 'TWEENS_10_12' | 'TEENS_13_PLUS'
  currentProgram: any[]
  guestCount: number
  duration: number
  venueType: string
}

export interface AgeOptimizerOutput {
  modifications: Array<{
    activityId: string
    suggestedChanges: string[]
    reasoning: string
  }>
  timingAdjustments: Array<{
    activityId: string
    originalDuration: number
    recommendedDuration: number
    reasoning: string
  }>
  safetyConsiderations: string[]
  engagementStrategies: string[]
  backupActivities: string[]
}

export async function optimizeForAge(
  input: AgeOptimizerInput,
  tenantId: string = 'default'
): Promise<AgeOptimizerOutput> {
  const rendered = prompts.render('kids_entertainment', 'age-optimizer', {
    ageGroup: input.ageGroup,
    currentProgram: JSON.stringify(input.currentProgram, null, 2),
    guestCount: input.guestCount.toString(),
    duration: input.duration.toString(),
    venueType: input.venueType,
  })

  if (!rendered) {
    throw new Error('Failed to render age optimizer prompt')
  }

  const response = await getAIClient().chat(
    [
      { role: 'system', content: rendered.systemPrompt },
      { role: 'user', content: rendered.userPrompt },
    ],
    {
      tenantId,
      vertical: 'kids_entertainment',
    },
    {
      model: 'gpt-4o',
      temperature: 0.7,
      responseFormat: 'json',
    }
  )

  return JSON.parse(response.data as string)
}

export interface SafetyCheckInput {
  activities: any[]
  allergies: string[]
  ageMin: number
  ageMax: number
  guestCount: number
  venueType: string
  specialNeeds?: string
}

export interface SafetyCheckOutput {
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  activityRisks: Array<{
    activityId: string
    activityName: string
    physicalSafety: {
      risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
      concerns: string[]
      mitigations: string[]
    }
    allergenConcerns: {
      risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
      allergens: string[]
      mitigations: string[]
    }
    supervisionNeeded: boolean
    ageAppropriate: boolean
    recommendations: string[]
  }>
  generalRecommendations: string[]
  emergencyPreparations: string[]
}

export async function checkSafety(
  input: SafetyCheckInput,
  tenantId: string = 'default'
): Promise<SafetyCheckOutput> {
  // If AI is not available, return a fallback response
  if (!isAIAvailable()) {
    console.warn('[AI] OPENAI_API_KEY not set - using fallback safety check')
    return generateFallbackSafetyCheck(input)
  }

  const rendered = prompts.render('kids_entertainment', 'safety-checker', {
    activities: JSON.stringify(input.activities, null, 2),
    allergies: input.allergies.join(', '),
    ageRange: `${input.ageMin}-${input.ageMax}`,
    guestCount: input.guestCount.toString(),
    venueType: input.venueType,
    specialNeeds: input.specialNeeds || 'None',
  })

  if (!rendered) {
    throw new Error('Failed to render safety checker prompt')
  }

  try {
    const response = await getAIClient().chat(
      [
        { role: 'system', content: rendered.systemPrompt },
        { role: 'user', content: rendered.userPrompt },
      ],
      {
        tenantId,
        vertical: 'kids_entertainment',
      },
      {
        model: 'gpt-4o',
        temperature: 0.3, // Lower temperature for safety-critical output
        responseFormat: 'json',
      }
    )

    return JSON.parse(response.data as string)
  } catch (error) {
    console.error('[AI] Safety check failed, using fallback:', error)
    return generateFallbackSafetyCheck(input)
  }
}

/**
 * Fallback safety check when AI is not available
 * Provides conservative safety recommendations based on known patterns
 */
function generateFallbackSafetyCheck(input: SafetyCheckInput): SafetyCheckOutput {
  const activityRisks = input.activities.map((activity) => {
    // Determine risk based on activity properties
    const hasAllergenConcerns = input.allergies.length > 0 &&
      (activity.allergens?.some((a: string) => input.allergies.includes(a)) ||
       activity.name?.toLowerCase().includes('food') ||
       activity.name?.toLowerCase().includes('painting'))

    const isHighEnergy = activity.energyLevel === 'high' ||
      activity.name?.toLowerCase().includes('running') ||
      activity.name?.toLowerCase().includes('jumping')

    const physicalRisk = isHighEnergy ? 'MODERATE' : 'LOW'
    const allergenRisk = hasAllergenConcerns ? 'MODERATE' : 'LOW'

    return {
      activityId: activity.id || 'unknown',
      activityName: activity.name || 'Unknown Activity',
      physicalSafety: {
        risk: physicalRisk as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
        concerns: isHighEnergy
          ? ['Vyžaduje dozor dospělého', 'Dbejte na dostatečný prostor']
          : [],
        mitigations: isHighEnergy
          ? ['Zajistěte měkký povrch', 'Omezte počet dětí najednou']
          : ['Standardní dozor'],
      },
      allergenConcerns: {
        risk: allergenRisk as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
        allergens: hasAllergenConcerns ? input.allergies : [],
        mitigations: hasAllergenConcerns
          ? ['Zkontrolujte složení materiálů', 'Mějte připraveny antihistaminika']
          : [],
      },
      supervisionNeeded: isHighEnergy || input.ageMin < 5,
      ageAppropriate: true,
      recommendations: [
        'Zajistěte první pomoc na místě',
        'Mějte po ruce kontakt na rodiče',
      ],
    }
  })

  // Determine overall risk
  const hasHighRisk = activityRisks.some(
    (r) => r.physicalSafety.risk === 'HIGH' || r.allergenConcerns.risk === 'HIGH'
  )
  const hasModeateRisk = activityRisks.some(
    (r) => r.physicalSafety.risk === 'MODERATE' || r.allergenConcerns.risk === 'MODERATE'
  )

  return {
    overallRisk: hasHighRisk ? 'MODERATE' : hasModeateRisk ? 'LOW' : 'LOW',
    activityRisks,
    generalRecommendations: [
      'Zajistěte adekvátní dozor dospělých (min. 1 dospělý na 5 dětí)',
      'Mějte připravenou lékárničku první pomoci',
      'Zkontrolujte pojištění prostoru',
      input.allergies.length > 0
        ? `Upozorněte všechny na alergie: ${input.allergies.join(', ')}`
        : 'Zeptejte se rodičů na případné alergie',
    ],
    emergencyPreparations: [
      'Mějte po ruce telefonní čísla na rodiče',
      'Zkontrolujte přístupnost pro záchrannou službu',
      'Připravte klidný prostor pro odpočinek',
      'Zajistěte dostatek tekutin',
    ],
  }
}

export interface ThemeSuggesterInput {
  childAge: number
  childInterests: string[]
  childGender?: string
  budgetLevel: 'economy' | 'standard' | 'premium'
  venueType: string
  season: string
  guestCount: number
}

export interface ThemeSuggestion {
  themeName: string
  tagline: string
  matchReasoning: string
  activities: string[]
  decorationIdeas: string[]
  characterSuggestions: string[]
  estimatedBudget: string
  complexity: 'simple' | 'moderate' | 'elaborate'
}

export async function suggestThemes(
  input: ThemeSuggesterInput,
  tenantId: string = 'default'
): Promise<ThemeSuggestion[]> {
  const rendered = prompts.render('kids_entertainment', 'theme-suggester', {
    childAge: input.childAge.toString(),
    childInterests: input.childInterests.join(', '),
    childGender: input.childGender || 'any',
    budgetLevel: input.budgetLevel,
    venueType: input.venueType,
    season: input.season,
    guestCount: input.guestCount.toString(),
  })

  if (!rendered) {
    throw new Error('Failed to render theme suggester prompt')
  }

  const response = await getAIClient().chat(
    [
      { role: 'system', content: rendered.systemPrompt },
      { role: 'user', content: rendered.userPrompt },
    ],
    {
      tenantId,
      vertical: 'kids_entertainment',
    },
    {
      model: 'gpt-4o-mini',
      temperature: 0.8, // Higher temperature for creativity
      responseFormat: 'json',
    }
  )

  const parsed = JSON.parse(response.data as string)
  return parsed.themes || []
}

export interface ParentMessageInput {
  messageType: 'confirmation' | 'reminder' | 'update' | 'followup' | 'problem'
  partyDetails: any
  parentName: string
  childName: string
  context: string
  keyPoints: string[]
}

export async function generateParentMessage(
  input: ParentMessageInput,
  tenantId: string = 'default'
): Promise<string> {
  const rendered = prompts.render('kids_entertainment', 'parent-communication', {
    messageType: input.messageType,
    partyDetails: JSON.stringify(input.partyDetails, null, 2),
    parentName: input.parentName,
    childName: input.childName,
    context: input.context,
    keyPoints: input.keyPoints.join('\n- '),
  })

  if (!rendered) {
    throw new Error('Failed to render parent communication prompt')
  }

  const response = await getAIClient().chat(
    [
      { role: 'system', content: rendered.systemPrompt },
      { role: 'user', content: rendered.userPrompt },
    ],
    {
      tenantId,
      vertical: 'kids_entertainment',
    },
    {
      model: 'gpt-4o-mini',
      temperature: 0.7,
    }
  )

  return response.data as string
}

export interface PhotoMomentInput {
  timeline: Array<{ time: string; activity: string }>
  activities: any[]
  venueType: string
  startTime: string
  specialMoments: string[]
  childPersonality?: string
}

export interface PhotoMoment {
  time: string
  whatToCapture: string
  reasoning: string
  photoType: 'candid' | 'milestone' | 'group' | 'detail' | 'emotional' | 'activity'
  preparationTips: string[]
  priority: 'must-have' | 'nice-to-have' | 'optional'
  technicalNotes: string[]
}

export async function predictPhotoMoments(
  input: PhotoMomentInput,
  tenantId: string = 'default'
): Promise<PhotoMoment[]> {
  const rendered = prompts.render('kids_entertainment', 'photo-moment-predictor', {
    timeline: JSON.stringify(input.timeline, null, 2),
    activities: JSON.stringify(input.activities, null, 2),
    venueType: input.venueType,
    startTime: input.startTime,
    specialMoments: input.specialMoments.join(', '),
    childPersonality: input.childPersonality || 'energetic and social',
  })

  if (!rendered) {
    throw new Error('Failed to render photo moment predictor prompt')
  }

  const response = await getAIClient().chat(
    [
      { role: 'system', content: rendered.systemPrompt },
      { role: 'user', content: rendered.userPrompt },
    ],
    {
      tenantId,
      vertical: 'kids_entertainment',
    },
    {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      responseFormat: 'json',
    }
  )

  const parsed = JSON.parse(response.data as string)
  return parsed.photoMoments || []
}
