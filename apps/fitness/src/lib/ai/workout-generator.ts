/**
 * WorkoutAI - AI-powered workout plan generation
 *
 * Generates personalized training plans based on:
 * - Client goals and fitness level
 * - Available equipment
 * - Time constraints
 * - Injury history
 * - Previous workout data
 */

import { z } from 'zod'
import { isOpenAIAvailable, generateStructuredCompletion } from './openai-client'

// Input schema
export const WorkoutGeneratorInputSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string().optional(),
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    goals: z.array(z.enum([
      'weight_loss',
      'muscle_gain',
      'strength',
      'endurance',
      'flexibility',
      'general_fitness',
      'sports_performance',
      'rehabilitation'
    ])),
    injuries: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    age: z.number().optional(),
    weight: z.number().optional(), // kg
    height: z.number().optional(), // cm
  }),

  session: z.object({
    duration: z.number().min(15).max(180), // minutes
    type: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'mixed']),
    focusAreas: z.array(z.enum([
      'chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full_body'
    ])).optional(),
    intensity: z.enum(['low', 'moderate', 'high']).default('moderate'),
  }),

  equipment: z.object({
    available: z.array(z.string()), // List of available equipment
    location: z.enum(['gym', 'home', 'outdoor', 'hotel']),
  }),

  history: z.object({
    lastWorkouts: z.array(z.object({
      date: z.string(),
      focusAreas: z.array(z.string()),
      exercises: z.array(z.string()),
    })).optional(),
    muscleRecoveryStatus: z.record(z.string(), z.number()).optional(), // muscle group -> recovery % (0-100)
  }).optional(),

  preferences: z.object({
    favoriteExercises: z.array(z.string()).optional(),
    dislikedExercises: z.array(z.string()).optional(),
    musicTempo: z.enum(['slow', 'moderate', 'fast']).optional(),
  }).optional(),
})

// Output schema
export const WorkoutPlanSchema = z.object({
  warmup: z.array(z.object({
    exercise: z.string(),
    duration: z.string(), // e.g., "5 minutes" or "30 seconds"
    notes: z.string().optional(),
    videoUrl: z.string().optional(),
  })),

  mainWorkout: z.array(z.object({
    exercise: z.string(),
    sets: z.number(),
    reps: z.string(), // e.g., "8-12" or "30 seconds"
    restSeconds: z.number(),
    weight: z.string().optional(), // e.g., "60% 1RM" or "moderate"
    muscleGroups: z.array(z.string()),
    alternatives: z.array(z.string()),
    formTips: z.string(),
    videoUrl: z.string().optional(),
    supersetWith: z.string().optional(),
  })),

  cooldown: z.array(z.object({
    exercise: z.string(),
    duration: z.string(),
    notes: z.string().optional(),
  })),

  summary: z.object({
    totalDuration: z.number(), // minutes
    estimatedCalories: z.number(),
    difficulty: z.number().min(1).max(10),
    muscleGroupsCovered: z.array(z.string()),
    progressionFromLast: z.string().optional(),
  }),

  notes: z.object({
    focusPoints: z.array(z.string()),
    safetyReminders: z.array(z.string()),
    motivationalTip: z.string(),
    nextSessionSuggestion: z.string(),
  }),
})

export type WorkoutGeneratorInput = z.infer<typeof WorkoutGeneratorInputSchema>
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>

/**
 * Generate AI-powered workout plan
 */
export async function generateWorkout(
  input: WorkoutGeneratorInput,
  context: { tenantId: string }
): Promise<WorkoutPlan> {
  const validatedInput = WorkoutGeneratorInputSchema.parse(input)

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validatedInput)

  // Try OpenAI if available
  if (isOpenAIAvailable()) {
    try {
      console.log('[WorkoutAI] Generating workout with OpenAI...')

      const aiResponse = await generateStructuredCompletion<WorkoutPlan>(
        systemPrompt,
        userPrompt + '\n\nIMPORTANT: Respond with valid JSON matching this structure: { warmup: [], mainWorkout: [], cooldown: [], summary: {}, notes: {} }',
        { temperature: 0.7, maxTokens: 3000 }
      )

      if (aiResponse) {
        // Validate AI response against schema
        return WorkoutPlanSchema.parse(aiResponse)
      }
    } catch (error) {
      console.error('[WorkoutAI] OpenAI generation failed, falling back to template:', error)
    }
  }

  // Fallback to template workout
  console.log('[WorkoutAI] Using template workout')
  return generateTemplateWorkout(validatedInput)
}

