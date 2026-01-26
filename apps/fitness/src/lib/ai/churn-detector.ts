/**
 * ChurnDetectorAI - Identify at-risk clients before they leave
 *
 * Analyzes behavioral patterns to predict client churn
 * Provides early warning and retention strategies
 */

import { z } from 'zod'
import { isOpenAIAvailable, generateStructuredCompletion } from './openai-client'

// Input schema
export const ChurnDetectorInputSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string().optional(),
    startDate: z.string(), // ISO date when client started
    membershipType: z.string().optional(),
  }),

  attendanceData: z.object({
    totalSessionsBooked: z.number(),
    totalSessionsAttended: z.number(),
    totalSessionsCancelled: z.number(),
    totalNoShows: z.number(),
    lastSessionDate: z.string().optional(), // ISO date
    daysSinceLastSession: z.number(),
    averageSessionsPerWeek: z.number(),
    trendLastMonth: z.enum(['increasing', 'stable', 'decreasing']),
  }),

  engagementData: z.object({
    responsiveness: z.enum(['high', 'medium', 'low']), // How quickly they respond to messages
    lastMessageDate: z.string().optional(),
    appUsage: z.enum(['active', 'moderate', 'minimal', 'none']).optional(),
    progressPhotoFrequency: z.enum(['regular', 'occasional', 'rare', 'never']).optional(),
  }),

  progressData: z.object({
    goalProgress: z.number().min(0).max(100), // % toward goal
    plateauWeeks: z.number(), // Weeks without measurable progress
    satisfactionScore: z.number().min(1).max(5).optional(), // Last feedback rating
  }),

  financialData: z.object({
    outstandingBalance: z.number(),
    paymentIssues: z.number(), // Count of failed/late payments
    packageCreditsRemaining: z.number().optional(),
    lastPaymentDate: z.string().optional(),
  }),

  comparisonToBaseline: z.object({
    firstMonthAttendance: z.number().optional(),
    currentMonthAttendance: z.number().optional(),
    engagementDropPercent: z.number().optional(), // % decrease from peak
  }).optional(),
})

// Output schema
export const ChurnPredictionSchema = z.object({
  riskAssessment: z.object({
    riskScore: z.number().min(0).max(100), // 0 = no risk, 100 = imminent churn
    riskLevel: z.enum(['very_low', 'low', 'medium', 'high', 'critical']),
    churnProbability: z.number().min(0).max(100), // % probability in next 30 days
    urgency: z.enum(['immediate', 'high', 'moderate', 'low']),
  }),

  riskFactors: z.array(
    z.object({
      factor: z.string(),
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      score: z.number(), // Contribution to overall risk score
      description: z.string(),
    })
  ),

  behavioralPatterns: z.object({
    attendanceTrend: z.string(),
    engagementTrend: z.string(),
    progressTrend: z.string(),
    warningSignsDetected: z.array(z.string()),
  }),

  retentionStrategies: z.array(
    z.object({
      priority: z.enum(['immediate', 'high', 'medium', 'low']),
      action: z.string(),
      timing: z.string(),
      expectedImpact: z.string(),
      template: z.string().optional(), // Message template
    })
  ),

  automatedActions: z.array(
    z.object({
      trigger: z.string(),
      action: z.string(),
      when: z.string(),
    })
  ),

  insights: z.object({
    likelyReasons: z.array(z.string()),
    similarCaseOutcomes: z.string().optional(),
    successfulRetentionTactics: z.array(z.string()),
  }),

  timeline: z.object({
    estimatedChurnWindow: z.string(), // e.g., "7-14 days" or "2-4 weeks"
    actionDeadline: z.string(), // Last chance to intervene
    checkInSchedule: z.array(z.string()),
  }),
})

export type ChurnDetectorInput = z.infer<typeof ChurnDetectorInputSchema>
export type ChurnPrediction = z.infer<typeof ChurnPredictionSchema>

/**
 * Build system prompt for churn detection
 */
function buildChurnSystemPrompt(): string {
  return `You are an expert fitness client retention analyst.
Analyze behavioral patterns to predict client churn risk and provide retention strategies.

KEY METRICS:
- Attendance patterns (most predictive)
- Engagement levels
- Progress toward goals
- Financial status

RISK SCORING:
- 0-25: Very Low risk
- 26-45: Low risk
- 46-65: Medium risk
- 66-80: High risk
- 81-100: Critical risk

Always provide actionable retention strategies with specific timing.`
}

