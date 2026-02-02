/**
 * Unit tests for ObjectiveMatcherAI
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ObjectiveMatcherAI, ObjectiveMatcherInput } from '../objective-matcher'
import {
  createMockAIClient,
  mockObjectiveMatcherResponse,
  mockObjectiveMatcherOutput,
  mockAIError,
  mockCachedResponse,
  type MockAIClient,
} from '../../../../__tests__/mocks/openai'

describe('ObjectiveMatcherAI', () => {
  let mockClient: MockAIClient
  let objectiveMatcher: ObjectiveMatcherAI

  const sampleInput: ObjectiveMatcherInput = {
    objectives: ['Improve team communication', 'Build trust between departments'],
    customObjectives: 'We want to improve collaboration between Sales and Engineering teams.',
    teamContext: {
      size: 25,
      industry: 'Technology',
      currentChallenges: 'Remote work has reduced informal interactions between teams.',
    },
  }

  const sampleActivities = [
    {
      id: 'activity-001',
      title: 'Blindfolded Puzzle Challenge',
      objectives: ['communication', 'trust', 'problem-solving'],
      learningOutcomes: ['Active listening', 'Clear instruction giving', 'Patience'],
      description: 'Team members solve puzzles while blindfolded, relying on verbal instructions from partners.',
    },
    {
      id: 'activity-002',
      title: 'Team Storytelling Circle',
      objectives: ['communication', 'creativity', 'collaboration'],
      learningOutcomes: ['Collaborative creativity', 'Building on ideas', 'Attentive listening'],
      description: 'Each team member adds to a collective story, building on previous contributions.',
    },
    {
      id: 'activity-003',
      title: 'Trust Fall & Catch',
      objectives: ['trust', 'vulnerability', 'reliability'],
      learningOutcomes: ['Physical trust', 'Dependability', 'Psychological safety'],
      description: 'Classic trust exercise where participants fall and are caught by team members.',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockAIClient()
    objectiveMatcher = new ObjectiveMatcherAI(mockClient as any)
  })

  describe('match()', () => {
    it('should return matched activities for given objectives', async () => {
      mockObjectiveMatcherResponse(mockClient)

      const result = await objectiveMatcher.match(sampleInput, sampleActivities)

      expect(result).toBeDefined()
      expect(result.matches).toBeDefined()
      expect(result.matches.length).toBeGreaterThan(0)
    })

    it('should include activity recommendations with alignment scores', async () => {
      mockObjectiveMatcherResponse(mockClient)

      const result = await objectiveMatcher.match(sampleInput, sampleActivities)

      const firstMatch = result.matches[0]
      expect(firstMatch.objectiveName).toBeDefined()
      expect(firstMatch.activityRecommendations).toBeDefined()
      expect(firstMatch.activityRecommendations.length).toBeGreaterThan(0)

      const firstRecommendation = firstMatch.activityRecommendations[0]
      expect(firstRecommendation.activityId).toBeDefined()
      expect(firstRecommendation.alignmentScore).toBeGreaterThanOrEqual(0)
      expect(firstRecommendation.alignmentScore).toBeLessThanOrEqual(100)
      expect(firstRecommendation.how).toBeDefined()
      expect(firstRecommendation.expectedImpact).toBeDefined()
    })

    it('should include integration suggestions', async () => {
      mockObjectiveMatcherResponse(mockClient)

      const result = await objectiveMatcher.match(sampleInput, sampleActivities)

      expect(result.integrationSuggestions).toBeDefined()
      expect(result.integrationSuggestions.length).toBeGreaterThan(0)

      const suggestion = result.integrationSuggestions[0]
      expect(suggestion.objective).toBeDefined()
      expect(suggestion.strategy).toBeDefined()
      expect(suggestion.implementationTips).toBeDefined()
      expect(Array.isArray(suggestion.implementationTips)).toBe(true)
    })

    it('should include measurement metrics', async () => {
      mockObjectiveMatcherResponse(mockClient)

      const result = await objectiveMatcher.match(sampleInput, sampleActivities)

      expect(result.measurementMetrics).toBeDefined()
      expect(result.measurementMetrics.length).toBeGreaterThan(0)

      const metric = result.measurementMetrics[0]
      expect(metric.objective).toBeDefined()
      expect(metric.metrics).toBeDefined()
      expect(Array.isArray(metric.metrics)).toBe(true)
      expect(metric.evaluationMethod).toBeDefined()
    })

    it('should call AI client with correct context', async () => {
      mockObjectiveMatcherResponse(mockClient)

      await objectiveMatcher.match(sampleInput, sampleActivities)

      expect(mockClient.chatStructured).toHaveBeenCalledTimes(1)
      const callArgs = mockClient.chatStructured.mock.calls[0]

      // Check messages
      expect(callArgs[0]).toBeDefined()
      expect(Array.isArray(callArgs[0])).toBe(true)

      // Check context
      expect(callArgs[2]).toEqual({
        tenantId: 'team-building',
        vertical: 'team_building',
      })
    })

    it('should handle empty objectives array', async () => {
      const emptyInput: ObjectiveMatcherInput = {
        objectives: [],
        teamContext: { size: 10 },
      }

      mockObjectiveMatcherResponse(mockClient, {
        ...mockObjectiveMatcherOutput,
        matches: [],
      })

      const result = await objectiveMatcher.match(emptyInput, sampleActivities)

      expect(result.matches).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      mockAIError(mockClient, 'API rate limit exceeded')

      await expect(objectiveMatcher.match(sampleInput, sampleActivities)).rejects.toThrow(
        'API rate limit exceeded'
      )
    })

    it('should utilize cache when available', async () => {
      mockCachedResponse(mockClient, mockObjectiveMatcherOutput)

      const result = await objectiveMatcher.match(sampleInput, sampleActivities)

      expect(result).toEqual(mockObjectiveMatcherOutput)
    })
  })

  describe('quickMatch()', () => {
    const objectives = ['Improve communication', 'Build trust']
    const simpleActivities = [
      { id: 'act-1', title: 'Activity 1', objectives: ['communication'] },
      { id: 'act-2', title: 'Activity 2', objectives: ['trust', 'teamwork'] },
      { id: 'act-3', title: 'Activity 3', objectives: ['problem-solving'] },
    ]

    it('should return top N ranked activities', async () => {
      mockClient.chatStructured.mockResolvedValueOnce({
        data: {
          rankedActivities: [
            { activityId: 'act-1', title: 'Activity 1', score: 95 },
            { activityId: 'act-2', title: 'Activity 2', score: 88 },
            { activityId: 'act-3', title: 'Activity 3', score: 65 },
          ],
        },
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        cached: false,
        latencyMs: 400,
      })

      const result = await objectiveMatcher.quickMatch(objectives, simpleActivities, 3)

      expect(result).toBeDefined()
      expect(result.length).toBeLessThanOrEqual(3)
      expect(result[0].activityId).toBeDefined()
      expect(result[0].score).toBeDefined()
    })

    it('should respect topN parameter', async () => {
      mockClient.chatStructured.mockResolvedValueOnce({
        data: {
          rankedActivities: [
            { activityId: 'act-1', title: 'Activity 1', score: 95 },
            { activityId: 'act-2', title: 'Activity 2', score: 88 },
          ],
        },
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        cached: false,
        latencyMs: 400,
      })

      const result = await objectiveMatcher.quickMatch(objectives, simpleActivities, 2)

      expect(result.length).toBeLessThanOrEqual(2)
    })

    it('should use lower temperature for consistent results', async () => {
      mockClient.chatStructured.mockResolvedValueOnce({
        data: {
          rankedActivities: [
            { activityId: 'act-1', title: 'Activity 1', score: 90 },
          ],
        },
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        cached: false,
        latencyMs: 400,
      })

      await objectiveMatcher.quickMatch(objectives, simpleActivities, 1)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      expect(callArgs[3]).toEqual(
        expect.objectContaining({
          temperature: 0.3,
        })
      )
    })
  })
})
