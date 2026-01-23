/**
 * TeamForge AI Services
 *
 * Export all AI modules for team building vertical
 */

export * from './team-dynamics'
export * from './objective-matcher'
export * from './difficulty-calibrator'
export * from './debrief-generator'

// Re-export AI client types
export type { AIClient, AIClientConfig } from '@vertigo/ai-core'
