/**
 * Unit tests for NutritionAdvisorAI - Nutrition Guidance
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateNutritionAdvice, NutritionAdvisorInput } from '../nutrition-advisor'
import { createMockContext } from '../../../../__tests__/setup'
import { disableOpenAIMocks, enableOpenAIMocks } from '../../../../__tests__/mocks/openai'

describe('NutritionAdvisorAI - generateNutritionAdvice', () => {
  const mockWeightLossInput: NutritionAdvisorInput = {
    client: {
      id: 'client-123',
      name: 'Mike Thompson',
      age: 35,
      gender: 'male',
      weight: 90,
      height: 180,
    },
    goals: ['weight_loss'],
    activityLevel: 'moderately_active',
    targetWeight: 80,
    weeklyWeightChangeGoal: -0.5,
    dietaryPreferences: {
      restrictions: [],
      allergies: [],
      dislikes: ['broccoli'],
      mealsPerDay: 3,
    },
    currentHabits: {
      avgCalories: 2500,
      avgProtein: 120,
      waterIntake: 2,
    },
  }

  const mockMuscleGainInput: NutritionAdvisorInput = {
    ...mockWeightLossInput,
    client: {
      ...mockWeightLossInput.client,
      weight: 70,
    },
    goals: ['muscle_gain'],
    targetWeight: 75,
    activityLevel: 'very_active',
  }

  beforeEach(() => {
    disableOpenAIMocks()
    vi.clearAllMocks()
  })

  describe('Energy Requirements Calculation', () => {
    it('should calculate BMR correctly for males', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.energyRequirements.bmr).toBeGreaterThan(0)
      // Mifflin-St Jeor: 10*90 + 6.25*180 - 5*35 + 5 = 1905
      expect(result.energyRequirements.bmr).toBeCloseTo(1905, -1)
    })

    it('should calculate BMR correctly for females', async () => {
      const femaleInput = {
        ...mockWeightLossInput,
        client: { ...mockWeightLossInput.client, gender: 'female' as const },
      }

      const result = await generateNutritionAdvice(femaleInput, createMockContext())

      expect(result.energyRequirements.bmr).toBeGreaterThan(0)
      // Female formula: -161 instead of +5
      expect(result.energyRequirements.bmr).toBeLessThan(1905)
    })

    it('should calculate TDEE based on activity level', async () => {
      const sedentaryInput = {
        ...mockWeightLossInput,
        activityLevel: 'sedentary' as const,
      }
      const activeInput = {
        ...mockWeightLossInput,
        activityLevel: 'very_active' as const,
      }

      const sedentaryResult = await generateNutritionAdvice(sedentaryInput, createMockContext())
      const activeResult = await generateNutritionAdvice(activeInput, createMockContext())

      expect(activeResult.energyRequirements.tdee).toBeGreaterThan(
        sedentaryResult.energyRequirements.tdee
      )
    })

    it('should create deficit for weight loss', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.energyRequirements.calorieSurplusDeficit).toBe(-500)
      expect(result.energyRequirements.targetCalories).toBe(
        result.energyRequirements.tdee - 500
      )
    })

    it('should create surplus for muscle gain', async () => {
      const result = await generateNutritionAdvice(mockMuscleGainInput, createMockContext())

      expect(result.energyRequirements.calorieSurplusDeficit).toBe(300)
      expect(result.energyRequirements.targetCalories).toBe(
        result.energyRequirements.tdee + 300
      )
    })

    it('should maintain calories for maintenance goal', async () => {
      const maintenanceInput = {
        ...mockWeightLossInput,
        goals: ['maintenance' as const],
      }

      const result = await generateNutritionAdvice(maintenanceInput, createMockContext())

      expect(result.energyRequirements.calorieSurplusDeficit).toBe(0)
      expect(result.energyRequirements.targetCalories).toBe(result.energyRequirements.tdee)
    })
  })

  describe('Macronutrient Calculations', () => {
    it('should calculate protein requirements', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.macronutrients.protein.gramsPerDay).toBeGreaterThan(0)
      expect(result.macronutrients.protein.gramsPerKg).toBeCloseTo(1.8, 0.5)
      expect(result.macronutrients.protein.caloriesPerDay).toBe(
        result.macronutrients.protein.gramsPerDay * 4
      )
    })

    it('should increase protein for muscle gain', async () => {
      const weightLossResult = await generateNutritionAdvice(
        mockWeightLossInput,
        createMockContext()
      )
      const muscleGainResult = await generateNutritionAdvice(
        mockMuscleGainInput,
        createMockContext()
      )

      expect(muscleGainResult.macronutrients.protein.gramsPerKg).toBeGreaterThanOrEqual(
        weightLossResult.macronutrients.protein.gramsPerKg
      )
    })

    it('should calculate carbohydrates correctly', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.macronutrients.carbohydrates.gramsPerDay).toBeGreaterThan(0)
      expect(result.macronutrients.carbohydrates.caloriesPerDay).toBe(
        result.macronutrients.carbohydrates.gramsPerDay * 4
      )
    })

    it('should calculate fats correctly', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.macronutrients.fats.gramsPerDay).toBeGreaterThan(0)
      expect(result.macronutrients.fats.caloriesPerDay).toBe(
        result.macronutrients.fats.gramsPerDay * 9
      )
      // Fats should be ~25% of calories
      expect(result.macronutrients.fats.percentage).toBeCloseTo(25, 3)
    })

    it('should ensure macros add up to target calories', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      const totalCalories =
        result.macronutrients.protein.caloriesPerDay +
        result.macronutrients.carbohydrates.caloriesPerDay +
        result.macronutrients.fats.caloriesPerDay

      expect(totalCalories).toBeCloseTo(result.energyRequirements.targetCalories, -1)
    })

    it('should provide protein sources', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.macronutrients.protein.sources.length).toBeGreaterThan(0)
      expect(result.macronutrients.protein.sources).toContain('Chicken breast')
    })

    it('should adapt protein sources for vegetarians', async () => {
      const vegetarianInput = {
        ...mockWeightLossInput,
        dietaryPreferences: {
          ...mockWeightLossInput.dietaryPreferences,
          restrictions: ['vegetarian'],
        },
      }

      const result = await generateNutritionAdvice(vegetarianInput, createMockContext())

      expect(result.macronutrients.protein.sources).toContain('Tofu')
      expect(result.macronutrients.protein.sources).not.toContain('Chicken breast')
    })
  })

  describe('Hydration Recommendations', () => {
    it('should calculate daily water goal', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      // 90kg * 0.033 + 0.5 ≈ 3.5L
      expect(result.hydration.dailyWaterGoal).toBeCloseTo(3.5, 0.5)
    })

    it('should adjust hydration for body weight', async () => {
      const lightInput = {
        ...mockWeightLossInput,
        client: { ...mockWeightLossInput.client, weight: 60 },
      }
      const heavyInput = {
        ...mockWeightLossInput,
        client: { ...mockWeightLossInput.client, weight: 120 },
      }

      const lightResult = await generateNutritionAdvice(lightInput, createMockContext())
      const heavyResult = await generateNutritionAdvice(heavyInput, createMockContext())

      expect(heavyResult.hydration.dailyWaterGoal).toBeGreaterThan(
        lightResult.hydration.dailyWaterGoal
      )
    })

    it('should provide hydration tips', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.hydration.tips.length).toBeGreaterThan(0)
      expect(result.hydration.tips).toEqual(
        expect.arrayContaining([expect.stringContaining('water')])
      )
    })
  })

  describe('Meal Planning', () => {
    it('should create meal timing based on preferences', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.mealPlanning.suggestedMeals).toBe(3)
      expect(result.mealPlanning.mealTiming.length).toBe(3)
    })

    it('should adjust for different meal frequencies', async () => {
      const fiveMealsInput = {
        ...mockWeightLossInput,
        dietaryPreferences: {
          ...mockWeightLossInput.dietaryPreferences,
          mealsPerDay: 5,
        },
      }

      const result = await generateNutritionAdvice(fiveMealsInput, createMockContext())

      expect(result.mealPlanning.suggestedMeals).toBe(5)
      expect(result.mealPlanning.mealTiming.length).toBe(5)
    })

    it('should provide macro split for each meal', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      result.mealPlanning.mealTiming.forEach((meal) => {
        expect(meal.macroSplit).toMatch(/\d+g protein/)
        expect(meal.macroSplit).toMatch(/\d+g carbs/)
        expect(meal.macroSplit).toMatch(/\d+g fat/)
      })
    })

    it('should provide meal suggestions for each meal', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      result.mealPlanning.mealTiming.forEach((meal) => {
        expect(meal.suggestions.length).toBeGreaterThan(0)
      })
    })

    it('should provide pre/post workout nutrition advice', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.mealPlanning.preworkoutNutrition).toBeDefined()
      expect(result.mealPlanning.preworkoutNutrition).toContain('training')
      expect(result.mealPlanning.postworkoutNutrition).toBeDefined()
      expect(result.mealPlanning.postworkoutNutrition).toContain('protein')
    })
  })

  describe('Supplementation Advice', () => {
    it('should recommend basic supplements', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.supplementation.recommended.length).toBeGreaterThan(0)

      const protein = result.supplementation.recommended.find((s) =>
        s.supplement.includes('Protein')
      )
      expect(protein).toBeDefined()

      const creatine = result.supplementation.recommended.find((s) =>
        s.supplement.includes('Creatine')
      )
      expect(creatine).toBeDefined()
    })

    it('should include caffeine for weight loss', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      const caffeine = result.supplementation.recommended.find((s) =>
        s.supplement.includes('Caffeine')
      )

      expect(caffeine).toBeDefined()
    })

    it('should provide dosage and timing for each supplement', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      result.supplementation.recommended.forEach((supplement) => {
        expect(supplement.dosage).toBeDefined()
        expect(supplement.timing).toBeDefined()
        expect(supplement.purpose).toBeDefined()
      })
    })

    it('should list optional supplements', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.supplementation.optional.length).toBeGreaterThan(0)
    })

    it('should list supplements not needed', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.supplementation.notNeeded.length).toBeGreaterThan(0)
      expect(result.supplementation.notNeeded).toContain('Fat burners (ineffective)')
    })
  })

  describe('Practical Tips', () => {
    it('should provide practical tips across categories', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.practicaltips.length).toBeGreaterThan(0)

      result.practicaltips.forEach((tip) => {
        expect(tip.category).toBeDefined()
        expect(tip.tip).toBeDefined()
        expect(tip.tip.length).toBeGreaterThan(0)
      })
    })

    it('should include meal prep tips', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      const mealPrepTip = result.practicaltips.find((t) => t.category === 'Meal Prep')

      expect(mealPrepTip).toBeDefined()
    })

    it('should adjust hunger management tips for goal', async () => {
      const weightLossResult = await generateNutritionAdvice(
        mockWeightLossInput,
        createMockContext()
      )
      const muscleGainResult = await generateNutritionAdvice(
        mockMuscleGainInput,
        createMockContext()
      )

      const weightLossTip = weightLossResult.practicaltips.find(
        (t) => t.category === 'Hunger Management'
      )
      const muscleGainTip = muscleGainResult.practicaltips.find(
        (t) => t.category === 'Hunger Management'
      )

      expect(weightLossTip?.tip).toContain('low-calorie')
      expect(muscleGainTip?.tip).toContain('calorie-dense')
    })
  })

  describe('Tracking Recommendations', () => {
    it('should list what to track', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.tracking.whatToTrack.length).toBeGreaterThan(0)
      expect(result.tracking.whatToTrack).toContain('Daily calories')
      expect(result.tracking.whatToTrack).toContain('Protein intake (most important)')
    })

    it('should recommend tracking tools', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.tracking.tools.length).toBeGreaterThan(0)
      expect(result.tracking.tools).toContain('MyFitnessPal')
    })

    it('should provide tracking frequency guidance', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.tracking.frequency).toBeDefined()
      expect(result.tracking.frequency).toContain('Daily')
    })
  })

  describe('Disclaimer', () => {
    it('should include medical disclaimer', async () => {
      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result.disclaimer).toBeDefined()
      expect(result.disclaimer).toContain('educational purposes')
      expect(result.disclaimer).toContain('registered dietitian')
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum age', async () => {
      const youngInput = {
        ...mockWeightLossInput,
        client: { ...mockWeightLossInput.client, age: 18 },
      }

      const result = await generateNutritionAdvice(youngInput, createMockContext())

      expect(result).toBeDefined()
    })

    it('should validate age boundaries', async () => {
      const underageInput = {
        ...mockWeightLossInput,
        client: { ...mockWeightLossInput.client, age: 17 },
      }

      await expect(
        generateNutritionAdvice(underageInput, createMockContext())
      ).rejects.toThrow()
    })

    it('should handle input without dietary preferences', async () => {
      const noPrefsInput = {
        ...mockWeightLossInput,
        dietaryPreferences: undefined,
      }

      const result = await generateNutritionAdvice(noPrefsInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.mealPlanning.suggestedMeals).toBeGreaterThan(0)
    })

    it('should handle input without current habits', async () => {
      const noHabitsInput = {
        ...mockWeightLossInput,
        currentHabits: undefined,
      }

      const result = await generateNutritionAdvice(noHabitsInput, createMockContext())

      expect(result).toBeDefined()
    })
  })

  describe('OpenAI Mode', () => {
    beforeEach(() => {
      enableOpenAIMocks()
    })

    it('should use OpenAI when available', async () => {
      const { generateStructuredCompletion } = vi.mocked(require('../openai-client'))

      await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(generateStructuredCompletion).toHaveBeenCalled()
    })

    it('should fallback to calculation-based on OpenAI failure', async () => {
      const { generateStructuredCompletion } = vi.mocked(require('../openai-client'))
      generateStructuredCompletion.mockRejectedValueOnce(new Error('API Error'))

      const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

      expect(result).toBeDefined()
      expect(result.energyRequirements).toBeDefined()
    })
  })
})
