/**
 * TeamDynamicsAI - Analyze team composition and suggest appropriate activities
 */

import { z } from 'zod'
import type { AIClient } from '@vertigo/ai-core'

// Input schema
export const teamDynamicsInputSchema = z.object({
  teamSize: z.number().min(1),
  objectives: z.array(z.string()),
  industryType: z.string().optional(),
  physicalLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  indoorOutdoor: z.enum(['INDOOR', 'OUTDOOR', 'BOTH', 'FLEXIBLE']).optional(),
  duration: z.number().optional(), // Desired duration in minutes
  previousActivities: z.array(z.string()).optional(), // To avoid repetition
  teamComposition: z.object({
    departments: z.array(z.string()).optional(),
    seniority: z.object({
      junior: z.number().optional(),
      mid: z.number().optional(),
      senior: z.number().optional(),
      executive: z.number().optional(),
    }).optional(),
    ages: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }).optional(),
})

// Output schema
export const teamDynamicsOutputSchema = z.object({
  recommendedActivities: z.array(z.object({
    activityId: z.string(),
    title: z.string(),
    matchScore: z.number().min(0).max(100),
    reasoning: z.string(),
    expectedOutcomes: z.array(z.string()),
    adaptations: z.array(z.string()).optional(), // Suggested adaptations for this team
  })),
  teamAnalysis: z.object({
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  suggestedSequence: z.array(z.object({
    step: z.number(),
    activityId: z.string(),
    duration: z.number(),
    rationale: z.string(),
  })).optional(),
})

export type TeamDynamicsInput = z.infer<typeof teamDynamicsInputSchema>
export type TeamDynamicsOutput = z.infer<typeof teamDynamicsOutputSchema>

/**
 * TeamDynamicsAI Service
 */
export class TeamDynamicsAI {
  constructor(private aiClient: AIClient) {}

  async analyze(
    input: TeamDynamicsInput,
    availableActivities: Array<{
      id: string
      title: string
      objectives: string[]
      minParticipants?: number
      maxParticipants?: number
      physicalDemand?: string
      indoorOutdoor?: string
      duration: number
      learningOutcomes?: string[]
      description?: string
    }>
  ): Promise<TeamDynamicsOutput> {
    const systemPrompt = `You are an expert team building consultant and organizational psychologist.
Your task is to analyze a team's composition and objectives, then recommend the most suitable activities.

Consider:
1. Team size and whether activities can accommodate all participants
2. Alignment between team objectives and activity learning outcomes
3. Physical capabilities and preferences
4. Industry context and corporate culture
5. Duration constraints
6. Variety and engagement level
7. Progression and skill building

Provide thoughtful, evidence-based recommendations with clear reasoning.`

    const userPrompt = `
Team Profile:
- Size: ${input.teamSize} participants
- Objectives: ${input.objectives.join(', ')}
${input.industryType ? `- Industry: ${input.industryType}` : ''}
${input.physicalLevel ? `- Physical Level: ${input.physicalLevel}` : ''}
${input.indoorOutdoor ? `- Location Preference: ${input.indoorOutdoor}` : ''}
${input.duration ? `- Desired Duration: ${input.duration} minutes` : ''}
${input.previousActivities?.length ? `- Previous Activities (avoid): ${input.previousActivities.join(', ')}` : ''}
${input.teamComposition ? `
- Team Composition:
  ${input.teamComposition.departments ? `  Departments: ${input.teamComposition.departments.join(', ')}` : ''}
  ${input.teamComposition.seniority ? `  Seniority: ${JSON.stringify(input.teamComposition.seniority)}` : ''}
  ${input.teamComposition.ages ? `  Age Range: ${input.teamComposition.ages.min}-${input.teamComposition.ages.max}` : ''}
` : ''}

Available Activities:
${availableActivities.map((act, idx) => `
${idx + 1}. ${act.title} (ID: ${act.id})
   - Objectives: ${act.objectives.join(', ')}
   - Participants: ${act.minParticipants || 'Any'}-${act.maxParticipants || 'Unlimited'}
   - Duration: ${act.duration} min
   - Physical Demand: ${act.physicalDemand || 'Not specified'}
   - Location: ${act.indoorOutdoor || 'Flexible'}
   ${act.learningOutcomes ? `- Outcomes: ${act.learningOutcomes.join(', ')}` : ''}
   ${act.description ? `- Description: ${act.description}` : ''}
`).join('\n')}

Analyze this team and recommend the best activities. Provide:
1. Top 3-5 recommended activities with match scores (0-100)
2. Team analysis (strengths, challenges, recommendations)
3. If multiple activities recommended, suggest an optimal sequence
`

    const response = await this.aiClient.chatStructured(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      teamDynamicsOutputSchema,
      {
        tenantId: 'team-building',
        vertical: 'team_building',
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.7,
      }
    )

    return response.data
  }
}

/**
 * Create TeamDynamicsAI instance
 */
export function createTeamDynamicsAI(aiClient: AIClient): TeamDynamicsAI {
  return new TeamDynamicsAI(aiClient)
}
