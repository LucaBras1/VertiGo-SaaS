/**
 * Page & Element Transition Variants for Framer Motion
 *
 * Usage:
 *   <motion.div variants={fadeIn} initial="hidden" animate="visible" />
 *   <motion.div {...fadeInProps} />
 */

import type { Variants, TargetAndTransition } from 'framer-motion';
import { duration, easing } from '@vertigo/design-tokens';

// --- Fade ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

export const fadeInProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: duration.normal, ease: easing.easeOut },
};

// --- Slide Up ---

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.moderate, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

export const slideUpProps = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: duration.moderate, ease: easing.easeOut },
};

// --- Slide Down ---

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.moderate, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// --- Slide Left ---

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.moderate, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// --- Slide Right ---

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.moderate, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// --- Scale ---

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.moderate, ease: easing.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

export const scaleInProps = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: duration.moderate, ease: easing.spring },
};

// --- Stagger Container ---

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

// --- Stagger Item (used with staggerContainer) ---

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.moderate, ease: easing.easeOut },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.moderate, ease: easing.spring },
  },
};

// --- Page Transition ---

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.moderate,
      ease: easing.easeOut,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

// --- Modal / Dialog ---

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.moderate, ease: easing.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: duration.fast, ease: easing.easeIn },
  },
};

// --- Sheet (bottom/side) ---

export const sheetBottom: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: duration.slow, ease: easing.easeOut },
  },
  exit: {
    y: '100%',
    transition: { duration: duration.moderate, ease: easing.easeIn },
  },
};

export const sheetRight: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: duration.slow, ease: easing.easeOut },
  },
  exit: {
    x: '100%',
    transition: { duration: duration.moderate, ease: easing.easeIn },
  },
};

// --- Tooltip / Popover ---

export const tooltip: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.fast, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.instant },
  },
};

// --- Collapse / Expand ---

export const collapse: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: { duration: duration.moderate, ease: easing.easeIn },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: duration.moderate, ease: easing.easeOut },
  },
};

// --- Reduced motion fallback ---

export const reducedMotion: TargetAndTransition = {
  transition: { duration: 0 },
};
