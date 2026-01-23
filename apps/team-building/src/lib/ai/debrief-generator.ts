/**
 * DebriefGeneratorAI - Create HR-ready post-session reports
 */

import { z } from 'zod'
import type { AIClient } from '@vertigo/ai-core'

// Input schema
export const debriefGeneratorInputSchema = z.object({
  session: z.object({
    id: z.string(),
    date: z.string(),
    teamName: z.string().optional(),
    companyName: z.string(),
    teamSize: z.number(),
    objectives: z.array(z.string()),
    customObjectives: z.string().optional(),
  }),
  activitiesCompleted: z.array(z.object({
    title: z.string(),
    duration: z.number(),
    objectives: z.array(z.string()),
    participationRate: z.number().optional(), // 0-100
    notes: z.string().optional(),
  })),
  facilitatorObservations: z.object({
    teamDynamics: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    challenges: z.array(z.string()).optional(),
    breakthroughs: z.array(z.string()).optional(),
    participantFeedback: z.string().optional(),
  }).optional(),
  metrics: z.object({
    engagement: z.number().min(0).max(10).optional(),
    energyLevel: z.number().min(0).max(10).optional(),
    collaboration: z.number().min(0).max(10).optional(),
    communication: z.number().min(0).max(10).optional(),
    problemSolving: z.number().min(0).max(10).optional(),
  }).optional(),
  format: z.enum(['executive', 'detailed', 'hr-standard']).default('hr-standard'),
})

// Output schema
export const debriefGeneratorOutputSchema = z.object({
  report: z.object({
    executiveSummary: z.string(),
    sessionOverview: z.object({
      date: z.string(),
      duration: z.string(),
      teamSize: z.number(),
      activitiesCompleted: z.number(),
      overallSuccess: z.enum(['excellent', 'good', 'satisfactory', 'needs_improvement']),
    }),
    objectivesAssessment: z.array(z.object({
      objective: z.string(),
      achieved: z.enum(['fully', 'partially', 'not_achieved']),
      evidence: z.array(z.string()),
      recommendations: z.array(z.string()),
    })),
    keyFindings: z.object({
      strengths: z.array(z.object({
        area: z.string(),
        description: z.string(),
        impact: z.string(),
      })),
      areasForGrowth: z.array(z.object({
        area: z.string(),
        description: z.string(),
        recommendations: z.array(z.string()),
      })),
      breakthroughMoments: z.array(z.object({
        moment: z.string(),
        significance: z.string(),
      })).optional(),
    }),
    participantEngagement: z.object({
      overallLevel: z.enum(['high', 'medium', 'low']),
      patterns: z.array(z.string()),
      notableParticipation: z.array(z.string()).optional(),
    }),
    teamDynamicsAnalysis: z.object({
      communication: z.object({
        assessment: z.string(),
        patterns: z.array(z.string()),
      }),
      collaboration: z.object({
        assessment: z.string(),
        patterns: z.array(z.string()),
      }),
      leadership: z.object({
        assessment: z.string(),
        patterns: z.array(z.string()),
      }).optional(),
      conflictResolution: z.object({
        assessment: z.string(),
        patterns: z.array(z.string()),
      }).optional(),
    }),
    recommendations: z.object({
      immediate: z.array(z.object({
        action: z.string(),
        rationale: z.string(),
        owner: z.string(), // HR, Team Lead, Management
      })),
      shortTerm: z.array(z.object({
        action: z.string(),
        timeframe: z.string(),
        expectedOutcome: z.string(),
      })),
      longTerm: z.array(z.object({
        action: z.string(),
        timeframe: z.string(),
        expectedOutcome: z.string(),
      })),
    }),
    nextSteps: z.object({
      followUpActivities: z.array(z.string()),
      suggestedTimeline: z.string(),
      metrics: z.array(z.string()), // How to measure continued progress
    }),
    appendix: z.object({
      activityDetails: z.array(z.object({
        title: z.string(),
        duration: z.string(),
        objectives: z.array(z.string()),
        outcomes: z.string(),
      })),
      methodologyNotes: z.string().optional(),
    }),
  }),
  htmlReport: z.string(), // Formatted HTML for display/PDF
  metrics: z.object({
    overallScore: z.number().min(0).max(100),
    categoryScores: z.object({
      engagement: z.number().min(0).max(100),
      collaboration: z.number().min(0).max(100),
      communication: z.number().min(0).max(100),
      problemSolving: z.number().min(0).max(100),
      leadership: z.number().min(0).max(100),
    }),
  }),
})

export type DebriefGeneratorInput = z.infer<typeof debriefGeneratorInputSchema>
export type DebriefGeneratorOutput = z.infer<typeof debriefGeneratorOutputSchema>

/**
 * DebriefGeneratorAI Service
 */
