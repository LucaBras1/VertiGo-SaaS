/**
 * OpenAI API Mock for Testing
 *
 * Provides mock responses for OpenAI API calls
 */
import { vi } from 'vitest'

// Mock OpenAI responses
export const mockWorkoutPlan = {
  warmup: [
    {
      exercise: 'Jumping Jacks',
      duration: '3 minutes',
      notes: 'Light cardio to warm up',
    },
    {
      exercise: 'Arm Circles',
      duration: '1 minute',
      notes: 'Both directions',
    },
  ],
  mainWorkout: [
    {
      exercise: 'Barbell Bench Press',
      sets: 4,
      reps: '8-10',
      restSeconds: 90,
      weight: '60% 1RM',
      muscleGroups: ['chest', 'triceps', 'shoulders'],
      alternatives: ['Dumbbell Press', 'Push-ups'],
      formTips: 'Keep elbows at 45 degrees, control the descent',
      videoUrl: undefined,
      supersetWith: undefined,
    },
    {
      exercise: 'Incline Dumbbell Press',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      weight: 'Moderate',
      muscleGroups: ['chest', 'shoulders'],
      alternatives: ['Incline Barbell Press'],
      formTips: 'Press dumbbells together at top',
    },
  ],
  cooldown: [
    {
      exercise: 'Chest Stretch',
      duration: '30 seconds',
      notes: 'Doorway stretch',
    },
    {
      exercise: 'Deep Breathing',
      duration: '2 minutes',
      notes: 'Reduce heart rate',
    },
  ],
  summary: {
    totalDuration: 45,
    estimatedCalories: 350,
    difficulty: 7,
    muscleGroupsCovered: ['chest', 'triceps', 'shoulders'],
    progressionFromLast: 'Increased volume by 10%',
  },
  notes: {
    focusPoints: ['Control tempo', 'Full range of motion', 'Mind-muscle connection'],
    safetyReminders: ['Warm up properly', 'Use spotter for heavy sets'],
    motivationalTip: 'Consistency beats intensity!',
    nextSessionSuggestion: 'Back and biceps workout',
  },
}

export const mockChurnPrediction = {
  riskAssessment: {
    riskScore: 65,
    riskLevel: 'high' as const,
    churnProbability: 78,
    urgency: 'high' as const,
  },
  riskFactors: [
    {
      factor: 'Attendance Gap',
      severity: 'high' as const,
      score: 40,
      description: 'No session in 18 days. Extended absence is strongest churn predictor.',
    },
    {
      factor: 'Declining Attendance',
      severity: 'high' as const,
      score: 15,
      description: 'Attendance frequency has decreased in the past month.',
    },
  ],
  behavioralPatterns: {
    attendanceTrend: 'Declining (1.5 sessions/week, down from baseline)',
    engagementTrend: 'low responsiveness, minimal app usage',
    progressTrend: '40% progress toward goal',
    warningSignsDetected: [
      '🚨 Extended absence - urgent intervention needed',
      '⚠️ Communication breakdown - client disengaging',
    ],
  },
  retentionStrategies: [
    {
      priority: 'immediate' as const,
      action: 'Personal phone call from trainer',
      timing: 'Within 24 hours',
      expectedImpact: 'Shows you care. Allows open conversation about concerns.',
      template: 'Hi [Name], I noticed we haven\'t trained together in a while...',
    },
  ],
  automatedActions: [
    {
      trigger: '14 days without session',
      action: 'Add to high-priority outreach list. Notify trainer.',
      when: 'Triggered',
    },
  ],
  insights: {
    likelyReasons: ['Life circumstances making attendance difficult', 'Decreasing motivation and commitment'],
    similarCaseOutcomes: 'Clients with similar patterns who received proactive outreach had 65% retention rate vs 20% without intervention.',
    successfulRetentionTactics: ['Personal phone call to show you care', 'Offer program adjustment to address plateau'],
  },
  timeline: {
    estimatedChurnWindow: '7-14 days',
    actionDeadline: 'Within 48 hours',
    checkInSchedule: ['Immediate: Personal outreach', '3 days: Follow-up if no response'],
  },
}

export const mockProgressPrediction = {
  prediction: {
    estimatedWeeksToGoal: 12,
    estimatedCompletionDate: '2025-05-01',
    confidenceLevel: 75,
    likelihood: 'likely' as const,
  },
  milestones: [
    {
      week: 1,
      date: '2025-02-08',
      expectedProgress: '0.8kg lost',
      metrics: { weight: 84.2 },
      checkpoints: ['Stay consistent', 'Monitor energy levels'],
    },
    {
      week: 4,
      date: '2025-03-01',
      expectedProgress: '3.2kg lost',
      metrics: { weight: 81.8 },
      checkpoints: ['Progress photos', 'Measurements update', 'Program review'],
    },
  ],
  analysis: {
    currentTrend: 'good' as const,
    adherenceImpact: 'Strong adherence. Minor improvements could accelerate progress.',
    frequencyImpact: 'Good frequency. Adding one more session per week could help.',
    dietImpact: 'Solid nutrition adherence. Small tweaks could optimize results.',
  },
  recommendations: [
    {
      category: 'consistency' as const,
      priority: 'high' as const,
      suggestion: 'Improve session attendance to 85%+. Schedule workouts like appointments.',
      expectedImpact: 'Could reduce timeline by 2-4 weeks',
    },
  ],
  riskFactors: [
    {
      factor: 'Insufficient training frequency to drive adaptation',
      severity: 'high' as const,
      mitigation: 'Start with 2 sessions/week and build up. Consider shorter, more frequent workouts.',
    },
  ],
  motivation: {
    encouragement: "You're doing great! Small tweaks will take you even further.",
    realisticExpectation: 'Quality weight loss takes time. 3 months is realistic and sustainable.',
    quickWins: ['Track all workouts this week', 'Hit protein goal 6 days', 'Take progress photos monthly'],
  },
}

