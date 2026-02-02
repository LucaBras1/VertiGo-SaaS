/**
 * Unit tests for TeamDynamicsAI
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TeamDynamicsAI, TeamDynamicsInput } from '../team-dynamics'
import {
  createMockAIClient,
  mockTeamDynamicsResponse,
  mockTeamDynamicsOutput,
  mockAIError,
  type MockAIClient,
} from '../../../../__tests__/mocks/openai'

describe('TeamDynamicsAI', () => {
  let mockClient: MockAIClient
  let teamDynamics: TeamDynamicsAI

  const sampleInput: TeamDynamicsInput = {
    teamSize: 20,
    objectives: ['Improve communication', 'Build trust', 'Enhance problem-solving'],
    industryType: 'Technology',
    physicalLevel: 'MEDIUM',
    indoorOutdoor: 'BOTH',
    duration: 180,
    previousActivities: ['Escape Room', 'Team Lunch'],
    teamComposition: {
      departments: ['Engineering', 'Sales', 'Marketing'],
      seniority: {
        junior: 8,
        mid: 7,
        senior: 4,
        executive: 1,
      },
      ages: {
        min: 24,
        max: 55,
      },
    },
  }

  const sampleActivities = [
    {
      id: 'act-001',
      title: 'Escape Room Challenge',
      objectives: ['problem-solving', 'communication', 'collaboration'],
      minParticipants: 4,
      maxParticipants: 30,
      physicalDemand: 'LOW',
      indoorOutdoor: 'INDOOR',
      duration: 90,
      learningOutcomes: ['Critical thinking', 'Team coordination', 'Time management'],
      description: 'Teams solve puzzles to escape a themed room within time limit.',
    },
    {
      id: 'act-002',
      title: 'Team Canvas Workshop',
      objectives: ['alignment', 'values', 'goal-setting'],
      minParticipants: 5,
      maxParticipants: 50,
      physicalDemand: 'LOW',
      indoorOutdoor: 'INDOOR',
      duration: 60,
      learningOutcomes: ['Shared vision', 'Team agreements', 'Role clarity'],
      description: 'Structured workshop to define team purpose, values, and ways of working.',
    },
    {
      id: 'act-003',
      title: 'Outdoor Navigation Challenge',
      objectives: ['trust', 'communication', 'fun'],
      minParticipants: 6,
      maxParticipants: 40,
      physicalDemand: 'MEDIUM',
      indoorOutdoor: 'OUTDOOR',
      duration: 45,
      learningOutcomes: ['Trust building', 'Non-verbal communication', 'Adaptability'],
      description: 'Teams navigate outdoor course using maps and teamwork.',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockAIClient()
    teamDynamics = new TeamDynamicsAI(mockClient as any)
  })

  describe('analyze()', () => {
    it('should return recommended activities', async () => {
      mockTeamDynamicsResponse(mockClient)

      const result = await teamDynamics.analyze(sampleInput, sampleActivities)

      expect(result).toBeDefined()
      expect(result.recommendedActivities).toBeDefined()
      expect(result.recommendedActivities.length).toBeGreaterThan(0)
    })

    it('should include match scores for each activity', async () => {
      mockTeamDynamicsResponse(mockClient)

      const result = await teamDynamics.analyze(sampleInput, sampleActivities)

      result.recommendedActivities.forEach((activity) => {
        expect(activity.activityId).toBeDefined()
        expect(activity.title).toBeDefined()
        expect(activity.matchScore).toBeGreaterThanOrEqual(0)
        expect(activity.matchScore).toBeLessThanOrEqual(100)
        expect(activity.reasoning).toBeDefined()
        expect(activity.expectedOutcomes).toBeDefined()
        expect(Array.isArray(activity.expectedOutcomes)).toBe(true)
      })
    })

    it('should provide team analysis with strengths and challenges', async () => {
      mockTeamDynamicsResponse(mockClient)

      const result = await teamDynamics.analyze(sampleInput, sampleActivities)

      expect(result.teamAnalysis).toBeDefined()
      expect(result.teamAnalysis.strengths).toBeDefined()
      expect(Array.isArray(result.teamAnalysis.strengths)).toBe(true)
      expect(result.teamAnalysis.strengths.length).toBeGreaterThan(0)

      expect(result.teamAnalysis.challenges).toBeDefined()
      expect(Array.isArray(result.teamAnalysis.challenges)).toBe(true)
      expect(result.teamAnalysis.challenges.length).toBeGreaterThan(0)

      expect(result.teamAnalysis.recommendations).toBeDefined()
      expect(Array.isArray(result.teamAnalysis.recommendations)).toBe(true)
    })

    it('should include suggested activity sequence when multiple activities recommended', async () => {
      mockTeamDynamicsResponse(mockClient)

      const result = await teamDynamics.analyze(sampleInput, sampleActivities)

      if (result.suggestedSequence) {
        expect(Array.isArray(result.suggestedSequence)).toBe(true)
        result.suggestedSequence.forEach((step) => {
          expect(step.step).toBeDefined()
          expect(step.activityId).toBeDefined()
          expect(step.duration).toBeGreaterThan(0)
          expect(step.rationale).toBeDefined()
        })
      }
    })

    it('should include adaptations for recommended activities', async () => {
      mockTeamDynamicsResponse(mockClient)

      const result = await teamDynamics.analyze(sampleInput, sampleActivities)

      const activityWithAdaptations = result.recommendedActivities.find(
        (a) => a.adaptations && a.adaptations.length > 0
      )

      if (activityWithAdaptations) {
        expect(Array.isArray(activityWithAdaptations.adaptations)).toBe(true)
        activityWithAdaptations.adaptations?.forEach((adaptation) => {
          expect(typeof adaptation).toBe('string')
        })
      }
    })

    it('should call AI client with correct team building context', async () => {
      mockTeamDynamicsResponse(mockClient)

      await teamDynamics.analyze(sampleInput, sampleActivities)

      expect(mockClient.chatStructured).toHaveBeenCalledTimes(1)
      const callArgs = mockClient.chatStructured.mock.calls[0]

      // Check context
      expect(callArgs[2]).toEqual({
        tenantId: 'team-building',
        vertical: 'team_building',
      })

      // Check model
      expect(callArgs[3]).toEqual(
        expect.objectContaining({
          model: 'gpt-4o-mini',
        })
      )
    })

    it('should consider team size constraints when matching activities', async () => {
      const smallTeamInput: TeamDynamicsInput = {
        teamSize: 4, // Small team
        objectives: ['communication'],
      }

      mockTeamDynamicsResponse(mockClient)

      await teamDynamics.analyze(smallTeamInput, sampleActivities)

      // The AI should receive team size information
      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('4')
    })

    it('should consider physical level preferences', async () => {
      const lowPhysicalInput: TeamDynamicsInput = {
        teamSize: 15,
        objectives: ['teamwork'],
        physicalLevel: 'LOW',
      }

      mockTeamDynamicsResponse(mockClient)

      await teamDynamics.analyze(lowPhysicalInput, sampleActivities)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('LOW')
    })

    it('should avoid previously done activities', async () => {
      const inputWithPrevious: TeamDynamicsInput = {
        teamSize: 20,
        objectives: ['communication'],
        previousActivities: ['Escape Room', 'Team Trivia'],
      }

      mockTeamDynamicsResponse(mockClient)

      await teamDynamics.analyze(inputWithPrevious, sampleActivities)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('Escape Room')
      expect(userMessage).toContain('Team Trivia')
    })

    it('should handle team composition details', async () => {
      mockTeamDynamicsResponse(mockClient)

      await teamDynamics.analyze(sampleInput, sampleActivities)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content

      expect(userMessage).toContain('Engineering')
      expect(userMessage).toContain('Sales')
      expect(userMessage).toContain('Marketing')
    })

    it('should handle API errors', async () => {
      mockAIError(mockClient, 'Service temporarily unavailable')

      await expect(teamDynamics.analyze(sampleInput, sampleActivities)).rejects.toThrow(
        'Service temporarily unavailable'
      )
    })

    it('should work with minimal input', async () => {
      const minimalInput: TeamDynamicsInput = {
        teamSize: 10,
        objectives: ['team building'],
      }

      mockTeamDynamicsResponse(mockClient)

      const result = await teamDynamics.analyze(minimalInput, sampleActivities)

      expect(result).toBeDefined()
      expect(result.recommendedActivities).toBeDefined()
    })
  })
})