export class DebriefGeneratorAI {
  constructor(private aiClient: AIClient) {}

  async generate(input: DebriefGeneratorInput): Promise<DebriefGeneratorOutput> {
    const systemPrompt = `You are an expert organizational development consultant and HR professional.
Your task is to create a comprehensive, professional debrief report for a corporate team building session.

The report should be:
1. Professional and HR-ready (suitable for leadership review)
2. Evidence-based (reference specific observations)
3. Actionable (clear recommendations with rationale)
4. Balanced (acknowledge both strengths and growth areas)
5. Insightful (go beyond surface observations)
6. Respectful (maintain confidentiality and professionalism)

Use organizational psychology frameworks and team development theories where appropriate.
Avoid jargon - write clearly for a business audience.`

    const userPrompt = `
Session Information:
- Company: ${input.session.companyName}
${input.session.teamName ? `- Team: ${input.session.teamName}` : ''}
- Date: ${input.session.date}
- Team Size: ${input.session.teamSize} participants
- Session Objectives:
${input.session.objectives.map((obj, i) => `  ${i + 1}. ${obj}`).join('\n')}
${input.session.customObjectives ? `\nCustom Objectives:\n${input.session.customObjectives}` : ''}

Activities Completed:
${input.activitiesCompleted.map((act, i) => `
${i + 1}. ${act.title}
   - Duration: ${act.duration} minutes
   - Objectives Addressed: ${act.objectives.join(', ')}
   ${act.participationRate ? `- Participation Rate: ${act.participationRate}%` : ''}
   ${act.notes ? `- Notes: ${act.notes}` : ''}
`).join('\n')}

${input.facilitatorObservations ? `
Facilitator Observations:
${input.facilitatorObservations.teamDynamics ? `Team Dynamics: ${input.facilitatorObservations.teamDynamics}` : ''}
${input.facilitatorObservations.highlights?.length ? `Highlights:\n${input.facilitatorObservations.highlights.map(h => `- ${h}`).join('\n')}` : ''}
${input.facilitatorObservations.challenges?.length ? `Challenges:\n${input.facilitatorObservations.challenges.map(c => `- ${c}`).join('\n')}` : ''}
${input.facilitatorObservations.breakthroughs?.length ? `Breakthroughs:\n${input.facilitatorObservations.breakthroughs.map(b => `- ${b}`).join('\n')}` : ''}
${input.facilitatorObservations.participantFeedback ? `Participant Feedback: ${input.facilitatorObservations.participantFeedback}` : ''}
` : ''}

${input.metrics ? `
Quantitative Metrics (1-10 scale):
${input.metrics.engagement ? `- Engagement: ${input.metrics.engagement}/10` : ''}
${input.metrics.energyLevel ? `- Energy Level: ${input.metrics.energyLevel}/10` : ''}
${input.metrics.collaboration ? `- Collaboration: ${input.metrics.collaboration}/10` : ''}
${input.metrics.communication ? `- Communication: ${input.metrics.communication}/10` : ''}
${input.metrics.problemSolving ? `- Problem Solving: ${input.metrics.problemSolving}/10` : ''}
` : ''}

Report Format: ${input.format}

Create a comprehensive debrief report following the structured schema.
Include executive summary, objective assessment, key findings, team dynamics analysis,
actionable recommendations, and next steps. Also generate a formatted HTML version.
`

    const response = await this.aiClient.chatStructured(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      debriefGeneratorOutputSchema,
      {
        tenantId: 'team-building',
        vertical: 'team-building',
      },
      {
        model: 'gpt-4o', // Use more capable model for report generation
        temperature: 0.6,
      }
    )

    return response.data
  }

  /**
   * Generate quick summary (for immediate post-session use)
   */
  async generateQuickSummary(
    sessionInfo: { companyName: string; teamSize: number; objectives: string[] },
    activities: Array<{ title: string; duration: number }>,
    observations: string
  ): Promise<string> {
    const systemPrompt = `You are a team building facilitator creating a quick post-session summary.`

    const userPrompt = `
Session: ${sessionInfo.companyName}, ${sessionInfo.teamSize} participants
Objectives: ${sessionInfo.objectives.join(', ')}
Activities: ${activities.map(a => `${a.title} (${a.duration} min)`).join(', ')}
Observations: ${observations}

Create a brief (2-3 paragraph) summary of the session highlighting key outcomes and immediate takeaways.
`

    const response = await this.aiClient.complete(
      userPrompt,
      {
        tenantId: 'team-building',
        vertical: 'team-building',
      },
      {
        systemPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.7,
      }
    )

    return response.data
  }
}

/**
 * Create DebriefGeneratorAI instance
 */
export function createDebriefGeneratorAI(aiClient: AIClient): DebriefGeneratorAI {
  return new DebriefGeneratorAI(aiClient)
}
