/**
 * TeamForge AI Client Initialization
 */

import { createAIClient, type AIClient } from '@vertigo/ai-core'
import { createTeamDynamicsAI } from './ai/team-dynamics'
import { createObjectiveMatcherAI } from './ai/objective-matcher'
import { createDifficultyCalibratorAI } from './ai/difficulty-calibrator'
import { createDebriefGeneratorAI } from './ai/debrief-generator'

let aiClientInstance: AIClient | null = null

/**
 * Get or create AI client instance (singleton)
 */
export function getAIClient(): AIClient {
  if (!aiClientInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    aiClientInstance = createAIClient({
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: 'gpt-4o-mini',
      maxRetries: 3,
      timeout: 60000, // 60s for complex reports
      cache: {
        enabled: true,
        ttlMs: 300000, // 5 minutes
        maxSize: 1000,
      },
      rateLimit: {
        enabled: true,
        requestsPerMinute: 60,
      },
    })
  }

  return aiClientInstance
}

/**
 * Initialize all AI services
 */
export function initializeAIServices() {
  const client = getAIClient()

  return {
    teamDynamics: createTeamDynamicsAI(client),
    objectiveMatcher: createObjectiveMatcherAI(client),
    difficultyCalibrator: createDifficultyCalibratorAI(client),
    debriefGenerator: createDebriefGeneratorAI(client),
  }
}

// Singleton AI services instance
let aiServicesInstance: ReturnType<typeof initializeAIServices> | null = null

/**
 * Get AI services (singleton)
 */
export function getAIServices() {
  if (!aiServicesInstance) {
    aiServicesInstance = initializeAIServices()
  }
  return aiServicesInstance
}

/**
 * Usage example:
 *
 * ```typescript
 * import { getAIServices } from '@/lib/ai-client'
 *
 * const ai = getAIServices()
 *
 * // Use team dynamics AI
 * const analysis = await ai.teamDynamics.analyze(teamData, activities)
 *
 * // Use objective matcher
 * const matches = await ai.objectiveMatcher.match(objectives, activities)
 *
 * // Use difficulty calibrator
 * const calibration = await ai.difficultyCalibrator.calibrate(activityData)
 *
 * // Generate debrief report
 * const report = await ai.debriefGenerator.generate(sessionData)
 * ```
 */
