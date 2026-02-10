/**
 * VertiGo Design Tokens - Animation System
 *
 * Physics-based, purposeful motion design.
 * All animations respect prefers-reduced-motion.
 * Budget: 60fps, <300ms for interactions, <500ms for transitions.
 */

/** Duration scale (in seconds) */
export const duration = {
  /** 75ms - instant feedback (opacity, color) */
  instant: 0.075,
  /** 150ms - quick interactions (button press, toggle) */
  fast: 0.15,
  /** 200ms - standard transitions (hover, focus) */
  normal: 0.2,
  /** 300ms - medium transitions (modal, popover) */
  moderate: 0.3,
  /** 400ms - slower transitions (page elements, stagger) */
  slow: 0.4,
  /** 500ms - dramatic transitions (page, drawer) */
  slower: 0.5,
  /** 700ms - emphasis animations (celebration, onboarding) */
  dramatic: 0.7,
} as const;

/**
 * Easing curves
 * Based on natural physics for organic feel.
 */
export const easing = {
  /** Standard ease for most transitions */
  default: [0.25, 0.1, 0.25, 1.0] as const,
  /** Content entering the viewport */
  easeOut: [0.0, 0.0, 0.2, 1.0] as const,
  /** Content leaving the viewport */
  easeIn: [0.4, 0.0, 1.0, 1.0] as const,
  /** Content moving across the screen */
  easeInOut: [0.4, 0.0, 0.2, 1.0] as const,
  /** Bouncy spring for playful interactions */
  spring: [0.34, 1.56, 0.64, 1.0] as const,
  /** Smooth deceleration for entering elements */
  decelerate: [0.0, 0.0, 0.0, 1.0] as const,
  /** Quick acceleration for exiting elements */
  accelerate: [0.4, 0.0, 1.0, 1.0] as const,
} as const;

/** CSS easing strings (for Tailwind / CSS transitions) */
export const easingCSS = {
  default: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1.0)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.0, 1.0)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
} as const;

/** Framer Motion spring presets */
export const spring = {
  /** Snappy - buttons, toggles */
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
  /** Gentle - cards, panels */
  gentle: { type: 'spring' as const, stiffness: 300, damping: 25 },
  /** Bouncy - celebration, success states */
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
  /** Smooth - page transitions, modals */
  smooth: { type: 'spring' as const, stiffness: 200, damping: 20 },
  /** Lazy - drawers, sheets */
  lazy: { type: 'spring' as const, stiffness: 150, damping: 20 },
} as const;

/** Stagger delay for list/grid animations */
export const stagger = {
  /** Fast stagger for small lists */
  fast: 0.03,
  /** Default stagger */
  default: 0.05,
  /** Slow stagger for emphasis */
  slow: 0.08,
  /** Very slow for dramatic reveals */
  dramatic: 0.12,
} as const;

/**
 * Tailwind keyframes (for tailwind.config.ts)
 */
export const keyframes = {
  'fade-in': {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  'fade-out': {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  'slide-up': {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-down': {
    from: { opacity: '0', transform: 'translateY(-8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-left': {
    from: { opacity: '0', transform: 'translateX(8px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'slide-right': {
    from: { opacity: '0', transform: 'translateX(-8px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'scale-in': {
    from: { opacity: '0', transform: 'scale(0.95)' },
    to: { opacity: '1', transform: 'scale(1)' },
  },
  'scale-out': {
    from: { opacity: '1', transform: 'scale(1)' },
    to: { opacity: '0', transform: 'scale(0.95)' },
  },
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  'spin-slow': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  'accordion-up': {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },
} as const;

/** Tailwind animation utilities */
export const animation = {
  'fade-in': `fade-in ${duration.normal}s ${easingCSS.easeOut}`,
  'fade-out': `fade-out ${duration.normal}s ${easingCSS.easeIn}`,
  'slide-up': `slide-up ${duration.moderate}s ${easingCSS.easeOut}`,
  'slide-down': `slide-down ${duration.moderate}s ${easingCSS.easeOut}`,
  'slide-left': `slide-left ${duration.moderate}s ${easingCSS.easeOut}`,
  'slide-right': `slide-right ${duration.moderate}s ${easingCSS.easeOut}`,
  'scale-in': `scale-in ${duration.moderate}s ${easingCSS.spring}`,
  'scale-out': `scale-out ${duration.fast}s ${easingCSS.easeIn}`,
  shimmer: `shimmer 2s infinite`,
  pulse: `pulse 2s ${easingCSS.easeInOut} infinite`,
  'spin-slow': 'spin-slow 3s linear infinite',
  'accordion-down': `accordion-down ${duration.moderate}s ${easingCSS.easeOut}`,
  'accordion-up': `accordion-up ${duration.moderate}s ${easingCSS.easeIn}`,
} as const;
