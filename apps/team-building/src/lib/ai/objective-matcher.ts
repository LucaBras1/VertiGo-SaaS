/**
 * ObjectiveMatcherAI - Match team objectives to activities
 */

import { z } from 'zod'
import type { AIClient } from '@vertigo/ai-core'

// Input schema
export const objectiveMatcherInputSchema = z.object({
  objectives: z.array(z.string()),
  customObjectives: z.string().optional(),
  teamContext: z.object({
    size: z.number(),
    industry: z.string().optional(),
    currentChallenges: z.string().optional(),
  }),
})

// Output schema
export const objectiveMatcherOutputSchema = z.object({
  matches: z.array(z.object({
    objectiveName: z.string(),
    activityRecommendations: z.array(z.object({
      activityId: z.string(),
      title: z.string(),
      alignmentScore: z.number().min(0).max(100),
      how: z.string(), // How this activity addresses the objective
      expectedImpact: z.string(),
    })),
  })),
  integrationSuggestions: z.array(z.object({
    objective: z.string(),
    strategy: z.string(),
    implementationTips: z.array(z.string()),
  })),
  measurementMetrics: z.array(z.object({
    objective: z.string(),
    metrics: z.array(z.string()),
    evaluationMethod: z.string(),
  })),
})

export type ObjectiveMatcherInput = z.infer<typeof objectiveMatcherInputSchema>
export type ObjectiveMatcherOutput = z.infer<typeof objectiveMatcherOutputSchema>

/**
 * ObjectiveMatcherAI Service
 */
export class ObjectiveMatcherAI {
  constructor(private aiClient: AIClient) {}

  async match(
    input: ObjectiveMatcherInput,
    availableActivities: Array<{
      id: string
      title: string
      objectives: string[]
      learningOutcomes?: string[]
      description?: string
      facilitatorGuide?: any
    }>
  ): Promise<ObjectiveMatcherOutput> {
    const systemPrompt = `You are an expert in team development and organizational behavior.
Your task is to match team objectives with the most appropriate team building activities.

Focus on:
1. Clear alignment between objectives and activity outcomes
2. Evidence-based connections (not generic claims)
3. Practical implementation strategies
4. Measurable impact metrics
5. Integration with ongoing team development

Be specific and actionable in your recommendations.`

    const userPrompt = `
Team Objectives:
${input.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}
${input.customObjectives ? `\nCustom Objectives:\n${input.customObjectives}` : ''}

Team Context:
- Team Size: ${input.teamContext.size}
${input.teamContext.industry ? `- Industry: ${input.teamContext.industry}` : ''}
${input.teamContext.currentChallenges ? `- Current Challenges: ${input.teamContext.currentChallenges}` : ''}

Available Activities:
${availableActivities.map((act, idx) => `
${idx + 1}. ${act.title} (ID: ${act.id})
   - Objectives Addressed: ${act.objectives.join(', ')}
   ${act.learningOutcomes ? `- Learning Outcomes: ${act.learningOutcomes.join(', ')}` : ''}
   ${act.description ? `- Description: ${act.description}` : ''}
`).join('\n')}

For each team objective:
1. Identify which activities best address it (with alignment scores)
2. Explain HOW each activity addresses the objective
3. Describe the expected impact
4. Suggest integration strategies
5. Provide measurable metrics to evaluate success

Respond with comprehensive, objective-focused recommendations.
`

    const response = await this.aiClient.chatStructured(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      objectiveMatcherOutputSchema,
      {
        tenantId: 'team-building',
        vertical: 'team_building',
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.6,
      }
    )

    return response.data
  }

  /**
   * Quick match - returns top N activities for given objectives
   */
  async quickMatch(
    objectives: string[],
    availableActivities: Array<{ id: string; title: string; objectives: string[] }>,
    topN: number = 5
  ): Promise<Array<{ activityId: string; title: string; score: number }>> {
    const systemPrompt = `You are an expert team building consultant.
Given a list of team objectives and available activities, rank the activities by how well they match the objectives.`

    const userPrompt = `
Team Objectives:
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Available Activities:
${availableActivities.map((act, i) => `${i + 1}. ${act.title} (ID: ${act.id}) - Addresses: ${act.objectives.join(', ')}`).join('\n')}

Return the top ${topN} activities ranked by match score (0-100).
`

    const quickMatchSchema = z.object({
      rankedActivities: z.array(z.object({
        activityId: z.string(),
        title: z.string(),
        score: z.number().min(0).max(100),
      })),
    })

    const response = await this.aiClient.chatStructured(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      quickMatchSchema,
      {
        tenantId: 'team-building',
        vertical: 'team_building',
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
      }
    )

    return response.data.rankedActivities.slice(0, topN)
  }
}

/**
 * Create ObjectiveMatcherAI instance
 */
export function createObjectiveMatcherAI(aiClient: AIClient): ObjectiveMatcherAI {
  return new ObjectiveMatcherAI(aiClient)
}
