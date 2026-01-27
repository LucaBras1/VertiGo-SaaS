/**
 * Unit tests for ChurnDetectorAI - Client Retention Analysis
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectChurnRisk, ChurnDetectorInput } from '../churn-detector'
import { createMockContext } from '../../../../__tests__/setup'
import { disableOpenAIMocks, enableOpenAIMocks } from '../../../../__tests__/mocks/openai'

describe('ChurnDetectorAI - detectChurnRisk', () => {
  const mockLowRiskInput: ChurnDetectorInput = {
    client: {
      id: 'client-123',
      name: 'Jane Smith',
      startDate: '2024-01-01',
      membershipType: 'premium',
    },
    attendanceData: {
      totalSessionsBooked: 40,
      totalSessionsAttended: 38,
      totalSessionsCancelled: 2,
      totalNoShows: 0,
      lastSessionDate: '2025-01-24',
      daysSinceLastSession: 2,
      averageSessionsPerWeek: 3.5,
      trendLastMonth: 'stable',
    },
    engagementData: {
      responsiveness: 'high',
      lastMessageDate: '2025-01-25',
      appUsage: 'active',
      progressPhotoFrequency: 'regular',
    },
    progressData: {
      goalProgress: 75,
      plateauWeeks: 0,
      satisfactionScore: 5,
    },
    financialData: {
      outstandingBalance: 0,
      paymentIssues: 0,
      packageCreditsRemaining: 8,
      lastPaymentDate: '2025-01-01',
    },
  }

  const mockHighRiskInput: ChurnDetectorInput = {
    ...mockLowRiskInput,
    attendanceData: {
      totalSessionsBooked: 40,
      totalSessionsAttended: 20,
      totalSessionsCancelled: 15,
      totalNoShows: 5,
      lastSessionDate: '2024-12-15',
      daysSinceLastSession: 42,
      averageSessionsPerWeek: 0.5,
      trendLastMonth: 'decreasing',
    },
    engagementData: {
      responsiveness: 'low',
      lastMessageDate: '2024-12-20',
      appUsage: 'none',
      progressPhotoFrequency: 'never',
    },
    progressData: {
      goalProgress: 15,
      plateauWeeks: 8,
      satisfactionScore: 2,
    },
    financialData: {
      outstandingBalance: 800,
      paymentIssues: 3,
      packageCreditsRemaining: 1,
    },
  }

  beforeEach(() => {
    disableOpenAIMocks()
    vi.clearAllMocks()
  })

  describe('Risk Assessment', () => {
    it('should identify low-risk client', async () => {
      const result = await detectChurnRisk(mockLowRiskInput, createMockContext())

      expect(result.riskAssessment.riskLevel).toBe('very_low')
      expect(result.riskAssessment.riskScore).toBeLessThan(25)
      expect(result.riskAssessment.urgency).toBe('low')
    })

    it('should identify high-risk client', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.riskAssessment.riskLevel).toMatch(/high|critical/)
      expect(result.riskAssessment.riskScore).toBeGreaterThan(65)
      expect(result.riskAssessment.urgency).toMatch(/high|immediate/)
    })

    it('should calculate churn probability correctly', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.riskAssessment.churnProbability).toBeGreaterThan(0)
      expect(result.riskAssessment.churnProbability).toBeLessThanOrEqual(100)
    })

    it('should identify medium risk client', async () => {
      const mediumRiskInput = {
        ...mockLowRiskInput,
        attendanceData: {
          ...mockLowRiskInput.attendanceData,
          daysSinceLastSession: 14,
          trendLastMonth: 'decreasing' as const,
          averageSessionsPerWeek: 1.0,
        },
        engagementData: {
          ...mockLowRiskInput.engagementData,
          responsiveness: 'medium' as const,
        },
      }

      const result = await detectChurnRisk(mediumRiskInput, createMockContext())

      // Risk level should be between very_low and high
      expect(['very_low', 'low', 'medium']).toContain(result.riskAssessment.riskLevel)
    })
  })

  describe('Risk Factors Identification', () => {
    it('should identify attendance gap as risk factor', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const attendanceGapFactor = result.riskFactors.find((f) =>
        f.factor.includes('Attendance Gap')
      )

      expect(attendanceGapFactor).toBeDefined()
      expect(attendanceGapFactor?.severity).toMatch(/high|critical/)
    })

    it('should identify low engagement as risk factor', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const engagementFactor = result.riskFactors.find((f) =>
        f.factor.includes('Responsiveness')
      )

      expect(engagementFactor).toBeDefined()
    })

    it('should identify progress plateau as risk factor', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const plateauFactor = result.riskFactors.find((f) => f.factor.includes('Plateau'))

      expect(plateauFactor).toBeDefined()
      expect(plateauFactor?.severity).toMatch(/high|medium/)
    })

    it('should identify financial issues as risk factor', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const financialFactor = result.riskFactors.find((f) =>
        f.factor.includes('Outstanding Balance')
      )

      expect(financialFactor).toBeDefined()
    })

    it('should sort risk factors by severity', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const severityOrder = ['critical', 'high', 'medium', 'low']

      for (let i = 0; i < result.riskFactors.length - 1; i++) {
        const currentIndex = severityOrder.indexOf(result.riskFactors[i].severity)
        const nextIndex = severityOrder.indexOf(result.riskFactors[i + 1].severity)

        expect(currentIndex).toBeLessThanOrEqual(nextIndex)
      }
    })
  })

  describe('Behavioral Patterns', () => {
    it('should describe attendance trend accurately', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.behavioralPatterns.attendanceTrend).toContain('Declining')
      expect(result.behavioralPatterns.attendanceTrend).toContain('0.5')
    })

    it('should describe engagement trend', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.behavioralPatterns.engagementTrend).toContain('low')
    })

    it('should detect warning signs', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.behavioralPatterns.warningSignsDetected.length).toBeGreaterThan(0)
      expect(result.behavioralPatterns.warningSignsDetected.some((w) => w.includes('🚨'))).toBe(
        true
      )
    })
  })

  describe('Retention Strategies', () => {
    it('should provide immediate action for critical risk', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const immediateAction = result.retentionStrategies.find((s) => s.priority === 'immediate')

      expect(immediateAction).toBeDefined()
      expect(immediateAction?.action).toBeDefined()
      expect(immediateAction?.timing).toContain('24 hours')
    })

    it('should provide message templates for outreach', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const templatedStrategy = result.retentionStrategies.find((s) => s.template)

      expect(templatedStrategy).toBeDefined()
      expect(templatedStrategy?.template).toContain('[Name]')
    })

    it('should suggest program reset for plateau', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const programResetStrategy = result.retentionStrategies.find((s) =>
        s.action.includes('Program reset')
      )

      expect(programResetStrategy).toBeDefined()
    })

    it('should prioritize strategies correctly', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      const priorities = result.retentionStrategies.map((s) => s.priority)

      expect(priorities).toContain('immediate')
    })
  })

  describe('Automated Actions', () => {
    it('should suggest automated actions based on triggers', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.automatedActions.length).toBeGreaterThan(0)
      result.automatedActions.forEach((action) => {
        expect(action).toHaveProperty('trigger')
        expect(action).toHaveProperty('action')
        expect(action).toHaveProperty('when')
      })
    })

    it('should trigger email for 7+ day absence', async () => {
      const sevenDayInput = {
        ...mockLowRiskInput,
        attendanceData: {
          ...mockLowRiskInput.attendanceData,
          daysSinceLastSession: 8,
        },
      }

      const result = await detectChurnRisk(sevenDayInput, createMockContext())

      const emailAction = result.automatedActions.find((a) => a.trigger.includes('7 days'))

      expect(emailAction).toBeDefined()
    })
  })

  describe('Timeline Estimation', () => {
    it('should estimate churn window for high risk', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.timeline.estimatedChurnWindow).toBeDefined()
      expect(result.timeline.actionDeadline).toContain('hours')
    })

    it('should provide longer window for low risk', async () => {
      const result = await detectChurnRisk(mockLowRiskInput, createMockContext())

      expect(result.timeline.estimatedChurnWindow).toMatch(/week|month/)
    })

    it('should provide check-in schedule', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.timeline.checkInSchedule.length).toBeGreaterThan(0)
    })
  })

  describe('Insights', () => {
    it('should identify likely reasons for churn risk', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.insights.likelyReasons.length).toBeGreaterThan(0)
    })

    it('should provide successful retention tactics', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result.insights.successfulRetentionTactics.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle client with no workout history', async () => {
      const noHistoryInput = {
        ...mockLowRiskInput,
        attendanceData: {
          ...mockLowRiskInput.attendanceData,
          totalSessionsBooked: 0,
          totalSessionsAttended: 0,
        },
      }

      const result = await detectChurnRisk(noHistoryInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.riskAssessment.riskLevel).toBeDefined()
    })

    it('should validate input schema', async () => {
      const invalidInput = {
        ...mockLowRiskInput,
        progressData: {
          ...mockLowRiskInput.progressData,
          goalProgress: 150, // Invalid: > 100
        },
      }

      await expect(detectChurnRisk(invalidInput, createMockContext())).rejects.toThrow()
    })
  })

  describe('OpenAI Mode', () => {
    beforeEach(() => {
      enableOpenAIMocks()
    })

    afterEach(() => {
      disableOpenAIMocks()
    })

    it('should return valid churn assessment in OpenAI mode', async () => {
      const result = await detectChurnRisk(mockLowRiskInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.riskAssessment).toBeDefined()
      expect(result.riskFactors).toBeDefined()
    })

    it('should include retention strategies in OpenAI mode', async () => {
      const result = await detectChurnRisk(mockHighRiskInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.retentionStrategies).toBeDefined()
      expect(result.timeline).toBeDefined()
    })
  })
})
