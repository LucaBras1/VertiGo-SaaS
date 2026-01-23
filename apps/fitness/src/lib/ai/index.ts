/**
 * FitAdmin AI Modules
 *
 * Export all AI-powered features for fitness vertical
 */

export {
  generateWorkout,
  WorkoutGeneratorInputSchema,
  WorkoutPlanSchema,
  suggestProgression,
  type WorkoutGeneratorInput,
  type WorkoutPlan,
} from './workout-generator'

export {
  predictProgress,
  ProgressPredictorInputSchema,
  ProgressPredictionSchema,
  type ProgressPredictorInput,
  type ProgressPrediction,
} from './progress-predictor'

export {
  generateNutritionAdvice,
  NutritionAdvisorInputSchema,
  NutritionAdviceSchema,
  type NutritionAdvisorInput,
  type NutritionAdvice,
} from './nutrition-advisor'

export {
  detectChurnRisk,
  ChurnDetectorInputSchema,
  ChurnPredictionSchema,
  type ChurnDetectorInput,
  type ChurnPrediction,
} from './churn-detector'