function buildSystemPrompt(): string {
  return `You are an expert personal trainer and exercise physiologist.
Your specialty is creating safe, effective, and engaging workout programs.

KEY PRINCIPLES:
1. SAFETY FIRST: Always consider injuries and contraindications
2. PROGRESSIVE OVERLOAD: Gradually increase difficulty
3. BALANCE: Work opposing muscle groups, include all movement patterns
4. RECOVERY: Consider muscle recovery status, avoid overtraining
5. ENGAGEMENT: Vary exercises to prevent boredom

EXERCISE SELECTION:
- Compound movements before isolation
- Big muscle groups before small
- Higher skill exercises when fresh
- Mix pushing and pulling movements

WORKOUT STRUCTURE:
- Warmup: 5-10 minutes, increase heart rate, prepare target muscles
- Main workout: Follow logical exercise order
- Cooldown: Static stretching, breathing, reduce heart rate

REP RANGES BY GOAL:
- Strength: 1-5 reps, heavy weight, long rest (3-5 min)
- Hypertrophy: 6-12 reps, moderate weight, moderate rest (60-90 sec)
- Endurance: 12-20+ reps, lighter weight, short rest (30-60 sec)

Always provide:
- Clear exercise names
- Sets, reps, and rest periods
- Form cues and safety tips
- Exercise alternatives
- Progression options`
}

function buildUserPrompt(input: WorkoutGeneratorInput): string {
  const { client, session, equipment, history, preferences } = input

  let prompt = `Create a ${session.duration}-minute ${session.type} workout.

CLIENT PROFILE:
- Fitness Level: ${client.fitnessLevel}
- Goals: ${client.goals.join(', ')}
${client.injuries?.length ? `- Injuries/Limitations: ${client.injuries.join(', ')}` : ''}
${client.age ? `- Age: ${client.age}` : ''}

SESSION REQUIREMENTS:
- Duration: ${session.duration} minutes
- Type: ${session.type}
- Intensity: ${session.intensity}
${session.focusAreas?.length ? `- Focus Areas: ${session.focusAreas.join(', ')}` : ''}

EQUIPMENT:
- Location: ${equipment.location}
- Available: ${equipment.available.join(', ')}
`

  if (history?.lastWorkouts?.length) {
    prompt += `\nRECENT HISTORY:`
    history.lastWorkouts.slice(0, 3).forEach(w => {
      prompt += `\n- ${w.date}: ${w.focusAreas.join(', ')}`
    })
  }

  if (history?.muscleRecoveryStatus) {
    prompt += `\n\nMUSCLE RECOVERY:`
    Object.entries(history.muscleRecoveryStatus).forEach(([muscle, recovery]) => {
      prompt += `\n- ${muscle}: ${recovery}% recovered`
    })
  }

  if (preferences?.favoriteExercises?.length) {
    prompt += `\n\nPREFERRED EXERCISES: ${preferences.favoriteExercises.join(', ')}`
  }

  if (preferences?.dislikedExercises?.length) {
    prompt += `\nAVOID: ${preferences.dislikedExercises.join(', ')}`
  }

  prompt += `\n\nCreate a complete workout with:
1. Dynamic warmup (5-10 min)
2. Main workout with ${session.type === 'strength' ? '4-6 exercises' : '6-8 exercises'}
3. Cooldown/stretching (5 min)
4. Clear instructions and alternatives`

  return prompt
}

/**
 * Generate template workout based on session type
 */
