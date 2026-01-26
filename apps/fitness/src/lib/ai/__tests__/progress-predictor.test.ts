/**
 * Unit tests for ProgressPredictorAI - Goal Timeline Prediction
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { predictProgress, ProgressPredictorInput } from '../progress-predictor'
import { createMockContext } from '../../../../__tests__/setup'
import { disableOpenAIMocks, enableOpenAIMocks } from '../../../../__tests__/mocks/openai'

describe('ProgressPredictorAI - predictProgress', () => {
  const mockWeightLossInput: ProgressPredictorInput = {
    client: {
      id: 'client-123',
      name: 'Sarah Johnson',
    },
    currentMetrics: {
      weight: 85,
      bodyFat: 32,
      measurements: {
        waist: 90,
        hips: 105,
      },
    },
    goalMetrics: {
      weight: 75,
      bodyFat: 25,
      measurements: {
        waist: 75,
        hips: 95,
      },
    },
    behaviorData: {
      adherenceRate: 85,
      weeklyFrequency: 3,
      avgSessionDuration: 60,
      dietAdherence: 80,
    },
    historicalData: {
      measurements: [
        {
          date: '2025-01-01',
          weight: 87,
          bodyFat: 33,
        },
        {
          date: '2025-01-15',
          weight: 86,
          bodyFat: 32.5,
        },
      ],
      progressRate: 0.5,
    },
    preferences: {
      intensity: 'moderate',
    },
  }

  const mockMuscleGainInput: ProgressPredictorInput = {
    ...mockWeightLossInput,
    currentMetrics: {
      weight: 70,
      measurements: {
        chest: 95,
        arms: 32,
      },
    },
    goalMetrics: {
      weight: 75,
      measurements: {
        chest: 105,
        arms: 38,
      },
    },
    behaviorData: {
      adherenceRate: 90,
      weeklyFrequency: 4,
      avgSessionDuration: 75,
      dietAdherence: 85,
    },
  }

  beforeEach(() => {
    disableOpenAIMocks()
    vi.clearAllMocks()
  })

  describe('Prediction Calculation', () => {
    it('should generate prediction for weight loss goal', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.prediction.estimatedWeeksToGoal).toBeGreaterThan(0)
      expect(result.prediction.estimatedCompletionDate).toMatch(/\d{4}-\d{2}-\d{2}/)
      expect(result.prediction.confidenceLevel).toBeGreaterThan(0)
      expect(result.prediction.confidenceLevel).toBeLessThanOrEqual(100)
      expect(result.prediction.likelihood).toBeDefined()
    })

    it('should generate prediction for muscle gain goal', async () => {
      const result = await predictProgress(mockMuscleGainInput, createMockContext())

      expect(result.prediction.estimatedWeeksToGoal).toBeGreaterThan(0)
      expect(result.prediction.confidenceLevel).toBeGreaterThan(0)
      expect(result.prediction.likelihood).toBeDefined()
      // Muscle gain predictions should have valid structure
      expect(result.milestones).toBeDefined()
      expect(result.analysis).toBeDefined()
    })

    it('should adjust timeline based on adherence rate', async () => {
      const highAdherenceInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 95 },
      }
      const lowAdherenceInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 60 },
      }

      const highResult = await predictProgress(highAdherenceInput, createMockContext())
      const lowResult = await predictProgress(lowAdherenceInput, createMockContext())

      expect(lowResult.prediction.estimatedWeeksToGoal).toBeGreaterThan(
        highResult.prediction.estimatedWeeksToGoal
      )
    })

    it('should adjust confidence based on frequency', async () => {
      const highFreqInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, weeklyFrequency: 5 },
      }
      const lowFreqInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, weeklyFrequency: 1 },
      }

      const highResult = await predictProgress(highFreqInput, createMockContext())
      const lowResult = await predictProgress(lowFreqInput, createMockContext())

      expect(highResult.prediction.confidenceLevel).toBeGreaterThan(
        lowResult.prediction.confidenceLevel
      )
    })
  })

  describe('Milestones Generation', () => {
    it('should generate weekly milestones', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.milestones.length).toBeGreaterThan(0)
      result.milestones.forEach((milestone, index) => {
        expect(milestone.week).toBe(index + 1)
        expect(milestone.date).toMatch(/\d{4}-\d{2}-\d{2}/)
        expect(milestone.expectedProgress).toBeDefined()
        expect(milestone.metrics).toBeDefined()
        expect(milestone.checkpoints.length).toBeGreaterThan(0)
      })
    })

    it('should show progressive weight changes in milestones', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      const firstMilestone = result.milestones[0]
      const lastMilestone = result.milestones[result.milestones.length - 1]

      expect(firstMilestone.metrics.weight).toBeGreaterThan(lastMilestone.metrics.weight)
    })

    it('should include checkpoints at key intervals', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      const fourWeekMilestone = result.milestones.find((m) => m.week === 4)

      if (fourWeekMilestone) {
        expect(fourWeekMilestone.checkpoints).toContain('Progress photos')
      }
    })

    it('should limit milestones to reasonable number', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.milestones.length).toBeLessThanOrEqual(8)
    })
  })

  describe('Analysis', () => {
    it('should assess current trend correctly', async () => {
      const excellentInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 95 },
      }
      const poorInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 45 },
      }

      const excellentResult = await predictProgress(excellentInput, createMockContext())
      const poorResult = await predictProgress(poorInput, createMockContext())

      expect(excellentResult.analysis.currentTrend).toMatch(/excellent|good/)
      expect(poorResult.analysis.currentTrend).toMatch(/slow|stagnant|regressing/)
    })

    it('should provide adherence impact analysis', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.analysis.adherenceImpact).toBeDefined()
      expect(result.analysis.adherenceImpact.length).toBeGreaterThan(0)
    })

    it('should provide frequency impact analysis', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.analysis.frequencyImpact).toBeDefined()
      expect(result.analysis.frequencyImpact).toContain('frequency')
    })

    it('should include diet impact when provided', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.analysis.dietImpact).toBeDefined()
      expect(result.analysis.dietImpact).toContain('nutrition')
    })

    it('should not include diet impact when not provided', async () => {
      const noDietInput = {
        ...mockWeightLossInput,
        behaviorData: {
          adherenceRate: 85,
          weeklyFrequency: 3,
        },
      }

      const result = await predictProgress(noDietInput, createMockContext())

      expect(result.analysis.dietImpact).toBeUndefined()
    })
  })

  describe('Recommendations', () => {
    it('should recommend improving adherence if low', async () => {
      const lowAdherenceInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 70 },
      }

      const result = await predictProgress(lowAdherenceInput, createMockContext())

      const adherenceRec = result.recommendations.find((r) => r.category === 'consistency')

      expect(adherenceRec).toBeDefined()
      expect(adherenceRec?.priority).toBe('high')
    })

    it('should recommend increasing frequency if low', async () => {
      const lowFreqInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, weeklyFrequency: 2 },
      }

      const result = await predictProgress(lowFreqInput, createMockContext())

      const freqRec = result.recommendations.find((r) => r.category === 'frequency')

      expect(freqRec).toBeDefined()
      expect(freqRec?.expectedImpact).toBeDefined()
    })

    it('should recommend nutrition improvements for weight loss', async () => {
      const lowDietInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, dietAdherence: 60 },
      }

      const result = await predictProgress(lowDietInput, createMockContext())

      const nutritionRec = result.recommendations.find((r) => r.category === 'nutrition')

      expect(nutritionRec).toBeDefined()
      expect(nutritionRec?.suggestion).toContain('calorie deficit')
    })

    it('should recommend recovery priorities', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      const recoveryRec = result.recommendations.find((r) => r.category === 'recovery')

      expect(recoveryRec).toBeDefined()
      expect(recoveryRec?.suggestion).toContain('sleep')
    })

    it('should prioritize recommendations correctly', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      result.recommendations.forEach((rec) => {
        expect(['high', 'medium', 'low']).toContain(rec.priority)
      })
    })
  })

  describe('Risk Factors', () => {
    it('should identify low adherence as risk', async () => {
      const lowAdherenceInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 65 },
      }

      const result = await predictProgress(lowAdherenceInput, createMockContext())

      const adherenceRisk = result.riskFactors.find((r) => r.factor.includes('adherence'))

      expect(adherenceRisk).toBeDefined()
      expect(adherenceRisk?.severity).toBe('high')
    })

    it('should identify low frequency as risk', async () => {
      const lowFreqInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, weeklyFrequency: 1 },
      }

      const result = await predictProgress(lowFreqInput, createMockContext())

      const freqRisk = result.riskFactors.find((r) => r.factor.includes('frequency'))

      expect(freqRisk).toBeDefined()
    })

    it('should identify low diet adherence as risk', async () => {
      const lowDietInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, dietAdherence: 50 },
      }

      const result = await predictProgress(lowDietInput, createMockContext())

      const dietRisk = result.riskFactors.find((r) => r.factor.includes('Nutrition'))

      expect(dietRisk).toBeDefined()
    })

    it('should provide mitigation strategies for each risk', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      result.riskFactors.forEach((risk) => {
        expect(risk.mitigation).toBeDefined()
        expect(risk.mitigation.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Motivation', () => {
    it('should provide encouragement based on trend', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.motivation.encouragement).toBeDefined()
      expect(result.motivation.encouragement.length).toBeGreaterThan(0)
    })

    it('should set realistic expectations', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.motivation.realisticExpectation).toBeDefined()
      expect(result.motivation.realisticExpectation).toContain('month')
    })

    it('should provide quick wins', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result.motivation.quickWins.length).toBeGreaterThan(0)
      result.motivation.quickWins.forEach((win) => {
        expect(win.length).toBeGreaterThan(0)
      })
    })

    it('should adjust encouragement for poor trends', async () => {
      const poorInput = {
        ...mockWeightLossInput,
        behaviorData: { ...mockWeightLossInput.behaviorData, adherenceRate: 40 },
      }

      const result = await predictProgress(poorInput, createMockContext())

      expect(result.motivation.encouragement).toContain('reset')
    })
  })

  describe('Likelihood Assessment', () => {
    it('should mark high adherence as very_likely', async () => {
      const highAdherenceInput = {
        ...mockWeightLossInput,
        behaviorData: {
          adherenceRate: 95,
          weeklyFrequency: 4,
          dietAdherence: 90,
        },
      }

      const result = await predictProgress(highAdherenceInput, createMockContext())

      expect(result.prediction.likelihood).toBe('very_likely')
    })

    it('should mark low adherence as needs_adjustment', async () => {
      const lowAdherenceInput = {
        ...mockWeightLossInput,
        behaviorData: {
          adherenceRate: 30,
          weeklyFrequency: 1,
          dietAdherence: 40,
        },
      }

      const result = await predictProgress(lowAdherenceInput, createMockContext())

      expect(result.prediction.likelihood).toMatch(/challenging|needs_adjustment/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle input without historical data', async () => {
      const noHistoryInput = {
        ...mockWeightLossInput,
        historicalData: undefined,
      }

      const result = await predictProgress(noHistoryInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.prediction.estimatedWeeksToGoal).toBeGreaterThan(0)
    })

    it('should handle input without diet adherence', async () => {
      const noDietInput = {
        ...mockWeightLossInput,
        behaviorData: {
          adherenceRate: 85,
          weeklyFrequency: 3,
        },
      }

      const result = await predictProgress(noDietInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.analysis.dietImpact).toBeUndefined()
    })

    it('should validate input schema', async () => {
      const invalidInput = {
        ...mockWeightLossInput,
        behaviorData: {
          ...mockWeightLossInput.behaviorData,
          adherenceRate: 150, // Invalid: > 100
        },
      }

      await expect(predictProgress(invalidInput, createMockContext())).rejects.toThrow()
    })

    it('should handle very short timelines', async () => {
      const shortGoalInput = {
        ...mockWeightLossInput,
        currentMetrics: { weight: 75.5 },
        goalMetrics: { weight: 75 },
      }

      const result = await predictProgress(shortGoalInput, createMockContext())

      expect(result.prediction.estimatedWeeksToGoal).toBeGreaterThanOrEqual(1)
    })
  })

  describe('OpenAI Mode', () => {
    beforeEach(() => {
      enableOpenAIMocks()
    })

    afterEach(() => {
      disableOpenAIMocks()
    })

    it('should return valid prediction in OpenAI mode', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.prediction).toBeDefined()
      expect(result.milestones).toBeDefined()
    })

    it('should include all required sections in OpenAI mode', async () => {
      const result = await predictProgress(mockWeightLossInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.prediction.estimatedWeeksToGoal).toBeGreaterThan(0)
      expect(result.analysis).toBeDefined()
      expect(result.recommendations).toBeDefined()
    })
  })
})
