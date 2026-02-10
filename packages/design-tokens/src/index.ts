/**
 * @vertigo/design-tokens
 *
 * Award-winning design system tokens for VertiGo SaaS platform.
 * Provides a unified visual language across all 7 verticals.
 *
 * Usage:
 *   import { brand, neutral, shadow, duration } from '@vertigo/design-tokens'
 *   import { verticals } from '@vertigo/design-tokens/colors'
 */

// Colors
export {
  brand,
  neutral,
  semantic,
  verticals,
  surface,
  border,
  text,
  type VerticalKey,
} from './colors';

// Typography
export {
  fontFamily,
  fontWeight,
  typeScale,
  tailwindFontSize,
} from './typography';

// Spacing
export {
  spacing,
  container,
  breakpoints,
  BASE_UNIT,
} from './spacing';

// Shadows & Elevation
export {
  shadow,
  shadowDark,
  elevation,
} from './shadows';

// Animations
export {
  duration,
  easing,
  easingCSS,
  spring,
  stagger,
  keyframes,
  animation,
} from './animations';

// Border Radius
export { radius } from './radius';

// --- Tailwind Config Helper ---

import { brand, neutral, semantic, verticals as verticalColors } from './colors';
import { tailwindFontSize, fontFamily } from './typography';
import { spacing, breakpoints } from './spacing';
import { shadow } from './shadows';
import { keyframes as kf, animation as anim } from './animations';
import { radius as r } from './radius';

/**
 * Get a complete Tailwind theme extension from design tokens.
 * Use this in tailwind.config.ts to keep the config DRY.
 */
export function getTailwindTheme() {
  return {
    colors: {
      brand: {
        ...brand.primary,
        DEFAULT: brand.primary.DEFAULT,
      },
      accent: {
        ...brand.secondary,
        DEFAULT: brand.secondary.DEFAULT,
      },
      neutral,
      success: semantic.success,
      warning: semantic.warning,
      error: semantic.error,
      info: semantic.info,
      // Vertical accent colors
      'v-musicians': verticalColors.musicians.primary,
      'v-photography': verticalColors.photography.primary,
      'v-fitness': verticalColors.fitness.primary,
      'v-events': verticalColors.events.primary,
      'v-performing-arts': verticalColors.performingArts.primary,
      'v-team-building': verticalColors.teamBuilding.primary,
      'v-kids': verticalColors.kidsEntertainment.primary,
    },
    fontFamily,
    fontSize: tailwindFontSize,
    spacing,
    screens: breakpoints,
    borderRadius: r,
    boxShadow: shadow,
    keyframes: kf,
    animation: anim,
  };
}