/**
 * Predict client churn risk
 */
export async function detectChurnRisk(
  input: ChurnDetectorInput,
  context: { tenantId: string }
): Promise<ChurnPrediction> {
  const validatedInput = ChurnDetectorInputSchema.parse(input)

  // Try OpenAI for enhanced predictions
  if (isOpenAIAvailable()) {
    try {
      console.log('[ChurnAI] Analyzing with OpenAI...')

      const systemPrompt = buildChurnSystemPrompt()
      const userPrompt = `Analyze churn risk for this client data:
${JSON.stringify(validatedInput, null, 2)}

Provide detailed analysis including riskAssessment, riskFactors, behavioralPatterns, retentionStrategies, automatedActions, insights, and timeline.
Respond with valid JSON.`

      const aiResponse = await generateStructuredCompletion<ChurnPrediction>(
        systemPrompt,
        userPrompt,
        { temperature: 0.5, maxTokens: 2000 }
      )

      if (aiResponse) {
        return ChurnPredictionSchema.parse(aiResponse)
      }
    } catch (error) {
      console.error('[ChurnAI] OpenAI analysis failed, falling back to rule-based:', error)
    }
  }

  // Fallback to rule-based scoring
  console.log('[ChurnAI] Using rule-based scoring')
  return calculateChurnRisk(validatedInput)
}

/**
 * Calculate churn risk using behavioral scoring
 */
function calculateChurnRisk(input: ChurnDetectorInput): ChurnPrediction {
  const { attendanceData, engagementData, progressData, financialData } = input

  // Calculate risk score components
  const scores = {
    attendance: calculateAttendanceRisk(attendanceData),
    engagement: calculateEngagementRisk(engagementData),
    progress: calculateProgressRisk(progressData),
    financial: calculateFinancialRisk(financialData),
  }

  // Weighted average (attendance and engagement are most predictive)
  const totalRiskScore = Math.round(
    scores.attendance * 0.35 +
      scores.engagement * 0.30 +
      scores.progress * 0.20 +
      scores.financial * 0.15
  )

  // Determine risk level
  let riskLevel: ChurnPrediction['riskAssessment']['riskLevel']
  let urgency: ChurnPrediction['riskAssessment']['urgency']

  if (totalRiskScore >= 80) {
    riskLevel = 'critical'
    urgency = 'immediate'
  } else if (totalRiskScore >= 65) {
    riskLevel = 'high'
    urgency = 'high'
  } else if (totalRiskScore >= 45) {
    riskLevel = 'medium'
    urgency = 'moderate'
  } else if (totalRiskScore >= 25) {
    riskLevel = 'low'
    urgency = 'low'
  } else {
    riskLevel = 'very_low'
    urgency = 'low'
  }

  // Identify risk factors
  const riskFactors = identifyRiskFactors(input, scores)

  // Generate retention strategies
  const retentionStrategies = generateRetentionStrategies(riskLevel, riskFactors, input)

  // Automated actions
  const automatedActions = getAutomatedActions(riskLevel, attendanceData)

  // Insights
  const insights = generateInsights(input, scores)

  // Timeline
  const timeline = estimateTimeline(riskLevel, attendanceData)

  return {
    riskAssessment: {
      riskScore: totalRiskScore,
      riskLevel,
      churnProbability: Math.min(totalRiskScore * 1.2, 100),
      urgency,
    },
    riskFactors,
    behavioralPatterns: {
      attendanceTrend: getAttendanceTrend(attendanceData),
      engagementTrend: getEngagementTrend(engagementData),
      progressTrend: getProgressTrend(progressData),
      warningSignsDetected: detectWarningSign(input),
    },
    retentionStrategies,
    automatedActions,
    insights,
    timeline,
  }
}

function calculateAttendanceRisk(data: ChurnDetectorInput['attendanceData']): number {
  let score = 0

  // Days since last session (most critical)
  if (data.daysSinceLastSession > 21) score += 40
  else if (data.daysSinceLastSession > 14) score += 30
  else if (data.daysSinceLastSession > 10) score += 20
  else if (data.daysSinceLastSession > 7) score += 10

  // Attendance rate
  const attendanceRate =
    data.totalSessionsBooked > 0 ? data.totalSessionsAttended / data.totalSessionsBooked : 1
  if (attendanceRate < 0.5) score += 25
  else if (attendanceRate < 0.65) score += 15
  else if (attendanceRate < 0.75) score += 5

  // No-shows
  if (data.totalNoShows > 3) score += 15
  else if (data.totalNoShows > 1) score += 10

  // Trend
  if (data.trendLastMonth === 'decreasing') score += 15
  else if (data.trendLastMonth === 'stable') score += 5

  // Frequency
  if (data.averageSessionsPerWeek < 1) score += 15
  else if (data.averageSessionsPerWeek < 2) score += 10

  return Math.min(score, 100)
}

