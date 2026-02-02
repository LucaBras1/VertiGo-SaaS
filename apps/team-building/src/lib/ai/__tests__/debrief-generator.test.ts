/**
 * Unit tests for DebriefGeneratorAI
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DebriefGeneratorAI, DebriefGeneratorInput } from '../debrief-generator'
import {
  createMockAIClient,
  mockDebriefGeneratorResponse,
  mockDebriefOutput,
  mockAIError,
  type MockAIClient,
} from '../../../../__tests__/mocks/openai'

describe('DebriefGeneratorAI', () => {
  let mockClient: MockAIClient
  let debriefGenerator: DebriefGeneratorAI

  const sampleInput: DebriefGeneratorInput = {
    session: {
      id: 'session-001',
      date: '2025-01-15',
      teamName: 'Engineering & Sales Team',
      companyName: 'TechCorp s.r.o.',
      teamSize: 20,
      objectives: [
        'Improve inter-departmental communication',
        'Build trust between team members',
        'Develop problem-solving skills',
      ],
      customObjectives: 'We especially want to bridge the gap between Engineering and Sales departments.',
    },
    activitiesCompleted: [
      {
        title: 'Escape Room Challenge',
        duration: 90,
        objectives: ['problem-solving', 'communication', 'collaboration'],
        participationRate: 95,
        notes: 'Team completed with 5 minutes to spare. Great collaboration observed.',
      },
      {
        title: 'Team Canvas Workshop',
        duration: 60,
        objectives: ['alignment', 'goal-setting'],
        participationRate: 100,
        notes: 'Excellent discussions around team values.',
      },
      {
        title: 'Outdoor Navigation Challenge',
        duration: 45,
        objectives: ['trust', 'fun'],
        participationRate: 90,
        notes: 'High energy activity. Some team members preferred to observe.',
      },
    ],
    facilitatorObservations: {
      teamDynamics: 'Initial hesitation between departments, but collaboration improved significantly throughout the session.',
      highlights: [
        'Cross-departmental pairs working effectively in escape room',
        'Junior team members stepping up with creative solutions',
        'Genuine laughter and connection during outdoor activity',
      ],
      challenges: [
        'Some tension when opinions diverged during planning',
        'A few quieter participants needed encouragement to contribute',
      ],
      breakthroughs: [
        'Sales lead and Engineering manager working together effectively',
        'Team developing shared vocabulary and inside jokes',
      ],
      participantFeedback: 'Overall very positive. Several mentioned they wish this happened more often.',
    },
    metrics: {
      engagement: 8,
      energyLevel: 7,
      collaboration: 9,
      communication: 8,
      problemSolving: 8,
    },
    format: 'hr-standard',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockAIClient()
    debriefGenerator = new DebriefGeneratorAI(mockClient as any)
  })

  describe('generate()', () => {
    it('should generate a complete debrief report', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result).toBeDefined()
      expect(result.report).toBeDefined()
      expect(result.htmlReport).toBeDefined()
      expect(result.metrics).toBeDefined()
    })

    it('should include executive summary', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.executiveSummary).toBeDefined()
      expect(result.report.executiveSummary.length).toBeGreaterThan(50)
    })

    it('should include session overview', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.sessionOverview).toBeDefined()
      expect(result.report.sessionOverview.date).toBeDefined()
      expect(result.report.sessionOverview.duration).toBeDefined()
      expect(result.report.sessionOverview.teamSize).toBeGreaterThan(0)
      expect(result.report.sessionOverview.activitiesCompleted).toBeGreaterThan(0)
      expect(['excellent', 'good', 'satisfactory', 'needs_improvement']).toContain(
        result.report.sessionOverview.overallSuccess
      )
    })

    it('should include objectives assessment', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.objectivesAssessment).toBeDefined()
      expect(Array.isArray(result.report.objectivesAssessment)).toBe(true)
      expect(result.report.objectivesAssessment.length).toBeGreaterThan(0)

      result.report.objectivesAssessment.forEach((assessment) => {
        expect(assessment.objective).toBeDefined()
        expect(['fully', 'partially', 'not_achieved']).toContain(assessment.achieved)
        expect(Array.isArray(assessment.evidence)).toBe(true)
        expect(Array.isArray(assessment.recommendations)).toBe(true)
      })
    })

    it('should include key findings with strengths and growth areas', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.keyFindings).toBeDefined()
      expect(result.report.keyFindings.strengths).toBeDefined()
      expect(Array.isArray(result.report.keyFindings.strengths)).toBe(true)
      expect(result.report.keyFindings.strengths.length).toBeGreaterThan(0)

      result.report.keyFindings.strengths.forEach((strength) => {
        expect(strength.area).toBeDefined()
        expect(strength.description).toBeDefined()
        expect(strength.impact).toBeDefined()
      })

      expect(result.report.keyFindings.areasForGrowth).toBeDefined()
      expect(Array.isArray(result.report.keyFindings.areasForGrowth)).toBe(true)
    })

    it('should include participant engagement analysis', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.participantEngagement).toBeDefined()
      expect(['high', 'medium', 'low']).toContain(result.report.participantEngagement.overallLevel)
      expect(Array.isArray(result.report.participantEngagement.patterns)).toBe(true)
    })

    it('should include team dynamics analysis', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.teamDynamicsAnalysis).toBeDefined()
      expect(result.report.teamDynamicsAnalysis.communication).toBeDefined()
      expect(result.report.teamDynamicsAnalysis.communication.assessment).toBeDefined()
      expect(result.report.teamDynamicsAnalysis.communication.patterns).toBeDefined()

      expect(result.report.teamDynamicsAnalysis.collaboration).toBeDefined()
      expect(result.report.teamDynamicsAnalysis.collaboration.assessment).toBeDefined()
      expect(result.report.teamDynamicsAnalysis.collaboration.patterns).toBeDefined()
    })

    it('should include actionable recommendations', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.recommendations).toBeDefined()
      expect(result.report.recommendations.immediate).toBeDefined()
      expect(Array.isArray(result.report.recommendations.immediate)).toBe(true)

      result.report.recommendations.immediate.forEach((rec) => {
        expect(rec.action).toBeDefined()
        expect(rec.rationale).toBeDefined()
        expect(rec.owner).toBeDefined()
      })

      expect(result.report.recommendations.shortTerm).toBeDefined()
      expect(result.report.recommendations.longTerm).toBeDefined()
    })

    it('should include next steps', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.nextSteps).toBeDefined()
      expect(result.report.nextSteps.followUpActivities).toBeDefined()
      expect(Array.isArray(result.report.nextSteps.followUpActivities)).toBe(true)
      expect(result.report.nextSteps.suggestedTimeline).toBeDefined()
      expect(result.report.nextSteps.metrics).toBeDefined()
    })

    it('should include appendix with activity details', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.report.appendix).toBeDefined()
      expect(result.report.appendix.activityDetails).toBeDefined()
      expect(Array.isArray(result.report.appendix.activityDetails)).toBe(true)

      result.report.appendix.activityDetails.forEach((activity) => {
        expect(activity.title).toBeDefined()
        expect(activity.duration).toBeDefined()
        expect(activity.objectives).toBeDefined()
        expect(activity.outcomes).toBeDefined()
      })
    })

    it('should include HTML formatted report', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.htmlReport).toBeDefined()
      expect(result.htmlReport).toContain('<')
      expect(result.htmlReport).toContain('>')
    })

    it('should include metrics scores', async () => {
      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(sampleInput)

      expect(result.metrics).toBeDefined()
      expect(result.metrics.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.metrics.overallScore).toBeLessThanOrEqual(100)

      expect(result.metrics.categoryScores).toBeDefined()
      expect(result.metrics.categoryScores.engagement).toBeGreaterThanOrEqual(0)
      expect(result.metrics.categoryScores.collaboration).toBeGreaterThanOrEqual(0)
      expect(result.metrics.categoryScores.communication).toBeGreaterThanOrEqual(0)
      expect(result.metrics.categoryScores.problemSolving).toBeGreaterThanOrEqual(0)
      expect(result.metrics.categoryScores.leadership).toBeGreaterThanOrEqual(0)
    })

    it('should use GPT-4o for better quality reports', async () => {
      mockDebriefGeneratorResponse(mockClient)

      await debriefGenerator.generate(sampleInput)

      expect(mockClient.chatStructured).toHaveBeenCalledTimes(1)
      const callArgs = mockClient.chatStructured.mock.calls[0]

      expect(callArgs[3]).toEqual(
        expect.objectContaining({
          model: 'gpt-4o',
        })
      )
    })

    it('should call AI client with correct context', async () => {
      mockDebriefGeneratorResponse(mockClient)

      await debriefGenerator.generate(sampleInput)

      const callArgs = mockClient.chatStructured.mock.calls[0]

      expect(callArgs[2]).toEqual({
        tenantId: 'team-building',
        vertical: 'team_building',
      })
    })

    it('should support different report formats', async () => {
      const executiveInput: DebriefGeneratorInput = {
        ...sampleInput,
        format: 'executive',
      }

      mockDebriefGeneratorResponse(mockClient)

      await debriefGenerator.generate(executiveInput)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('executive')
    })

    it('should handle session without optional observations', async () => {
      const minimalInput: DebriefGeneratorInput = {
        session: {
          id: 'session-002',
          date: '2025-01-20',
          companyName: 'Test Company',
          teamSize: 15,
          objectives: ['team building'],
        },
        activitiesCompleted: [
          {
            title: 'Team Game',
            duration: 60,
            objectives: ['fun'],
          },
        ],
        format: 'hr-standard',
      }

      mockDebriefGeneratorResponse(mockClient)

      const result = await debriefGenerator.generate(minimalInput)

      expect(result).toBeDefined()
      expect(result.report).toBeDefined()
    })

    it('should handle API errors', async () => {
      mockAIError(mockClient, 'Context length exceeded')

      await expect(debriefGenerator.generate(sampleInput)).rejects.toThrow('Context length exceeded')
    })
  })

  describe('generateQuickSummary()', () => {
    it('should generate a brief text summary', async () => {
      const summaryText =
        'The session was successful with high engagement. Team showed improved collaboration.'
      mockClient.complete.mockResolvedValueOnce({
        data: summaryText,
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        cached: false,
        latencyMs: 400,
      })

      const result = await debriefGenerator.generateQuickSummary(
        { companyName: 'Test Corp', teamSize: 20, objectives: ['communication'] },
        [{ title: 'Team Game', duration: 60 }],
        'Good energy throughout'
      )

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should use complete method instead of chatStructured', async () => {
      mockClient.complete.mockResolvedValueOnce({
        data: 'Quick summary text',
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cached: false,
        latencyMs: 300,
      })

      await debriefGenerator.generateQuickSummary(
        { companyName: 'Company', teamSize: 10, objectives: [] },
        [],
        'notes'
      )

      expect(mockClient.complete).toHaveBeenCalledTimes(1)
      expect(mockClient.chatStructured).not.toHaveBeenCalled()
    })

    it('should use GPT-4o-mini for quick summaries', async () => {
      mockClient.complete.mockResolvedValueOnce({
        data: 'Quick summary',
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cached: false,
        latencyMs: 300,
      })

      await debriefGenerator.generateQuickSummary(
        { companyName: 'Company', teamSize: 10, objectives: [] },
        [],
        'notes'
      )

      const callArgs = mockClient.complete.mock.calls[0]
      expect(callArgs[2]).toEqual(
        expect.objectContaining({
          model: 'gpt-4o-mini',
        })
      )
    })
  })
})
