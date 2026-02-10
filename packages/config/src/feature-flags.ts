/**
 * Feature Flags for phased redesign rollout.
 *
 * Usage:
 *   import { featureFlags, isRedesignEnabled } from '@vertigo/config/feature-flags'
 *
 *   if (isRedesignEnabled('TEAM_BUILDING')) {
 *     return <RedesignedDashboard />
 *   }
 */

import type { Vertical } from './index';

export interface FeatureFlags {
  /** Whether the new award-winning redesign is enabled per vertical */
  redesignEnabled: Record<Vertical, boolean>;
  /** Dark mode support */
  darkMode: boolean;
  /** New animation system */
  animations: boolean;
  /** AI-enhanced UI features */
  aiEnhancedUI: boolean;
}

export const featureFlags: FeatureFlags = {
  redesignEnabled: {
    TEAM_BUILDING: true,
    MUSICIANS: false,
    FITNESS: false,
    PHOTOGRAPHY: false,
    KIDS_ENTERTAINMENT: false,
    EVENTS: false,
    PERFORMING_ARTS: false,
  },
  darkMode: true,
  animations: true,
  aiEnhancedUI: true,
};

export function isRedesignEnabled(vertical: Vertical): boolean {
  return featureFlags.redesignEnabled[vertical] ?? false;
}

export function isFeatureEnabled(feature: keyof Omit<FeatureFlags, 'redesignEnabled'>): boolean {
  return featureFlags[feature] ?? false;
}
