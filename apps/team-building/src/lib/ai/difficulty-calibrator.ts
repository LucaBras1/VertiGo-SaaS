/**
 * DifficultyCalibratorAI - Adjust activity difficulty based on team composition
 */

import { z } from 'zod'
import type { AIClient } from '@vertigo/ai-core'

// Input schema
export const difficultyCalibratorInputSchema = z.object({
  activityId: z.string(),
  activityTitle: z.string(),
  defaultDifficulty: z.enum(['easy', 'medium', 'hard', 'adaptive']),
  teamProfile: z.object({
    size: z.number(),
    physicalLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    averageAge: z.number().optional(),
    ageRange: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
    fitnessLevel: z.enum(['low', 'medium', 'high', 'mixed']).optional(),
    cognitiveLevel: z.enum(['low', 'medium', 'high', 'mixed']).optional(),
    previousExperience: z.enum(['none', 'some', 'extensive']).optional(),
    specialNeeds: z.array(z.string()).optional(),
  }),
  targetDuration: z.number().optional(), // Minutes
  facilitatorExperience: z.enum(['beginner', 'intermediate', 'expert']).optional(),
})

// Output schema
export const difficultyCalibratorOutputSchema = z.object({
  calibratedDifficulty: z.enum(['easy', 'medium', 'hard', 'adaptive']),
  adjustments: z.array(z.object({
    aspect: z.string(), // e.g., "Physical challenge", "Time limit", "Complexity"
    originalLevel: z.string(),
    adjustedLevel: z.string(),
    reasoning: z.string(),
  })),
  modifications: z.array(z.object({
    category: z.string(), // e.g., "Rules", "Equipment", "Scoring"
    modification: z.string(),
    impact: z.string(), // How this helps the team
  })),
  facilitatorGuidance: z.object({
    setupTips: z.array(z.string()),
    watchFor: z.array(z.string()), // Signs that difficulty needs real-time adjustment
    scalingOptions: z.array(z.object({
      trigger: z.string(), // When to use this
      action: z.string(), // What to do
    })),
  }),
  estimatedCompletionTime: z.object({
    min: z.number(),
    max: z.number(),
    likely: z.number(),
  }),
  successPrediction: z.object({
    likelihood: z.number().min(0).max(100),
    factors: z.array(z.string()),
    riskMitigation: z.array(z.string()),
  }),
})

export type DifficultyCalibratorInput = z.infer<typeof difficultyCalibratorInputSchema>
export type DifficultyCalibratorOutput = z.infer<typeof difficultyCalibratorOutputSchema>

/**
 * DifficultyCalibratorAI Service
 */
export class DifficultyCalibratorAI {
  constructor(private aiClient: AIClient) {}

  async calibrate(
    input: DifficultyCalibratorInput,
    activityDetails?: {
      description?: string
      rules?: string
      materials?: string[]
      facilitatorGuide?: any
    }
  ): Promise<DifficultyCalibratorOutput> {
    const systemPrompt = `You are an expert team building facilitator and adaptive learning specialist.
Your task is to calibrate activity difficulty to match team capabilities and ensure optimal engagement.

Key principles:
1. Challenge should be appropriate - not too easy (boring) or too hard (frustrating)
2. Consider physical, cognitive, and social aspects
3. Account for team diversity and special needs
4. Provide facilitator with real-time adjustment options
5. Ensure psychological safety while promoting growth
6. Base recommendations on evidence from team development research

Your goal is to maximize engagement, learning, and positive team experience.`

    const userPrompt = `
Activity:
- Title: ${input.activityTitle}
- Default Difficulty: ${input.defaultDifficulty}
${activityDetails?.description ? `- Description: ${activityDetails.description}` : ''}
${activityDetails?.rules ? `- Rules: ${activityDetails.rules}` : ''}
${activityDetails?.materials ? `- Materials: ${activityDetails.materials.join(', ')}` : ''}

Team Profile:
- Size: ${input.teamProfile.size} participants
${input.teamProfile.physicalLevel ? `- Physical Capability: ${input.teamProfile.physicalLevel}` : ''}
${input.teamProfile.averageAge ? `- Average Age: ${input.teamProfile.averageAge}` : ''}
${input.teamProfile.ageRange ? `- Age Range: ${input.teamProfile.ageRange.min}-${input.teamProfile.ageRange.max}` : ''}
${input.teamProfile.fitnessLevel ? `- Fitness Level: ${input.teamProfile.fitnessLevel}` : ''}
${input.teamProfile.cognitiveLevel ? `- Cognitive Level: ${input.teamProfile.cognitiveLevel}` : ''}
${input.teamProfile.previousExperience ? `- Previous Experience: ${input.teamProfile.previousExperience}` : ''}
${input.teamProfile.specialNeeds?.length ? `- Special Needs: ${input.teamProfile.specialNeeds.join(', ')}` : ''}

${input.targetDuration ? `Target Duration: ${input.targetDuration} minutes` : ''}
${input.facilitatorExperience ? `Facilitator Experience: ${input.facilitatorExperience}` : ''}

Analyze the team profile and:
1. Recommend calibrated difficulty level
2. List specific adjustments needed (with reasoning)
3. Provide modifications to activity elements
4. Give facilitator guidance for setup and real-time adjustments
5. Estimate completion time range
6. Predict success likelihood with risk mitigation strategies

Be specific and actionable. Consider inclusivity and accessibility.
`

    const response = await this.aiClient.chatStructured(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      difficultyCalibratorOutputSchema,
      {
        tenantId: 'team-building',
        vertical: 'team-building',
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.6,
      }
    )

    return response.data
  }

  /**
   * Quick calibration - just returns adjusted difficulty level
   */
  async quickCalibrate(
    defaultDifficulty: string,
    teamSize: number,
    physicalLevel?: string,
    previousExperience?: string
  ): Promise<string> {
    const systemPrompt = `You are a team building expert. Quickly calibrate activity difficulty based on team profile.`

    const userPrompt = `
Default Difficulty: ${defaultDifficulty}
Team Size: ${teamSize}
${physicalLevel ? `Physical Level: ${physicalLevel}` : ''}
${previousExperience ? `Previous Experience: ${previousExperience}` : ''}

What difficulty level should this activity be adjusted to? (easy, medium, hard)
Respond with just the level and brief reasoning.
`

    const quickSchema = z.object({
      adjustedDifficulty: z.enum(['easy', 'medium', 'hard', 'adaptive']),
      reasoning: z.string(),
    })

    const response = await this.aiClient.chatStructured(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      quickSchema,
      {
        tenantId: 'team-building',
        vertical: 'team-building',
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
      }
    )

    return response.data.adjustedDifficulty
  }
}

/**
 * Create DifficultyCalibratorAI instance
 */
export function createDifficultyCalibratorAI(aiClient: AIClient): DifficultyCalibratorAI {
  return new DifficultyCalibratorAI(aiClient)
}
