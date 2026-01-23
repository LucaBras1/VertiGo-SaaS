/**
 * NutritionAdvisorAI - Basic nutrition guidance for fitness clients
 *
 * DISCLAIMER: Not a replacement for registered dietitian/nutritionist
 * Provides general guidance based on established principles
 */

import { z } from 'zod'

// Input schema
export const NutritionAdvisorInputSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string().optional(),
    age: z.number().min(18).max(100),
    gender: z.enum(['male', 'female', 'other']),
    weight: z.number(), // kg
    height: z.number(), // cm
  }),

  goals: z.array(
    z.enum([
      'weight_loss',
      'muscle_gain',
      'maintenance',
      'performance',
      'general_health',
    ])
  ),

  activityLevel: z.enum([
    'sedentary', // Little to no exercise
    'lightly_active', // 1-2 days/week
    'moderately_active', // 3-5 days/week
    'very_active', // 6-7 days/week
    'extremely_active', // Athlete, 2x/day
  ]),

  targetWeight: z.number().optional(), // kg
  weeklyWeightChangeGoal: z.number().optional(), // kg per week (negative = loss)

  dietaryPreferences: z.object({
    restrictions: z.array(z.string()).optional(), // vegetarian, vegan, gluten-free, etc.
    allergies: z.array(z.string()).optional(),
    dislikes: z.array(z.string()).optional(),
    mealsPerDay: z.number().min(2).max(6).default(3),
  }).optional(),

  currentHabits: z.object({
    avgCalories: z.number().optional(),
    avgProtein: z.number().optional(), // grams
    waterIntake: z.number().optional(), // liters
    mealtiming: z.string().optional(),
  }).optional(),
})

// Output schema
export const NutritionAdviceSchema = z.object({
  energyRequirements: z.object({
    bmr: z.number(), // Basal Metabolic Rate
    tdee: z.number(), // Total Daily Energy Expenditure
    targetCalories: z.number(),
    calorieSurplusDeficit: z.number(), // +500 surplus, -500 deficit
    explanation: z.string(),
  }),

  macronutrients: z.object({
    protein: z.object({
      gramsPerDay: z.number(),
      gramsPerKg: z.number(),
      caloriesPerDay: z.number(),
      percentage: z.number(),
      timing: z.string(),
      sources: z.array(z.string()),
    }),
    carbohydrates: z.object({
      gramsPerDay: z.number(),
      caloriesPerDay: z.number(),
      percentage: z.number(),
      timing: z.string(),
      sources: z.array(z.string()),
    }),
    fats: z.object({
      gramsPerDay: z.number(),
      caloriesPerDay: z.number(),
      percentage: z.number(),
      sources: z.array(z.string()),
    }),
  }),

  hydration: z.object({
    dailyWaterGoal: z.number(), // liters
    calculation: z.string(),
    tips: z.array(z.string()),
  }),

  mealPlanning: z.object({
    suggestedMeals: z.number(),
    mealTiming: z.array(z.object({
      meal: z.string(),
      time: z.string(),
      macroSplit: z.string(),
      suggestions: z.array(z.string()),
    })),
    preworkoutNutrition: z.string(),
    postworkoutNutrition: z.string(),
  }),

  supplementation: z.object({
    recommended: z.array(z.object({
      supplement: z.string(),
      purpose: z.string(),
      dosage: z.string(),
      timing: z.string(),
    })),
    optional: z.array(z.string()),
    notNeeded: z.array(z.string()),
  }),

  practicaltips: z.array(z.object({
    category: z.string(),
    tip: z.string(),
  })),

  tracking: z.object({
    whatToTrack: z.array(z.string()),
    tools: z.array(z.string()),
    frequency: z.string(),
  }),

  disclaimer: z.string(),
})

export type NutritionAdvisorInput = z.infer<typeof NutritionAdvisorInputSchema>
export type NutritionAdvice = z.infer<typeof NutritionAdviceSchema>

/**
 * Generate nutrition advice
 */
export async function generateNutritionAdvice(
  input: NutritionAdvisorInput,
  context: { tenantId: string }
): Promise<NutritionAdvice> {
  const validatedInput = NutritionAdvisorInputSchema.parse(input)

  // TODO: Integrate with @vertigo/ai-core
  // For now, use calculation-based approach

  return calculateNutritionAdvice(validatedInput)
}

/**
 * Calculate nutrition advice using established formulas
 */