function generateTemplateWorkout(input: WorkoutGeneratorInput): WorkoutPlan {
  const { client, session, equipment } = input

  const isBeginnerOrInjured = client.fitnessLevel === 'beginner' || (client.injuries?.length ?? 0) > 0

  // Warmup
  const warmup = [
    {
      exercise: 'Light cardio (walking, cycling, or jump rope)',
      duration: '3-5 minutes',
      notes: 'Get heart rate up gradually',
    },
    {
      exercise: 'Arm circles',
      duration: '30 seconds each direction',
      notes: 'Start small, gradually increase range',
    },
    {
      exercise: 'Leg swings',
      duration: '10 each leg',
      notes: 'Hold onto wall for balance',
    },
    {
      exercise: 'Hip circles',
      duration: '30 seconds',
      notes: 'Loosen up hip joints',
    },
    {
      exercise: 'Bodyweight squats',
      duration: '10 reps',
      notes: 'Slow and controlled',
    },
  ]

  // Main workout based on type
  const mainWorkout = getMainWorkout(session.type, session.focusAreas || [], equipment.available, isBeginnerOrInjured)

  // Cooldown
  const cooldown = [
    {
      exercise: 'Quad stretch',
      duration: '30 seconds each leg',
      notes: 'Hold onto wall for balance',
    },
    {
      exercise: 'Hamstring stretch',
      duration: '30 seconds each leg',
      notes: 'Keep back straight',
    },
    {
      exercise: 'Chest doorway stretch',
      duration: '30 seconds',
      notes: 'Feel the stretch across chest',
    },
    {
      exercise: 'Cat-cow stretch',
      duration: '1 minute',
      notes: 'Breathe deeply with each movement',
    },
    {
      exercise: 'Deep breathing',
      duration: '1 minute',
      notes: 'Return heart rate to normal',
    },
  ]

  // Calculate summary
  const muscleGroups = [...new Set(mainWorkout.flatMap(e => e.muscleGroups))]
  const totalExerciseTime = mainWorkout.reduce((sum, e) => sum + (e.sets * 45) + (e.sets * e.restSeconds), 0) / 60
  const totalTime = Math.round(10 + totalExerciseTime + 5) // warmup + workout + cooldown

  const caloriesPerMinute = {
    low: 5,
    moderate: 8,
    high: 12,
  }[session.intensity]

  return {
    warmup,
    mainWorkout,
    cooldown,
    summary: {
      totalDuration: totalTime,
      estimatedCalories: Math.round(totalTime * caloriesPerMinute),
      difficulty: session.intensity === 'high' ? 8 : session.intensity === 'moderate' ? 6 : 4,
      muscleGroupsCovered: muscleGroups,
      progressionFromLast: 'Maintained intensity, varied exercise selection',
    },
    notes: {
      focusPoints: [
        'Maintain proper form throughout',
        'Control the negative (lowering) phase',
        'Breathe consistently - exhale on exertion',
      ],
      safetyReminders: [
        'Stop if you feel sharp pain',
        'Stay hydrated throughout',
        client.injuries?.length ? `Be careful with: ${client.injuries.join(', ')}` : 'Listen to your body',
      ],
      motivationalTip: getMotivationalTip(),
      nextSessionSuggestion: getNextSessionSuggestion(session.focusAreas || []),
    },
  }
}

