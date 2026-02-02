/**
 * Unit tests for DifficultyCalibratorAI
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DifficultyCalibratorAI, DifficultyCalibratorInput } from '../difficulty-calibrator'
import {
  createMockAIClient,
  mockDifficultyCalibratorResponse,
  mockDifficultyCalibratorOutput,
  mockAIError,
  type MockAIClient,
} from '../../../../__tests__/mocks/openai'

describe('DifficultyCalibratorAI', () => {
  let mockClient: MockAIClient
  let difficultyCalibrator: DifficultyCalibratorAI

  const sampleInput: DifficultyCalibratorInput = {
    activityId: 'activity-001',
    activityTitle: 'Escape Room Challenge',
    defaultDifficulty: 'hard',
    teamProfile: {
      size: 20,
      physicalLevel: 'MEDIUM',
      averageAge: 35,
      ageRange: { min: 25, max: 55 },
      fitnessLevel: 'medium',
      cognitiveLevel: 'high',
      previousExperience: 'some',
      specialNeeds: ['wheelchair user in team'],
    },
    targetDuration: 60,
    facilitatorExperience: 'intermediate',
  }

  const sampleActivityDetails = {
    description: 'Teams work together to solve puzzles and escape a themed room within the time limit.',
    rules: 'No phones allowed. Work together to find clues and solve puzzles.',
    materials: ['Puzzle boxes', 'Locks', 'Hidden clues', 'Timer display'],
    facilitatorGuide: { setup: 'Prepare room before teams arrive...' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockAIClient()
    difficultyCalibrator = new DifficultyCalibratorAI(mockClient as any)
  })

  describe('calibrate()', () => {
    it('should return calibrated difficulty level', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(result).toBeDefined()
      expect(result.calibratedDifficulty).toBeDefined()
      expect(['easy', 'medium', 'hard', 'adaptive']).toContain(result.calibratedDifficulty)
    })

    it('should include adjustments with reasoning', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(result.adjustments).toBeDefined()
      expect(Array.isArray(result.adjustments)).toBe(true)
      expect(result.adjustments.length).toBeGreaterThan(0)

      result.adjustments.forEach((adjustment) => {
        expect(adjustment.aspect).toBeDefined()
        expect(adjustment.originalLevel).toBeDefined()
        expect(adjustment.adjustedLevel).toBeDefined()
        expect(adjustment.reasoning).toBeDefined()
      })
    })

    it('should include activity modifications', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(result.modifications).toBeDefined()
      expect(Array.isArray(result.modifications)).toBe(true)
      expect(result.modifications.length).toBeGreaterThan(0)

      result.modifications.forEach((mod) => {
        expect(mod.category).toBeDefined()
        expect(mod.modification).toBeDefined()
        expect(mod.impact).toBeDefined()
      })
    })

    it('should provide facilitator guidance', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(result.facilitatorGuidance).toBeDefined()
      expect(result.facilitatorGuidance.setupTips).toBeDefined()
      expect(Array.isArray(result.facilitatorGuidance.setupTips)).toBe(true)

      expect(result.facilitatorGuidance.watchFor).toBeDefined()
      expect(Array.isArray(result.facilitatorGuidance.watchFor)).toBe(true)

      expect(result.facilitatorGuidance.scalingOptions).toBeDefined()
      expect(Array.isArray(result.facilitatorGuidance.scalingOptions)).toBe(true)

      result.facilitatorGuidance.scalingOptions.forEach((option) => {
        expect(option.trigger).toBeDefined()
        expect(option.action).toBeDefined()
      })
    })

    it('should estimate completion time', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(result.estimatedCompletionTime).toBeDefined()
      expect(result.estimatedCompletionTime.min).toBeGreaterThan(0)
      expect(result.estimatedCompletionTime.max).toBeGreaterThan(result.estimatedCompletionTime.min)
      expect(result.estimatedCompletionTime.likely).toBeGreaterThanOrEqual(result.estimatedCompletionTime.min)
      expect(result.estimatedCompletionTime.likely).toBeLessThanOrEqual(result.estimatedCompletionTime.max)
    })

    it('should provide success prediction with likelihood and factors', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(result.successPrediction).toBeDefined()
      expect(result.successPrediction.likelihood).toBeGreaterThanOrEqual(0)
      expect(result.successPrediction.likelihood).toBeLessThanOrEqual(100)

      expect(result.successPrediction.factors).toBeDefined()
      expect(Array.isArray(result.successPrediction.factors)).toBe(true)

      expect(result.successPrediction.riskMitigation).toBeDefined()
      expect(Array.isArray(result.successPrediction.riskMitigation)).toBe(true)
    })

    it('should call AI client with correct context', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      expect(mockClient.chatStructured).toHaveBeenCalledTimes(1)
      const callArgs = mockClient.chatStructured.mock.calls[0]

      expect(callArgs[2]).toEqual({
        tenantId: 'team-building',
        vertical: 'team_building',
      })
    })

    it('should consider special needs in calibration', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      await difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('wheelchair')
    })

    it('should work without activity details', async () => {
      mockDifficultyCalibratorResponse(mockClient)

      const result = await difficultyCalibrator.calibrate(sampleInput)

      expect(result).toBeDefined()
      expect(result.calibratedDifficulty).toBeDefined()
    })

    it('should handle teams with mixed fitness levels', async () => {
      const mixedFitnessInput: DifficultyCalibratorInput = {
        ...sampleInput,
        teamProfile: {
          ...sampleInput.teamProfile,
          fitnessLevel: 'mixed',
        },
      }

      mockDifficultyCalibratorResponse(mockClient)

      await difficultyCalibrator.calibrate(mixedFitnessInput, sampleActivityDetails)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('mixed')
    })

    it('should handle API errors', async () => {
      mockAIError(mockClient, 'Model overloaded')

      await expect(
        difficultyCalibrator.calibrate(sampleInput, sampleActivityDetails)
      ).rejects.toThrow('Model overloaded')
    })
  })

  describe('quickCalibrate()', () => {
    it('should return adjusted difficulty level string', async () => {
      mockClient.chatStructured.mockResolvedValueOnce({
        data: {
          adjustedDifficulty: 'medium',
          reasoning: 'Team profile suggests medium difficulty would provide optimal challenge.',
        },
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cached: false,
        latencyMs: 300,
      })

      const result = await difficultyCalibrator.quickCalibrate('hard', 15, 'LOW', 'none')

      expect(result).toBeDefined()
      expect(['easy', 'medium', 'hard', 'adaptive']).toContain(result)
    })

    it('should adjust difficulty based on team size', async () => {
      mockClient.chatStructured.mockResolvedValueOnce({
        data: {
          adjustedDifficulty: 'easy',
          reasoning: 'Very large team requires simpler coordination.',
        },
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cached: false,
        latencyMs: 300,
      })

      await difficultyCalibrator.quickCalibrate('hard', 50, undefined, undefined)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('50')
    })

    it('should use lower temperature for consistent results', async () => {
      mockClient.chatStructured.mockResolvedValueOnce({
        data: {
          adjustedDifficulty: 'medium',
          reasoning: 'Balanced for team profile.',
        },
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cached: false,
        latencyMs: 300,
      })

      await difficultyCalibrator.quickCalibrate('medium', 20)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      expect(callArgs[3]).toEqual(
        expect.objectContaining({
          temperature: 0.3,
        })
      )
    })

    it('should handle beginner facilitator', async () => {
      const beginnerInput: DifficultyCalibratorInput = {
        ...sampleInput,
        facilitatorExperience: 'beginner',
      }

      mockDifficultyCalibratorResponse(mockClient)

      await difficultyCalibrator.calibrate(beginnerInput, sampleActivityDetails)

      const callArgs = mockClient.chatStructured.mock.calls[0]
      const userMessage = callArgs[0].find((m: any) => m.role === 'user')?.content
      expect(userMessage).toContain('beginner')
    })
  })
})
