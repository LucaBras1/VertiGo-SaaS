/**
 * VertiGo Design Tokens - Typography System
 *
 * Modular type scale with carefully tuned line heights and letter spacing.
 * Uses Inter for UI, plus display font for marketing/headings.
 */

export const fontFamily = {
  /** Primary UI font - clean, readable, professional */
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  /** Display font for hero sections and marketing */
  display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  /** Monospace for code, data, and technical content */
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Type scale following a 1.25 (Major Third) ratio
 * Each size includes fontSize, lineHeight, and letterSpacing
 */
export const typeScale = {
  /** 11px - Micro labels, badges */
  '2xs': {
    fontSize: '0.6875rem',
    lineHeight: '1rem',
    letterSpacing: '0.025em',
  },
  /** 12px - Captions, helper text */
  xs: {
    fontSize: '0.75rem',
    lineHeight: '1.125rem',
    letterSpacing: '0.01em',
  },
  /** 14px - Body small, table data */
  sm: {
    fontSize: '0.875rem',
    lineHeight: '1.375rem',
    letterSpacing: '0',
  },
  /** 16px - Body default */
  base: {
    fontSize: '1rem',
    lineHeight: '1.625rem',
    letterSpacing: '0',
  },
  /** 18px - Body large, lead text */
  lg: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    letterSpacing: '-0.01em',
  },
  /** 20px - H6, section headers */
  xl: {
    fontSize: '1.25rem',
    lineHeight: '1.875rem',
    letterSpacing: '-0.015em',
  },
  /** 24px - H5, card titles */
  '2xl': {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    letterSpacing: '-0.02em',
  },
  /** 30px - H4, page section titles */
  '3xl': {
    fontSize: '1.875rem',
    lineHeight: '2.375rem',
    letterSpacing: '-0.025em',
  },
  /** 36px - H3, page titles */
  '4xl': {
    fontSize: '2.25rem',
    lineHeight: '2.75rem',
    letterSpacing: '-0.03em',
  },
  /** 48px - H2, hero headings */
  '5xl': {
    fontSize: '3rem',
    lineHeight: '3.5rem',
    letterSpacing: '-0.035em',
  },
  /** 60px - H1, display headings */
  '6xl': {
    fontSize: '3.75rem',
    lineHeight: '4.25rem',
    letterSpacing: '-0.04em',
  },
  /** 72px - Marketing hero */
  '7xl': {
    fontSize: '4.5rem',
    lineHeight: '5rem',
    letterSpacing: '-0.045em',
  },
} as const;

/**
 * Tailwind-compatible fontSize config (for tailwind.config.ts)
 */
export const tailwindFontSize = Object.fromEntries(
  Object.entries(typeScale).map(([key, value]) => [
    key,
    [value.fontSize, { lineHeight: value.lineHeight, letterSpacing: value.letterSpacing }],
  ])
) as Record<keyof typeof typeScale, [string, { lineHeight: string; letterSpacing: string }]>;
