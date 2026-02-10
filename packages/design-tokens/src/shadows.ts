/**
 * VertiGo Design Tokens - Shadow & Elevation System
 *
 * Layered shadow system for depth and hierarchy.
 * Inspired by Material Design elevation but with softer, more natural shadows.
 * Uses blue-tinted shadows for cohesion with the neutral palette.
 */

/** Shadow scale - from subtle to dramatic */
export const shadow = {
  /** No shadow */
  none: 'none',
  /** Subtle border-like shadow for cards at rest */
  xs: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
  /** Default card shadow - gentle lift */
  sm: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
  /** Elevated cards, dropdowns */
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
  /** Modals, popovers */
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
  /** Large dialogs, sheets */
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
  /** Dramatic elevation for hero elements */
  '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.15)',

  /** Ring shadow for focus states */
  ring: '0 0 0 3px rgba(99, 102, 241, 0.15)',
  /** Colored ring for validation states */
  ringError: '0 0 0 3px rgba(239, 68, 68, 0.15)',
  ringSuccess: '0 0 0 3px rgba(34, 197, 94, 0.15)',

  /** Glow effects for premium/AI features */
  glow: '0 0 20px rgba(99, 102, 241, 0.2)',
  glowLg: '0 0 40px rgba(99, 102, 241, 0.25)',
  glowAi: '0 0 30px rgba(139, 92, 246, 0.3)',
} as const;

/** Dark mode shadows */
export const shadowDark = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.25)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.25)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  ring: '0 0 0 3px rgba(129, 140, 248, 0.2)',
  ringError: '0 0 0 3px rgba(239, 68, 68, 0.2)',
  ringSuccess: '0 0 0 3px rgba(34, 197, 94, 0.2)',
  glow: '0 0 20px rgba(129, 140, 248, 0.15)',
  glowLg: '0 0 40px rgba(129, 140, 248, 0.2)',
  glowAi: '0 0 30px rgba(167, 139, 250, 0.25)',
} as const;

/**
 * Elevation levels mapped to shadows + background opacity
 * Use these for consistent depth hierarchy.
 */
export const elevation = {
  /** Ground level - page background */
  0: { shadow: shadow.none },
  /** Slightly raised - sidebar, header */
  1: { shadow: shadow.xs },
  /** Card resting state */
  2: { shadow: shadow.sm },
  /** Card hover state */
  3: { shadow: shadow.md },
  /** Dropdown, popover */
  4: { shadow: shadow.lg },
  /** Modal, dialog */
  5: { shadow: shadow.xl },
  /** Toast, notification */
  6: { shadow: shadow['2xl'] },
} as const;