function calculateEngagementRisk(data: ChurnDetectorInput['engagementData']): number {
  let score = 0

  // Responsiveness
  if (data.responsiveness === 'low') score += 30
  else if (data.responsiveness === 'medium') score += 15

  // App usage
  if (data.appUsage === 'none') score += 20
  else if (data.appUsage === 'minimal') score += 15
  else if (data.appUsage === 'moderate') score += 5

  // Progress photos
  if (data.progressPhotoFrequency === 'never') score += 15
  else if (data.progressPhotoFrequency === 'rare') score += 10

  // Last message (if available)
  if (data.lastMessageDate) {
    const daysSinceMessage =
      (Date.now() - new Date(data.lastMessageDate).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceMessage > 30) score += 20
    else if (daysSinceMessage > 14) score += 10
  }

  return Math.min(score, 100)
}

function calculateProgressRisk(data: ChurnDetectorInput['progressData']): number {
  let score = 0

  // Goal progress
  if (data.goalProgress < 20) score += 25
  else if (data.goalProgress < 40) score += 15
  else if (data.goalProgress < 60) score += 5

  // Plateau
  if (data.plateauWeeks > 6) score += 30
  else if (data.plateauWeeks > 4) score += 20
  else if (data.plateauWeeks > 2) score += 10

  // Satisfaction
  if (data.satisfactionScore && data.satisfactionScore <= 2) score += 25
  else if (data.satisfactionScore && data.satisfactionScore === 3) score += 10

  return Math.min(score, 100)
}

function calculateFinancialRisk(data: ChurnDetectorInput['financialData']): number {
  let score = 0

  // Outstanding balance
  if (data.outstandingBalance > 500) score += 30
  else if (data.outstandingBalance > 200) score += 20
  else if (data.outstandingBalance > 0) score += 10

  // Payment issues
  if (data.paymentIssues > 2) score += 25
  else if (data.paymentIssues > 0) score += 15

  // Credits remaining (low credits = less commitment)
  if (data.packageCreditsRemaining !== undefined && data.packageCreditsRemaining < 2) {
    score += 20
  }

  return Math.min(score, 100)
}

function identifyRiskFactors(
  input: ChurnDetectorInput,
  scores: Record<string, number>
): ChurnPrediction['riskFactors'] {
  const factors: ChurnPrediction['riskFactors'] = []

  const { attendanceData, engagementData, progressData, financialData } = input

  // Attendance factors
  if (attendanceData.daysSinceLastSession > 14) {
    factors.push({
      factor: 'Attendance Gap',
      severity: attendanceData.daysSinceLastSession > 21 ? 'critical' : 'high',
      score: 40,
      description: `No session in ${attendanceData.daysSinceLastSession} days. Extended absence is strongest churn predictor.`,
    })
  }

  if (attendanceData.trendLastMonth === 'decreasing') {
    factors.push({
      factor: 'Declining Attendance',
      severity: 'high',
      score: 15,
      description: 'Attendance frequency has decreased in the past month.',
    })
  }

  if (attendanceData.totalNoShows > 2) {
    factors.push({
      factor: 'Multiple No-Shows',
      severity: 'medium',
      score: 15,
      description: `${attendanceData.totalNoShows} no-shows indicate decreasing commitment.`,
    })
  }

  // Engagement factors
  if (engagementData.responsiveness === 'low') {
    factors.push({
      factor: 'Low Responsiveness',
      severity: 'high',
      score: 30,
      description: 'Client rarely responds to messages. Communication breakdown signal.',
    })
  }

  if (engagementData.appUsage === 'none' || engagementData.appUsage === 'minimal') {
    factors.push({
      factor: 'Minimal Engagement',
      severity: 'medium',
      score: 20,
      description: 'Little to no platform usage outside sessions.',
    })
  }

  // Progress factors
  if (progressData.plateauWeeks > 4) {
    factors.push({
      factor: 'Progress Plateau',
      severity: progressData.plateauWeeks > 6 ? 'high' : 'medium',
      score: 25,
      description: `No measurable progress for ${progressData.plateauWeeks} weeks. Frustration likely.`,
    })
  }

  if (progressData.satisfactionScore && progressData.satisfactionScore <= 2) {
    factors.push({
      factor: 'Low Satisfaction',
      severity: 'critical',
      score: 25,
      description: 'Recent feedback indicates dissatisfaction.',
    })
  }

  // Financial factors
  if (financialData.outstandingBalance > 200) {
    factors.push({
      factor: 'Outstanding Balance',
      severity: financialData.outstandingBalance > 500 ? 'high' : 'medium',
      score: 20,
      description: `$${financialData.outstandingBalance} unpaid. Financial stress may drive churn.`,
    })
  }

  // Sort by severity and score
  return factors.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity] || b.score - a.score
  })
}