function calculateNutritionAdvice(input: NutritionAdvisorInput): NutritionAdvice {
  const { client, goals, activityLevel, targetWeight, dietaryPreferences } = input

  // Calculate BMR using Mifflin-St Jeor equation
  const bmr = calculateBMR(client.weight, client.height, client.age, client.gender)

  // Calculate TDEE
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }
  const tdee = Math.round(bmr * activityMultipliers[activityLevel])

  // Determine target calories based on goals
  const primaryGoal = goals[0]
  let targetCalories = tdee
  let calorieSurplusDeficit = 0

  if (primaryGoal === 'weight_loss') {
    calorieSurplusDeficit = -500 // 0.5kg/week loss
    targetCalories = tdee - 500
  } else if (primaryGoal === 'muscle_gain') {
    calorieSurplusDeficit = 300 // Lean bulk
    targetCalories = tdee + 300
  }

  // Calculate macros
  const proteinGramsPerKg = primaryGoal === 'muscle_gain' ? 2.2 : 1.8
  const proteinGrams = Math.round(client.weight * proteinGramsPerKg)
  const proteinCalories = proteinGrams * 4

  const fatPercentage = 0.25 // 25% of calories
  const fatCalories = Math.round(targetCalories * fatPercentage)
  const fatGrams = Math.round(fatCalories / 9)

  const carbCalories = targetCalories - proteinCalories - fatCalories
  const carbGrams = Math.round(carbCalories / 4)

  // Hydration
  const waterGoal = Math.round((client.weight * 0.033 + 0.5) * 10) / 10 // 33ml per kg + 0.5L for training

  // Meal timing
  const mealsPerDay = dietaryPreferences?.mealsPerDay || 3
  const mealTiming = generateMealTiming(mealsPerDay, proteinGrams, carbGrams, fatGrams)

  // Supplementation
  const supplements = getSupplementRecommendations(primaryGoal, client.age)

  return {
    energyRequirements: {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      calorieSurplusDeficit,
      explanation:
        primaryGoal === 'weight_loss'
          ? 'Creating a 500 calorie deficit for sustainable 0.5kg/week fat loss'
          : primaryGoal === 'muscle_gain'
          ? 'Creating a 300 calorie surplus for lean muscle gain (0.25-0.5kg/month)'
          : 'Maintaining current weight with balanced energy intake',
    },

    macronutrients: {
      protein: {
        gramsPerDay: proteinGrams,
        gramsPerKg: proteinGramsPerKg,
        caloriesPerDay: proteinCalories,
        percentage: Math.round((proteinCalories / targetCalories) * 100),
        timing: 'Spread evenly across meals. 20-40g per meal optimal for muscle protein synthesis.',
        sources: getProteinSources(dietaryPreferences?.restrictions || []),
      },
      carbohydrates: {
        gramsPerDay: carbGrams,
        caloriesPerDay: carbCalories,
        percentage: Math.round((carbCalories / targetCalories) * 100),
        timing: 'Focus carbs around training for energy and recovery.',
        sources: getCarbSources(),
      },
      fats: {
        gramsPerDay: fatGrams,
        caloriesPerDay: fatCalories,
        percentage: Math.round((fatCalories / targetCalories) * 100),
        sources: getFatSources(),
      },
    },

    hydration: {
      dailyWaterGoal: waterGoal,
      calculation: `${Math.round(client.weight * 0.033 * 10) / 10}L (body weight) + 0.5L (training)`,
      tips: [
        'Drink 500ml upon waking',
        'Sip water throughout the day',
        'Drink 500ml 30 min before training',
        'Rehydrate 1.5x fluid lost during training',
        'Monitor urine color (pale yellow = good)',
      ],
    },

    mealPlanning: {
      suggestedMeals: mealsPerDay,
      mealTiming,
      preworkoutNutrition: 'Eat 1-2 hours before training. Focus on carbs + moderate protein. Light meal or snack.',
      postworkoutNutrition: 'Within 2 hours post-training. 20-40g protein + carbs to replenish glycogen.',
    },

    supplementation: supplements,

    practicaltips: [
      {
        category: 'Meal Prep',
        tip: 'Batch cook protein sources (chicken, lean beef) on Sundays',
      },
      {
        category: 'Consistency',
        tip: 'Hit your protein target daily - it\'s the most important macro',
      },
      {
        category: 'Flexibility',
        tip: '80/20 rule: Be consistent 80% of the time, enjoy life 20%',
      },
      {
        category: 'Hunger Management',
        tip: primaryGoal === 'weight_loss'
          ? 'Focus on high-volume, low-calorie foods (vegetables, lean protein)'
          : 'Choose calorie-dense foods if struggling to eat enough',
      },
      {
        category: 'Restaurant Eating',
        tip: 'Choose grilled proteins, ask for sauces on the side, swap fries for veggies',
      },
    ],

    tracking: {
      whatToTrack: [
        'Daily calories',
        'Protein intake (most important)',
        'Body weight (weekly average)',
        'Training performance',
        'Energy levels',
        'Sleep quality',
      ],
      tools: ['MyFitnessPal', 'Cronometer', 'MacroFactor', 'Food scale'],
      frequency: 'Daily tracking for 4-8 weeks to build awareness, then can be more flexible',
    },

    disclaimer:
      'This advice is for general educational purposes only and does not replace personalized guidance from a registered dietitian or medical professional. Consult your doctor before making significant dietary changes, especially if you have medical conditions.',
  }
}

