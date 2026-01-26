/**
 * ProgressPredictorAI - Predict when clients will reach their goals
 *
 * Analyzes:
 * - Current vs target metrics
 * - Adherence rate (session attendance)
 * - Workout frequency
 * - Historical progress data
 */

import { z } from 'zod'
import { isOpenAIAvailable, generateStructuredCompletion } from './openai-client'

// Input schema
export const ProgressPredictorInputSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string().optional(),
  }),

  currentMetrics: z.object({
    weight: z.number().optional(), // kg
    bodyFat: z.number().optional(), // percentage
    measurements: z.record(z.string(), z.number()).optional(), // chest, waist, etc.
    strength: z.record(z.string(), z.number()).optional(), // exercise -> max weight
  }),

  goalMetrics: z.object({
    weight: z.number().optional(),
    bodyFat: z.number().optional(),
    measurements: z.record(z.string(), z.number()).optional(),
    strength: z.record(z.string(), z.number()).optional(),
  }),

  behaviorData: z.object({
    adherenceRate: z.number().min(0).max(100), // % of scheduled sessions attended
    weeklyFrequency: z.number().min(0).max(7), // sessions per week
    avgSessionDuration: z.number().optional(), // minutes
    dietAdherence: z.number().min(0).max(100).optional(), // % following nutrition plan
  }),

  historicalData: z.object({
    measurements: z.array(z.object({
      date: z.string(),
      weight: z.number().optional(),
      bodyFat: z.number().optional(),
      measurements: z.record(z.string(), z.number()).optional(),
    })).optional(),
    progressRate: z.number().optional(), // kg per week or % per month
  }).optional(),

  preferences: z.object({
    targetDate: z.string().optional(), // Desired goal date
    intensity: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
  }).optional(),
})

// Output schema
export const ProgressPredictionSchema = z.object({
  prediction: z.object({
    estimatedWeeksToGoal: z.number(),
    estimatedCompletionDate: z.string(),
    confidenceLevel: z.number().min(0).max(100), // % confidence
    likelihood: z.enum(['very_likely', 'likely', 'possible', 'challenging', 'needs_adjustment']),
  }),

  milestones: z.array(z.object({
    week: z.number(),
    date: z.string(),
    expectedProgress: z.string(),
    metrics: z.record(z.string(), z.number()),
    checkpoints: z.array(z.string()),
  })),

  analysis: z.object({
    currentTrend: z.enum(['excellent', 'good', 'on_track', 'slow', 'stagnant', 'regressing']),
    adherenceImpact: z.string(), // How adherence affects timeline
    frequencyImpact: z.string(), // How frequency affects results
    dietImpact: z.string().optional(),
  }),

  recommendations: z.array(z.object({
    category: z.enum(['frequency', 'intensity', 'nutrition', 'recovery', 'consistency']),
    priority: z.enum(['high', 'medium', 'low']),
    suggestion: z.string(),
    expectedImpact: z.string(),
  })),

  riskFactors: z.array(z.object({
    factor: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
    mitigation: z.string(),
  })),

  motivation: z.object({
    encouragement: z.string(),
    realisticExpectation: z.string(),
    quickWins: z.array(z.string()),
  }),
})

export type ProgressPredictorInput = z.infer<typeof ProgressPredictorInputSchema>
export type ProgressPrediction = z.infer<typeof ProgressPredictionSchema>

/**
 * Predict client progress and goal timeline
 */
export async function predictProgress(
  input: ProgressPredictorInput,
  context: { tenantId: string }
): Promise<ProgressPrediction> {
  const validatedInput = ProgressPredictorInputSchema.parse(input)

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validatedInput)

  // Try OpenAI if available
  if (isOpenAIAvailable()) {
    try {
      console.log('[ProgressAI] Predicting with OpenAI...')

      const aiResponse = await generateStructuredCompletion<ProgressPrediction>(
        systemPrompt,
        userPrompt + '\n\nIMPORTANT: Respond with valid JSON matching the ProgressPrediction schema with prediction, milestones, analysis, recommendations, riskFactors, and motivation.',
        { temperature: 0.6, maxTokens: 2500 }
      )

      if (aiResponse) {
        return ProgressPredictionSchema.parse(aiResponse)
      }
    } catch (error) {
      console.error('[ProgressAI] OpenAI prediction failed, falling back to template:', error)
    }
  }

  // Fallback to template prediction
  console.log('[ProgressAI] Using template prediction')
  return generateTemplatePrediction(validatedInput)
}

