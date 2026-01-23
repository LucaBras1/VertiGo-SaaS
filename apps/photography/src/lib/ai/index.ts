/**
 * ShootFlow AI Modules
 *
 * Collection of AI-powered features for photographers
 */

// Shot List Generator
export {
  generateShotList,
  ShotListInputSchema,
  ShotListSchema,
  type ShotListInput,
  type ShotList,
} from './shot-list-generator'

// Gallery Curator
export {
  createGalleryCuratorAI,
  quickCurate,
  GalleryCuratorAI,
  GalleryCurationInputSchema,
  GalleryCurationOutputSchema,
  type GalleryCurationInput,
  type GalleryCurationOutput,
} from './gallery-curator'

// Style Matcher
export {
  createStyleMatcherAI,
  extractStyleKeywords,
  StyleMatcherAI,
  StyleAnalysisInputSchema,
  StyleAnalysisOutputSchema,
  type StyleAnalysisInput,
  type StyleAnalysisOutput,
} from './style-matcher'

// Edit Time Predictor
export {
  createEditTimePredictorAI,
  quickEstimate,
  EditTimePredictorAI,
  EditTimeInputSchema,
  EditTimeOutputSchema,
  type EditTimeInput,
  type EditTimeOutput,
} from './edit-time-predictor'
