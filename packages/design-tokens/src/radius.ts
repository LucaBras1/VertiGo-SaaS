/**
 * VertiGo Design Tokens - Border Radius
 *
 * Consistent rounding scale for premium feel.
 * Larger radii = more modern, friendly aesthetic.
 */

export const radius = {
  /** 0px - sharp corners */
  none: '0',
  /** 4px - subtle rounding (badges, tags) */
  sm: '0.25rem',
  /** 6px - inputs, small buttons */
  DEFAULT: '0.375rem',
  /** 8px - cards, medium elements */
  md: '0.5rem',
  /** 12px - large cards, panels */
  lg: '0.75rem',
  /** 16px - prominent cards, modals */
  xl: '1rem',
  /** 24px - pills, large modals */
  '2xl': '1.5rem',
  /** 32px - extra rounded elements */
  '3xl': '2rem',
  /** Full circle/pill */
  full: '9999px',
} as const;