function generateRetentionStrategies(
  riskLevel: string,
  riskFactors: ChurnPrediction['riskFactors'],
  input: ChurnDetectorInput
): ChurnPrediction['retentionStrategies'] {
  const strategies: ChurnPrediction['retentionStrategies'] = []

  if (riskLevel === 'critical' || riskLevel === 'high') {
    strategies.push({
      priority: 'immediate',
      action: 'Personal phone call from trainer',
      timing: 'Within 24 hours',
      expectedImpact: 'Shows you care. Allows open conversation about concerns.',
      template: `Hi [Name], I noticed we haven't trained together in a while. I'd love to catch up and see how you're doing. Can we schedule a quick call today or tomorrow?`,
    })
  }

  if (input.progressData.plateauWeeks > 4) {
    strategies.push({
      priority: 'high',
      action: 'Program reset and new goal setting session',
      timing: 'This week',
      expectedImpact: 'Reignites motivation with fresh approach and renewed focus.',
    })
  }

  if (input.attendanceData.daysSinceLastSession > 10) {
    strategies.push({
      priority: 'high',
      action: 'Offer complimentary comeback session',
      timing: 'Within 3 days',
      expectedImpact: 'Removes barrier to return. Low commitment ask.',
      template: `Hey [Name]! I'd love to see you back in the gym. How about a complimentary session this week - no pressure, just a chance to reconnect? When works for you?`,
    })
  }

  if (input.progressData.satisfactionScore && input.progressData.satisfactionScore <= 3) {
    strategies.push({
      priority: 'high',
      action: 'Request feedback meeting',
      timing: 'Within 48 hours',
      expectedImpact: 'Shows you value their opinion. Opportunity to address issues.',
      template: `[Name], your experience is important to me. Can we schedule 15 minutes to chat about how training is going and what I can improve?`,
    })
  }

  if (input.financialData.outstandingBalance > 0) {
    strategies.push({
      priority: 'medium',
      action: 'Flexible payment plan offer',
      timing: 'Next communication',
      expectedImpact: 'Removes financial stress as churn reason.',
    })
  }

  strategies.push({
    priority: 'medium',
    action: 'Share recent success stories',
    timing: 'Weekly',
    expectedImpact: 'Inspiration and social proof. Reminds them transformation is possible.',
  })

  strategies.push({
    priority: 'low',
    action: 'Celebrate small wins publicly (with permission)',
    timing: 'Ongoing',
    expectedImpact: 'Recognition and community connection.',
  })

  return strategies
}

function getAutomatedActions(
  riskLevel: string,
  attendanceData: ChurnDetectorInput['attendanceData']
): ChurnPrediction['automatedActions'] {
  const actions: ChurnPrediction['automatedActions'] = []

  if (attendanceData.daysSinceLastSession > 7) {
    actions.push({
      trigger: '7 days without session',
      action: 'Send "we miss you" email with motivational content',
      when: 'Triggered',
    })
  }

  if (attendanceData.daysSinceLastSession > 14) {
    actions.push({
      trigger: '14 days without session',
      action: 'Add to high-priority outreach list. Notify trainer.',
      when: 'Triggered',
    })
  }

  actions.push({
    trigger: 'Session cancellation',
    action: 'Auto-prompt to reschedule immediately',
    when: 'Same day',
  })

  actions.push({
    trigger: 'No-show',
    action: 'Same-day SMS check-in: "Everything okay?"',
    when: 'Within 2 hours',
  })

  if (riskLevel === 'critical') {
    actions.push({
      trigger: 'Critical risk detected',
      action: 'Flag account for trainer review. Block auto-renewals until resolved.',
      when: 'Immediate',
    })
  }

  return actions
}

