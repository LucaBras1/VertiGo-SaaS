/**
 * Loading & Skeleton animation utilities.
 *
 * Usage:
 *   <motion.div {...shimmerEffect} className="h-4 bg-neutral-200 rounded" />
 */

import { duration } from '@vertigo/design-tokens';

// --- Shimmer effect for skeleton loaders ---

export const shimmerEffect = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: 'loop' as const,
    ease: 'linear',
  },
  style: {
    backgroundImage:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    backgroundSize: '200% 100%',
  },
};

// --- Pulse for loading states ---

export const pulseLoading = {
  animate: {
    opacity: [0.5, 1, 0.5],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: 'loop' as const,
    ease: 'easeInOut',
  },
};

// --- Dots loading indicator ---

export const loadingDot = (delay: number) => ({
  animate: {
    y: [0, -6, 0],
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'loop' as const,
    ease: 'easeInOut',
    delay,
  },
});

// --- Spinner rotation ---

export const spinnerRotation = {
  animate: { rotate: 360 },
  transition: {
    duration: 1,
    repeat: Infinity,
    repeatType: 'loop' as const,
    ease: 'linear',
  },
};

// --- Progress bar ---

export const progressBar = (progress: number) => ({
  initial: { scaleX: 0 },
  animate: { scaleX: progress / 100 },
  transition: {
    duration: duration.slow,
    ease: 'easeOut',
  },
  style: {
    transformOrigin: 'left',
  },
});

// --- Skeleton line widths (for text skeleton loaders) ---

export const skeletonWidths = {
  full: '100%',
  threeQuarter: '75%',
  half: '50%',
  twoThird: '66%',
  oneThird: '33%',
  quarter: '25%',
} as const;