export const mockNutritionAdvice = {
  energyRequirements: {
    bmr: 1850,
    tdee: 2867,
    targetCalories: 2367,
    calorieSurplusDeficit: -500,
    explanation: 'Creating a 500 calorie deficit for sustainable 0.5kg/week fat loss',
  },
  macronutrients: {
    protein: {
      gramsPerDay: 153,
      gramsPerKg: 1.8,
      caloriesPerDay: 612,
      percentage: 26,
      timing: 'Spread evenly across meals. 20-40g per meal optimal for muscle protein synthesis.',
      sources: ['Chicken breast', 'Fish', 'Eggs', 'Greek yogurt', 'Tofu'],
    },
    carbohydrates: {
      gramsPerDay: 255,
      caloriesPerDay: 1020,
      percentage: 43,
      timing: 'Focus carbs around training for energy and recovery.',
      sources: ['Oats', 'Rice', 'Sweet potato', 'Fruits', 'Vegetables'],
    },
    fats: {
      gramsPerDay: 82,
      caloriesPerDay: 738,
      percentage: 31,
      sources: ['Avocado', 'Nuts', 'Olive oil', 'Fatty fish'],
    },
  },
  hydration: {
    dailyWaterGoal: 3.3,
    calculation: '2.8L (body weight) + 0.5L (training)',
    tips: ['Drink 500ml upon waking', 'Sip water throughout the day'],
  },
  mealPlanning: {
    suggestedMeals: 3,
    mealTiming: [
      {
        meal: 'Breakfast',
        time: '7:00 AM',
        macroSplit: '51g protein, 85g carbs, 27g fat',
        suggestions: ['Oats + protein powder + berries', 'Eggs + toast + avocado'],
      },
    ],
    preworkoutNutrition: 'Eat 1-2 hours before training. Focus on carbs + moderate protein.',
    postworkoutNutrition: 'Within 2 hours post-training. 20-40g protein + carbs to replenish glycogen.',
  },
  supplementation: {
    recommended: [
      {
        supplement: 'Whey Protein',
        purpose: 'Convenient way to hit protein targets',
        dosage: '20-40g',
        timing: 'Post-workout or as snack',
      },
    ],
    optional: ['Omega-3 Fish Oil'],
    notNeeded: ['Fat burners (ineffective)'],
  },
  practicaltips: [
    {
      category: 'Meal Prep',
      tip: 'Batch cook protein sources on Sundays',
    },
  ],
  tracking: {
    whatToTrack: ['Daily calories', 'Protein intake', 'Body weight'],
    tools: ['MyFitnessPal', 'Cronometer'],
    frequency: 'Daily tracking for 4-8 weeks to build awareness',
  },
  disclaimer: 'This advice is for general educational purposes only...',
}

// Mock OpenAI client
export const mockOpenAIClient = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockWorkoutPlan),
            },
          },
        ],
        usage: {
          total_tokens: 500,
        },
      }),
    },
  },
}

// Mock OpenAI module
vi.mock('openai', () => ({
  default: vi.fn(() => mockOpenAIClient),
}))

// Mock openai-client module - use relative path for Vitest compatibility
vi.mock('../../src/lib/ai/openai-client', async () => {
  const actual = await vi.importActual('../../src/lib/ai/openai-client')
  return {
    ...actual,
    isOpenAIAvailable: vi.fn().mockReturnValue(false), // Default to mock mode
    generateCompletion: vi.fn().mockResolvedValue(null), // Triggers fallback
    generateStructuredCompletion: vi.fn().mockResolvedValue(null),
  }
})

// Import mocked module for type safety
import * as openaiClient from '../../src/lib/ai/openai-client'

// Helper to enable/disable OpenAI mocks
export const enableOpenAIMocks = (responses: Record<string, any> = {}) => {
  const mockedModule = vi.mocked(openaiClient)

  mockedModule.isOpenAIAvailable.mockReturnValue(true)
  mockedModule.generateStructuredCompletion.mockImplementation(async (_system, user) => {
    // Return appropriate mock based on prompt
    if (user.includes('workout')) return responses.workout || mockWorkoutPlan
    if (user.includes('churn')) return responses.churn || mockChurnPrediction
    if (user.includes('progress')) return responses.progress || mockProgressPrediction
    if (user.includes('nutrition')) return responses.nutrition || mockNutritionAdvice
    return null
  })
}

export const disableOpenAIMocks = () => {
  const mockedModule = vi.mocked(openaiClient)

  mockedModule.isOpenAIAvailable.mockReturnValue(false)
  mockedModule.generateStructuredCompletion.mockResolvedValue(null)
}