function getMainWorkout(
  type: string,
  focusAreas: string[],
  equipment: string[],
  isBeginnerOrInjured: boolean
): WorkoutPlan['mainWorkout'] {
  const hasWeights = equipment.some(e =>
    ['dumbbells', 'barbells', 'kettlebells', 'cable machine'].includes(e.toLowerCase())
  )

  if (type === 'strength' || type === 'mixed') {
    return [
      {
        exercise: hasWeights ? 'Goblet Squats' : 'Bodyweight Squats',
        sets: isBeginnerOrInjured ? 3 : 4,
        reps: isBeginnerOrInjured ? '8-10' : '10-12',
        restSeconds: 60,
        weight: hasWeights ? 'Moderate - challenging last 2 reps' : undefined,
        muscleGroups: ['legs', 'glutes', 'core'],
        alternatives: ['Leg press', 'Wall sit', 'Step-ups'],
        formTips: 'Keep chest up, knees tracking over toes, weight in heels',
      },
      {
        exercise: hasWeights ? 'Dumbbell Bench Press' : 'Push-ups',
        sets: isBeginnerOrInjured ? 3 : 4,
        reps: isBeginnerOrInjured ? '8-10' : '10-12',
        restSeconds: 60,
        muscleGroups: ['chest', 'shoulders', 'arms'],
        alternatives: ['Incline push-ups', 'Chest press machine', 'Floor press'],
        formTips: 'Elbows at 45 degrees, full range of motion',
      },
      {
        exercise: hasWeights ? 'Bent-over Rows' : 'Inverted Rows',
        sets: isBeginnerOrInjured ? 3 : 4,
        reps: '10-12',
        restSeconds: 60,
        muscleGroups: ['back', 'arms'],
        alternatives: ['Cable rows', 'Single-arm rows', 'Lat pulldown'],
        formTips: 'Keep back flat, squeeze shoulder blades at top',
      },
      {
        exercise: 'Romanian Deadlifts',
        sets: 3,
        reps: '10-12',
        restSeconds: 60,
        weight: 'Light to moderate',
        muscleGroups: ['hamstrings', 'glutes', 'back'],
        alternatives: ['Good mornings', 'Hip hinges', 'Leg curls'],
        formTips: 'Slight knee bend, hinge at hips, feel hamstring stretch',
      },
      {
        exercise: 'Plank',
        sets: 3,
        reps: '30-45 seconds',
        restSeconds: 30,
        muscleGroups: ['core'],
        alternatives: ['Dead bug', 'Bird dog', 'Side plank'],
        formTips: 'Keep body in straight line, don\'t let hips sag',
      },
    ]
  }

  // HIIT workout
  if (type === 'hiit') {
    return [
      {
        exercise: 'Burpees',
        sets: 4,
        reps: '30 seconds work, 30 seconds rest',
        restSeconds: 30,
        muscleGroups: ['full_body'],
        alternatives: ['Squat thrusts', 'Step-back burpees'],
        formTips: 'Land softly, maintain control',
      },
      {
        exercise: 'Mountain Climbers',
        sets: 4,
        reps: '30 seconds work, 30 seconds rest',
        restSeconds: 30,
        muscleGroups: ['core', 'shoulders', 'legs'],
        alternatives: ['Slow mountain climbers', 'Plank jacks'],
        formTips: 'Keep hips level, drive knees to chest',
      },
      {
        exercise: 'Jump Squats',
        sets: 4,
        reps: '30 seconds work, 30 seconds rest',
        restSeconds: 30,
        muscleGroups: ['legs', 'glutes'],
        alternatives: ['Squat pulses', 'Box jumps'],
        formTips: 'Land softly, absorb impact through legs',
      },
      {
        exercise: 'Push-up to Plank',
        sets: 4,
        reps: '30 seconds work, 30 seconds rest',
        restSeconds: 30,
        muscleGroups: ['chest', 'arms', 'core'],
        alternatives: ['Standard push-ups', 'Plank shoulder taps'],
        formTips: 'Move with control, alternate leading arm',
      },
    ]
  }

  // Cardio workout
  return [
    {
      exercise: 'Jumping Jacks',
      sets: 3,
      reps: '1 minute',
      restSeconds: 30,
      muscleGroups: ['full_body'],
      alternatives: ['Step jacks', 'Star jumps'],
      formTips: 'Land softly, full arm extension',
    },
    {
      exercise: 'High Knees',
      sets: 3,
      reps: '45 seconds',
      restSeconds: 30,
      muscleGroups: ['legs', 'core'],
      alternatives: ['Marching in place', 'Butt kicks'],
      formTips: 'Drive knees up to hip level, pump arms',
    },
    {
      exercise: 'Skaters',
      sets: 3,
      reps: '1 minute',
      restSeconds: 30,
      muscleGroups: ['legs', 'glutes'],
      alternatives: ['Side shuffles', 'Lateral lunges'],
      formTips: 'Land softly, stay low, swing arms for momentum',
    },
  ]
}

function getMotivationalTip(): string {
  const tips = [
    "Progress, not perfection. Every rep counts!",
    "You're stronger than you think. Push through!",
    "The only bad workout is the one that didn't happen.",
    "Embrace the burn - that's where change happens.",
    "Your future self will thank you for this workout.",
    "Small steps lead to big changes. Keep going!",
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

function getNextSessionSuggestion(currentFocus: string[]): string {
  const suggestions: Record<string, string> = {
    chest: 'Next session: Focus on back and biceps for balanced development',
    back: 'Next session: Focus on chest and triceps',
    legs: 'Next session: Upper body push (chest, shoulders, triceps)',
    shoulders: 'Next session: Back and biceps',
    full_body: 'Next session: Active recovery or light cardio',
  }

  const focus = currentFocus[0] || 'full_body'
  return suggestions[focus] || 'Next session: Different muscle groups for recovery'
}

/**
 * Calculate progressive overload suggestion
 */
export function suggestProgression(
  lastPerformance: { exercise: string; sets: number; reps: number; weight?: number },
  goal: 'strength' | 'hypertrophy' | 'endurance'
): { sets?: number; reps?: string; weight?: string } {
  const { sets, reps, weight } = lastPerformance

  if (goal === 'strength') {
    // Focus on weight increase
    return {
      weight: weight ? `+2.5-5% (was ${weight}kg)` : 'Increase slightly',
      reps: `${reps}`,
    }
  }

  if (goal === 'hypertrophy') {
    // Focus on volume
    if (reps < 12) {
      return { reps: `${reps + 1}-${reps + 2}` }
    }
    return {
      sets: sets + 1,
      reps: '8-10',
      weight: weight ? `+2.5kg (was ${weight}kg)` : 'Increase slightly',
    }
  }

  // Endurance
  return {
    reps: `${reps + 2}-${reps + 4}`,
  }
}