function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

function generateMealTiming(
  meals: number,
  totalProtein: number,
  totalCarbs: number,
  totalFats: number
): NutritionAdvice['mealPlanning']['mealTiming'] {
  const proteinPerMeal = Math.round(totalProtein / meals)
  const carbsPerMeal = Math.round(totalCarbs / meals)
  const fatsPerMeal = Math.round(totalFats / meals)

  const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Pre-Bed']
  const mealTimes = ['7:00 AM', '12:00 PM', '6:00 PM', '10:00 AM', '3:00 PM', '9:00 PM']

  return Array.from({ length: meals }, (_, i) => ({
    meal: mealNames[i],
    time: mealTimes[i],
    macroSplit: `${proteinPerMeal}g protein, ${carbsPerMeal}g carbs, ${fatsPerMeal}g fat`,
    suggestions: getMealSuggestions(mealNames[i]),
  }))
}

function getMealSuggestions(mealName: string): string[] {
  const suggestions: Record<string, string[]> = {
    Breakfast: [
      'Oats + protein powder + berries',
      'Eggs + whole grain toast + avocado',
      'Greek yogurt + granola + fruit',
    ],
    Lunch: [
      'Grilled chicken + rice + vegetables',
      'Salmon + sweet potato + salad',
      'Turkey wrap + fruit',
    ],
    Dinner: [
      'Lean beef + pasta + broccoli',
      'Fish + quinoa + roasted vegetables',
      'Chicken stir-fry + rice',
    ],
    'Snack 1': ['Protein shake + banana', 'Greek yogurt + nuts', 'Rice cakes + peanut butter'],
    'Snack 2': ['Protein bar', 'Cottage cheese + fruit', 'Hard-boiled eggs + crackers'],
    'Pre-Bed': ['Casein protein shake', 'Cottage cheese', 'Greek yogurt'],
  }

  return suggestions[mealName] || ['Balanced meal with protein, carbs, and fats']
}

function getProteinSources(restrictions: string[]): string[] {
  const animalSources = [
    'Chicken breast',
    'Turkey',
    'Lean beef',
    'Fish (salmon, tuna, cod)',
    'Eggs',
    'Greek yogurt',
    'Cottage cheese',
  ]

  const plantSources = [
    'Tofu',
    'Tempeh',
    'Lentils',
    'Chickpeas',
    'Black beans',
    'Quinoa',
    'Seitan',
    'Edamame',
  ]

  if (restrictions.includes('vegetarian') || restrictions.includes('vegan')) {
    return plantSources
  }

  return [...animalSources, ...plantSources.slice(0, 3)]
}

function getCarbSources(): string[] {
  return [
    'Oats',
    'Rice (white or brown)',
    'Sweet potato',
    'Regular potato',
    'Whole grain bread',
    'Pasta',
    'Quinoa',
    'Fruits (banana, apple, berries)',
    'Vegetables',
  ]
}

function getFatSources(): string[] {
  return [
    'Avocado',
    'Nuts (almonds, walnuts, cashews)',
    'Olive oil',
    'Fatty fish (salmon, mackerel)',
    'Nut butters',
    'Seeds (chia, flax, pumpkin)',
    'Dark chocolate (85%+)',
  ]
}

function getSupplementRecommendations(
  goal: string,
  age: number
): NutritionAdvice['supplementation'] {
  const recommended: NutritionAdvice['supplementation']['recommended'] = [
    {
      supplement: 'Whey Protein',
      purpose: 'Convenient way to hit protein targets',
      dosage: '20-40g',
      timing: 'Post-workout or as snack',
    },
    {
      supplement: 'Creatine Monohydrate',
      purpose: 'Improve strength and muscle mass',
      dosage: '5g',
      timing: 'Daily, any time',
    },
    {
      supplement: 'Vitamin D',
      purpose: 'Bone health, immune function',
      dosage: '2000-4000 IU',
      timing: 'Morning with food',
    },
  ]

  if (goal === 'weight_loss') {
    recommended.push({
      supplement: 'Caffeine',
      purpose: 'Energy, focus, slight metabolic boost',
      dosage: '200-400mg',
      timing: 'Pre-workout (morning/early afternoon)',
    })
  }

  const optional = [
    'Omega-3 Fish Oil (if not eating fatty fish 2x/week)',
    'Magnesium (for sleep and recovery)',
    'Beta-Alanine (for high-rep training)',
  ]

  const notNeeded = [
    'Fat burners (ineffective)',
    'Testosterone boosters (unless prescribed)',
    'Detox products',
    'Excessive pre-workout formulas',
  ]

  return { recommended, optional, notNeeded }
}