function buildSystemPrompt(): string {
  return `You are an expert fitness coach and data analyst specializing in client progress prediction.

KEY EXPERTISE:
1. Realistic timeline estimation based on scientific principles
2. Adherence and behavior pattern analysis
3. Goal feasibility assessment
4. Motivation and encouragement strategies

WEIGHT LOSS PRINCIPLES:
- Healthy rate: 0.5-1kg per week (500-1000 kcal deficit)
- Aggressive rate: 1-1.5kg per week (requires high adherence)
- Factors: Diet adherence > Exercise frequency
- Plateau expected every 4-6 weeks

MUSCLE GAIN PRINCIPLES:
- Beginners: 1-1.5kg muscle per month
- Intermediate: 0.5-1kg muscle per month
- Advanced: 0.25-0.5kg muscle per month
- Requires: Progressive overload + calorie surplus + protein

STRENGTH GAINS:
- Beginners: 5-10% increase per month
- Intermediate: 2-5% per month
- Advanced: 1-2% per month
- Neurological adaptation first (weeks 1-4)

ADHERENCE IMPACT:
- 90-100%: On track or ahead
- 75-89%: Slightly delayed
- 60-74%: Significantly delayed
- <60%: Major adjustments needed

PREDICTION GUIDELINES:
- Always provide realistic, achievable timelines
- Consider life factors (work, family, stress)
- Build in plateau periods
- Celebrate small wins
- Adjust expectations if needed`
}

function buildUserPrompt(input: ProgressPredictorInput): string {
  const { currentMetrics, goalMetrics, behaviorData, historicalData, preferences } = input

  let prompt = `Predict progress timeline for client.

CURRENT METRICS:`

  if (currentMetrics.weight) prompt += `\n- Weight: ${currentMetrics.weight}kg`
  if (currentMetrics.bodyFat) prompt += `\n- Body Fat: ${currentMetrics.bodyFat}%`
  if (currentMetrics.measurements) {
    prompt += `\n- Measurements: ${JSON.stringify(currentMetrics.measurements)}`
  }

  prompt += `\n\nGOAL METRICS:`
  if (goalMetrics.weight) prompt += `\n- Target Weight: ${goalMetrics.weight}kg`
  if (goalMetrics.bodyFat) prompt += `\n- Target Body Fat: ${goalMetrics.bodyFat}%`
  if (goalMetrics.measurements) {
    prompt += `\n- Target Measurements: ${JSON.stringify(goalMetrics.measurements)}`
  }

  prompt += `\n\nBEHAVIOR DATA:
- Adherence Rate: ${behaviorData.adherenceRate}%
- Weekly Frequency: ${behaviorData.weeklyFrequency} sessions/week`

  if (behaviorData.dietAdherence) {
    prompt += `\n- Diet Adherence: ${behaviorData.dietAdherence}%`
  }

  if (historicalData?.measurements && historicalData.measurements.length > 0) {
    prompt += `\n\nHISTORICAL PROGRESS:`
    historicalData.measurements.slice(-3).forEach((m) => {
      prompt += `\n- ${m.date}: ${m.weight}kg`
    })
    if (historicalData.progressRate) {
      prompt += `\n- Progress Rate: ${historicalData.progressRate}kg/week`
    }
  }

  if (preferences?.targetDate) {
    prompt += `\n\nDESIRED COMPLETION: ${preferences.targetDate}`
    prompt += `\nIntensity Preference: ${preferences.intensity}`
  }

  prompt += `\n\nProvide:
1. Realistic timeline estimate
2. Weekly milestones
3. Risk factors
4. Recommendations to improve timeline
5. Encouragement and motivation`

  return prompt
}

/**
 * Generate template prediction
 */
