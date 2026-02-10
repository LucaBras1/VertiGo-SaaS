/**
 * VertiGo Design Tokens - Spacing System
 *
 * 4pt base grid with 8pt as the primary increment.
 * Consistent spacing creates visual rhythm and breathing room.
 */

/** Base unit in pixels */
export const BASE_UNIT = 4;

/**
 * Spacing scale (in rem, based on 4px grid)
 * Named for quick recognition and consistent usage.
 */
export const spacing = {
  /** 0px */
  0: '0',
  /** 1px - hairline borders */
  px: '1px',
  /** 2px - tight internal padding */
  0.5: '0.125rem',
  /** 4px - icon gaps, inline spacing */
  1: '0.25rem',
  /** 6px */
  1.5: '0.375rem',
  /** 8px - default gap, small padding */
  2: '0.5rem',
  /** 10px */
  2.5: '0.625rem',
  /** 12px - compact component padding */
  3: '0.75rem',
  /** 14px */
  3.5: '0.875rem',
  /** 16px - standard component padding */
  4: '1rem',
  /** 20px - comfortable padding */
  5: '1.25rem',
  /** 24px - card padding, section gap */
  6: '1.5rem',
  /** 28px */
  7: '1.75rem',
  /** 32px - large gap, section spacing */
  8: '2rem',
  /** 36px */
  9: '2.25rem',
  /** 40px */
  10: '2.5rem',
  /** 44px */
  11: '2.75rem',
  /** 48px - large section gap */
  12: '3rem',
  /** 56px */
  14: '3.5rem',
  /** 64px - page section spacing */
  16: '4rem',
  /** 80px - hero spacing */
  20: '5rem',
  /** 96px - page-level spacing */
  24: '6rem',
  /** 112px */
  28: '7rem',
  /** 128px - major section dividers */
  32: '8rem',
  /** 160px */
  40: '10rem',
  /** 192px */
  48: '12rem',
  /** 256px */
  64: '16rem',
  /** 320px */
  80: '20rem',
  /** 384px */
  96: '24rem',
} as const;

/** Container max-widths for responsive layouts */
export const container = {
  xs: '20rem',    // 320px
  sm: '24rem',    // 384px
  md: '28rem',    // 448px
  lg: '32rem',    // 512px
  xl: '36rem',    // 576px
  '2xl': '42rem', // 672px
  '3xl': '48rem', // 768px
  '4xl': '56rem', // 896px
  '5xl': '64rem', // 1024px
  '6xl': '72rem', // 1152px
  '7xl': '80rem', // 1280px
  full: '100%',
} as const;

/** Responsive breakpoints */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
} as const;