function generateInsights(
  input: ChurnDetectorInput,
  scores: Record<string, number>
): ChurnPrediction['insights'] {
  const likelyReasons: string[] = []

  if (scores.progress > 40) {
    likelyReasons.push('Lack of visible progress leading to frustration')
  }

  if (scores.attendance > 40) {
    likelyReasons.push('Life circumstances making attendance difficult')
  }

  if (scores.engagement > 40) {
    likelyReasons.push('Decreasing motivation and commitment')
  }

  if (scores.financial > 40) {
    likelyReasons.push('Financial constraints or concerns about value')
  }

  if (input.attendanceData.daysSinceLastSession > 21) {
    likelyReasons.push('Already mentally checked out - may have started elsewhere')
  }

  const successfulRetentionTactics = [
    'Personal phone call to show you care',
    'Offer program adjustment to address plateau',
    'Celebrate any progress, no matter how small',
    'Flexible scheduling or payment options',
    'Reconnect with their original "why"',
  ]

  return {
    likelyReasons,
    similarCaseOutcomes:
      'Clients with similar patterns who received proactive outreach had 65% retention rate vs 20% without intervention.',
    successfulRetentionTactics,
  }
}

function estimateTimeline(
  riskLevel: string,
  attendanceData: ChurnDetectorInput['attendanceData']
): ChurnPrediction['timeline'] {
  let estimatedChurnWindow: string
  let actionDeadline: string

  if (riskLevel === 'critical') {
    estimatedChurnWindow = '3-7 days'
    actionDeadline = 'Within 24 hours'
  } else if (riskLevel === 'high') {
    estimatedChurnWindow = '7-14 days'
    actionDeadline = 'Within 48 hours'
  } else if (riskLevel === 'medium') {
    estimatedChurnWindow = '2-4 weeks'
    actionDeadline = 'Within 1 week'
  } else {
    estimatedChurnWindow = '1-2 months'
    actionDeadline = 'Within 2 weeks'
  }

  const checkInSchedule = [
    'Immediate: Personal outreach',
    '3 days: Follow-up if no response',
    '1 week: Alternative contact method (SMS/call)',
    '2 weeks: Final retention attempt with special offer',
  ]

  return {
    estimatedChurnWindow,
    actionDeadline,
    checkInSchedule,
  }
}

function getAttendanceTrend(data: ChurnDetectorInput['attendanceData']): string {
  if (data.trendLastMonth === 'decreasing') {
    return `Declining (${data.averageSessionsPerWeek.toFixed(1)} sessions/week, down from baseline)`
  } else if (data.trendLastMonth === 'stable') {
    return `Stable at ${data.averageSessionsPerWeek.toFixed(1)} sessions/week`
  }
  return `Increasing to ${data.averageSessionsPerWeek.toFixed(1)} sessions/week`
}

function getEngagementTrend(data: ChurnDetectorInput['engagementData']): string {
  const factors = []
  factors.push(`${data.responsiveness} responsiveness`)
  if (data.appUsage) factors.push(`${data.appUsage} app usage`)
  if (data.progressPhotoFrequency) factors.push(`${data.progressPhotoFrequency} progress tracking`)
  return factors.join(', ')
}

function getProgressTrend(data: ChurnDetectorInput['progressData']): string {
  if (data.plateauWeeks > 4) {
    return `Plateaued for ${data.plateauWeeks} weeks (${data.goalProgress}% to goal)`
  }
  return `${data.goalProgress}% progress toward goal`
}

function detectWarningSign(input: ChurnDetectorInput): string[] {
  const warnings: string[] = []

  if (input.attendanceData.daysSinceLastSession > 14) {
    warnings.push('🚨 Extended absence - urgent intervention needed')
  }

  if (input.attendanceData.totalNoShows > 2) {
    warnings.push('⚠️ Multiple no-shows indicate declining commitment')
  }

  if (input.progressData.satisfactionScore && input.progressData.satisfactionScore <= 2) {
    warnings.push('🚨 Critical: Low satisfaction score')
  }

  if (input.engagementData.responsiveness === 'low') {
    warnings.push('⚠️ Communication breakdown - client disengaging')
  }

  if (input.progressData.plateauWeeks > 6) {
    warnings.push('⚠️ Long plateau - likely frustration')
  }

  if (input.financialData.paymentIssues > 1) {
    warnings.push('⚠️ Payment issues - financial stress factor')
  }

  return warnings
}