function generateTemplatePrediction(input: ProgressPredictorInput): ProgressPrediction {
  const { currentMetrics, goalMetrics, behaviorData } = input

  // Calculate difference
  const weightDiff = goalMetrics.weight && currentMetrics.weight
    ? Math.abs(goalMetrics.weight - currentMetrics.weight)
    : 0

  const isWeightLoss = (goalMetrics.weight ?? 0) < (currentMetrics.weight ?? 0)

  // Estimate weeks based on adherence and frequency
  const baseWeeksPerKg = isWeightLoss ? 2 : 4 // 0.5kg/week loss or 0.25kg/week gain
  const adherenceFactor = behaviorData.adherenceRate / 100
  const frequencyFactor = Math.min(behaviorData.weeklyFrequency / 4, 1) // Optimal 4x/week

  const estimatedWeeks = Math.ceil(
    (weightDiff * baseWeeksPerKg) / (adherenceFactor * frequencyFactor)
  )

  // Confidence based on adherence
  const confidenceLevel = Math.min(
    behaviorData.adherenceRate * 0.8 + behaviorData.weeklyFrequency * 5,
    95
  )

  // Determine likelihood
  let likelihood: ProgressPrediction['prediction']['likelihood']
  if (confidenceLevel >= 80) likelihood = 'very_likely'
  else if (confidenceLevel >= 65) likelihood = 'likely'
  else if (confidenceLevel >= 50) likelihood = 'possible'
  else if (confidenceLevel >= 35) likelihood = 'challenging'
  else likelihood = 'needs_adjustment'

  // Generate milestones
  const milestones = Array.from({ length: Math.min(estimatedWeeks, 12) }, (_, i) => {
    const week = i + 1
    const progressAmount = (weightDiff / estimatedWeeks) * week
    const currentWeight = currentMetrics.weight ?? 0
    const expectedWeight = isWeightLoss
      ? currentWeight - progressAmount
      : currentWeight + progressAmount

    return {
      week,
      date: new Date(Date.now() + week * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expectedProgress: `${Math.abs(progressAmount).toFixed(1)}kg ${isWeightLoss ? 'lost' : 'gained'}`,
      metrics: {
        weight: Math.round(expectedWeight * 10) / 10,
      },
      checkpoints: getCheckpoints(week),
    }
  })

  // Current trend
  let currentTrend: ProgressPrediction['analysis']['currentTrend']
  if (behaviorData.adherenceRate >= 90) currentTrend = 'excellent'
  else if (behaviorData.adherenceRate >= 80) currentTrend = 'good'
  else if (behaviorData.adherenceRate >= 70) currentTrend = 'on_track'
  else if (behaviorData.adherenceRate >= 60) currentTrend = 'slow'
  else if (behaviorData.adherenceRate >= 50) currentTrend = 'stagnant'
  else currentTrend = 'regressing'

  // Recommendations
  const recommendations = generateRecommendations(behaviorData, isWeightLoss)

  // Risk factors
  const riskFactors = generateRiskFactors(behaviorData)

  return {
    prediction: {
      estimatedWeeksToGoal: estimatedWeeks,
      estimatedCompletionDate: new Date(
        Date.now() + estimatedWeeks * 7 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      confidenceLevel: Math.round(confidenceLevel),
      likelihood,
    },
    milestones: milestones.slice(0, 8), // Show first 8 weeks
    analysis: {
      currentTrend,
      adherenceImpact: getAdherenceImpact(behaviorData.adherenceRate),
      frequencyImpact: getFrequencyImpact(behaviorData.weeklyFrequency),
      dietImpact: behaviorData.dietAdherence
        ? getDietImpact(behaviorData.dietAdherence)
        : undefined,
    },
    recommendations,
    riskFactors,
    motivation: {
      encouragement: getEncouragement(currentTrend),
      realisticExpectation: getRealisticExpectation(estimatedWeeks, isWeightLoss),
      quickWins: [
        'Track all workouts this week',
        'Hit protein goal 6 days',
        'Take progress photos monthly',
      ],
    },
  }
}

function getCheckpoints(week: number): string[] {
  const checkpoints = []

  if (week % 4 === 0) {
    checkpoints.push('Progress photos', 'Measurements update', 'Program review')
  } else if (week % 2 === 0) {
    checkpoints.push('Weight check-in', 'Adjust calories if needed')
  } else {
    checkpoints.push('Stay consistent', 'Monitor energy levels')
  }

  return checkpoints
}

function getAdherenceImpact(rate: number): string {
  if (rate >= 90) return 'Excellent adherence! You are maximizing your progress.'
  if (rate >= 80) return 'Strong adherence. Minor improvements could accelerate progress.'
  if (rate >= 70) return 'Good adherence, but missing sessions is slowing your timeline.'
  if (rate >= 60) return 'Fair adherence. Improving consistency would significantly speed up results.'
  return 'Low adherence is the main barrier to your goals. Focus on building the habit.'
}

function getFrequencyImpact(frequency: number): string {
  if (frequency >= 4) return 'Optimal frequency for results. Great job!'
  if (frequency >= 3) return 'Good frequency. Adding one more session per week could help.'
  if (frequency >= 2) return 'Minimum frequency. Increasing to 3-4x/week recommended.'
  return 'Low frequency is limiting progress. Aim for at least 3 sessions per week.'
}

function getDietImpact(adherence: number): string {
  if (adherence >= 90) return 'Exceptional nutrition discipline. This is key to your success.'
  if (adherence >= 80) return 'Solid nutrition adherence. Small tweaks could optimize results.'
  if (adherence >= 70) return 'Decent nutrition, but room for improvement to accelerate progress.'
  return 'Nutrition is the missing piece. 80%+ adherence is crucial for goal achievement.'
}

function generateRecommendations(
  behavior: ProgressPredictorInput['behaviorData'],
  isWeightLoss: boolean
): ProgressPrediction['recommendations'] {
  const recommendations: ProgressPrediction['recommendations'] = []

  if (behavior.adherenceRate < 80) {
    recommendations.push({
      category: 'consistency',
      priority: 'high',
      suggestion: 'Improve session attendance to 85%+. Schedule workouts like appointments.',
      expectedImpact: 'Could reduce timeline by 2-4 weeks',
    })
  }

  if (behavior.weeklyFrequency < 3) {
    recommendations.push({
      category: 'frequency',
      priority: 'high',
      suggestion: 'Increase to 3-4 sessions per week for optimal progress.',
      expectedImpact: 'Could accelerate results by 30-40%',
    })
  }

  if (behavior.dietAdherence && behavior.dietAdherence < 80) {
    recommendations.push({
      category: 'nutrition',
      priority: 'high',
      suggestion: isWeightLoss
        ? 'Focus on calorie deficit consistency. Track food intake daily.'
        : 'Ensure adequate protein (1.6-2.2g/kg) and calorie surplus for muscle gain.',
      expectedImpact: 'Nutrition is 70% of the equation',
    })
  }

  recommendations.push({
    category: 'recovery',
    priority: 'medium',
    suggestion: 'Prioritize 7-9 hours of sleep and active recovery days.',
    expectedImpact: 'Better recovery = better adaptation and progress',
  })

  return recommendations
}

function generateRiskFactors(
  behavior: ProgressPredictorInput['behaviorData']
): ProgressPrediction['riskFactors'] {
  const risks: ProgressPrediction['riskFactors'] = []

  if (behavior.adherenceRate < 70) {
    risks.push({
      factor: 'Low adherence rate indicates motivation or scheduling challenges',
      severity: 'high',
      mitigation: 'Work with trainer to identify barriers. Set smaller, achievable goals.',
    })
  }

  if (behavior.weeklyFrequency < 2) {
    risks.push({
      factor: 'Insufficient training frequency to drive adaptation',
      severity: 'high',
      mitigation: 'Start with 2 sessions/week and build up. Consider shorter, more frequent workouts.',
    })
  }

  if (behavior.dietAdherence && behavior.dietAdherence < 60) {
    risks.push({
      factor: 'Nutrition adherence too low to support goals',
      severity: 'high',
      mitigation: 'Simplify nutrition plan. Focus on one habit at a time (e.g., protein first).',
    })
  }

  return risks
}

function getEncouragement(trend: ProgressPrediction['analysis']['currentTrend']): string {
  const encouragements = {
    excellent: "Outstanding work! You're crushing your goals. Keep this momentum going!",
    good: "You're doing great! Small tweaks will take you even further.",
    on_track: "Solid progress. Stay consistent and you'll reach your goal!",
    slow: "Progress takes time. Don't give up - adjust and keep pushing!",
    stagnant: "Let's reassess and make changes. You've got this!",
    regressing: "Time for a reset. Small steps forward beat standing still. Let's get you back on track!",
  }
  return encouragements[trend]
}

function getRealisticExpectation(weeks: number, isWeightLoss: boolean): string {
  const months = Math.ceil(weeks / 4)
  const goal = isWeightLoss ? 'weight loss' : 'muscle gain'

  if (months <= 2) {
    return `Your goal is achievable in ${months} month${months > 1 ? 's' : ''} with strong adherence.`
  } else if (months <= 4) {
    return `Quality ${goal} takes time. ${months} months is realistic and sustainable.`
  } else {
    return `This is a significant transformation requiring ${months} months. Focus on the process, not just the outcome.`
  }
}
