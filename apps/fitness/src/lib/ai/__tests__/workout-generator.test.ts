/**
 * Unit tests for WorkoutAI - Workout Plan Generation
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generateWorkout, suggestProgression, WorkoutGeneratorInput } from '../workout-generator'
import { createMockContext } from '../../../../__tests__/setup'
import { disableOpenAIMocks, enableOpenAIMocks } from '../../../../__tests__/mocks/openai'

describe('WorkoutAI - generateWorkout', () => {
  const mockInput: WorkoutGeneratorInput = {
    client: {
      id: 'client-123',
      name: 'John Doe',
      fitnessLevel: 'intermediate',
      goals: ['muscle_gain', 'strength'],
      injuries: [],
      age: 30,
      weight: 85,
      height: 180,
    },
    session: {
      duration: 60,
      type: 'strength',
      focusAreas: ['chest', 'arms'],
      intensity: 'high',
    },
    equipment: {
      available: ['dumbbells', 'barbells', 'bench'],
      location: 'gym',
    },
    history: {
      lastWorkouts: [
        {
          date: '2025-01-20',
          focusAreas: ['back', 'arms'],
          exercises: ['Pull-ups', 'Rows'],
        },
      ],
      muscleRecoveryStatus: {
        chest: 100,
        triceps: 100,
      },
    },
    preferences: {
      favoriteExercises: ['Bench Press'],
      dislikedExercises: ['Burpees'],
    },
  }

  beforeEach(() => {
    disableOpenAIMocks()
    vi.clearAllMocks()
  })

  describe('Template Mode (No OpenAI)', () => {
    it('should generate a complete workout plan with template', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.warmup).toHaveLength(5)
      expect(result.mainWorkout.length).toBeGreaterThan(0)
      expect(result.cooldown).toHaveLength(5)
      expect(result.summary).toBeDefined()
      expect(result.notes).toBeDefined()
    })

    it('should include warmup exercises', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      expect(result.warmup).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            exercise: expect.any(String),
            duration: expect.any(String),
          }),
        ])
      )
    })

    it('should include main workout with proper structure', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      result.mainWorkout.forEach((exercise) => {
        expect(exercise).toHaveProperty('exercise')
        expect(exercise).toHaveProperty('sets')
        expect(exercise).toHaveProperty('reps')
        expect(exercise).toHaveProperty('restSeconds')
        expect(exercise).toHaveProperty('muscleGroups')
        expect(exercise).toHaveProperty('alternatives')
        expect(exercise).toHaveProperty('formTips')
      })
    })

    it('should adjust workout for beginner level', async () => {
      const beginnerInput = {
        ...mockInput,
        client: { ...mockInput.client, fitnessLevel: 'beginner' as const },
      }

      const result = await generateWorkout(beginnerInput, createMockContext())

      // Beginners should have fewer sets
      const firstExercise = result.mainWorkout[0]
      expect(firstExercise.sets).toBeLessThanOrEqual(3)
    })

    it('should consider client injuries', async () => {
      const injuredInput = {
        ...mockInput,
        client: { ...mockInput.client, injuries: ['knee pain', 'shoulder impingement'] },
      }

      const result = await generateWorkout(injuredInput, createMockContext())

      expect(result.notes.safetyReminders).toEqual(
        expect.arrayContaining([expect.stringContaining('knee pain')])
      )
    })

    it('should generate HIIT workout with correct structure', async () => {
      const hiitInput = {
        ...mockInput,
        session: { ...mockInput.session, type: 'hiit' as const },
      }

      const result = await generateWorkout(hiitInput, createMockContext())

      expect(result.mainWorkout.length).toBeGreaterThan(0)
      result.mainWorkout.forEach((exercise) => {
        expect(exercise.reps).toContain('seconds')
      })
    })

    it('should generate cardio workout', async () => {
      const cardioInput = {
        ...mockInput,
        session: { ...mockInput.session, type: 'cardio' as const },
      }

      const result = await generateWorkout(cardioInput, createMockContext())

      expect(result.mainWorkout.length).toBeGreaterThan(0)
      expect(result.summary.muscleGroupsCovered).toContain('full_body')
    })

    it('should estimate calories based on intensity', async () => {
      const lowIntensity = {
        ...mockInput,
        session: { ...mockInput.session, intensity: 'low' as const },
      }
      const highIntensity = {
        ...mockInput,
        session: { ...mockInput.session, intensity: 'high' as const },
      }

      const lowResult = await generateWorkout(lowIntensity, createMockContext())
      const highResult = await generateWorkout(highIntensity, createMockContext())

      expect(highResult.summary.estimatedCalories).toBeGreaterThan(
        lowResult.summary.estimatedCalories
      )
    })

    it('should provide different suggestions based on focus areas', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      expect(result.notes.nextSessionSuggestion).toBeDefined()
      expect(result.notes.nextSessionSuggestion.length).toBeGreaterThan(0)
    })

    it('should validate input schema', async () => {
      const invalidInput = {
        ...mockInput,
        session: { ...mockInput.session, duration: 200 }, // Too long
      }

      await expect(generateWorkout(invalidInput, createMockContext())).rejects.toThrow()
    })

    it('should handle missing equipment gracefully', async () => {
      const noEquipmentInput = {
        ...mockInput,
        equipment: { available: [], location: 'home' as const },
      }

      const result = await generateWorkout(noEquipmentInput, createMockContext())

      expect(result.mainWorkout[0].exercise).toContain('Bodyweight')
    })
  })

  describe('OpenAI Mode', () => {
    beforeEach(() => {
      enableOpenAIMocks()
    })

    afterEach(() => {
      disableOpenAIMocks()
    })

    it('should use OpenAI when available and return valid workout', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      // When OpenAI is enabled via mocks, should still return valid result
      expect(result).toBeDefined()
      expect(result.warmup).toBeDefined()
      expect(result.mainWorkout).toBeDefined()
      expect(result.cooldown).toBeDefined()
    })

    it('should return valid structure even with mocked OpenAI', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.mainWorkout.length).toBeGreaterThan(0)
    })

    it('should include summary in OpenAI mode', async () => {
      const result = await generateWorkout(mockInput, createMockContext())

      expect(result.summary).toBeDefined()
      expect(result.summary.totalDuration).toBeGreaterThan(0)
    })
  })
})

describe('suggestProgression', () => {
  it('should suggest weight increase for strength goal', () => {
    const lastPerformance = {
      exercise: 'Bench Press',
      sets: 4,
      reps: 5,
      weight: 80,
    }

    const suggestion = suggestProgression(lastPerformance, 'strength')

    expect(suggestion.weight).toContain('80')
    expect(suggestion.weight).toMatch(/\+\d/)
  })

  it('should suggest rep increase for hypertrophy goal', () => {
    const lastPerformance = {
      exercise: 'Squat',
      sets: 3,
      reps: 10,
      weight: 100,
    }

    const suggestion = suggestProgression(lastPerformance, 'hypertrophy')

    expect(suggestion.reps).toContain('11')
  })

  it('should suggest higher reps for endurance goal', () => {
    const lastPerformance = {
      exercise: 'Push-ups',
      sets: 3,
      reps: 15,
    }

    const suggestion = suggestProgression(lastPerformance, 'endurance')

    expect(suggestion.reps).toContain('17')
  })

  it('should handle progression at high rep ranges', () => {
    const lastPerformance = {
      exercise: 'Dumbbell Press',
      sets: 3,
      reps: 12,
      weight: 30,
    }

    const suggestion = suggestProgression(lastPerformance, 'hypertrophy')

    // At 12 reps, should suggest adding sets or weight
    expect(suggestion.sets || suggestion.weight).toBeDefined()
  })
})
