/**
 * Micro-interaction animations for interactive elements.
 *
 * Usage:
 *   <motion.button {...hoverScale}>Click me</motion.button>
 *   <motion.div whileHover={hoverLift.whileHover}>...</motion.div>
 */

import { spring } from '@vertigo/design-tokens';

// --- Hover: Scale up slightly ---

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: spring.snappy,
};

export const hoverScaleLg = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: spring.gentle,
};

// --- Hover: Lift (translateY + shadow increase) ---

export const hoverLift = {
  whileHover: { y: -2 },
  whileTap: { y: 0 },
  transition: spring.snappy,
};

export const hoverLiftLg = {
  whileHover: { y: -4 },
  whileTap: { y: 0 },
  transition: spring.gentle,
};

// --- Press: Scale down ---

export const pressScale = {
  whileTap: { scale: 0.97 },
  transition: spring.snappy,
};

export const pressScaleLg = {
  whileTap: { scale: 0.95 },
  transition: spring.snappy,
};

// --- Focus: Ring animation ---

export const focusRing = {
  whileFocus: {
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
  },
  transition: spring.snappy,
};

// --- Hover: Glow effect ---

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
  },
  transition: spring.gentle,
};

export const hoverGlowAi = {
  whileHover: {
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
  },
  transition: spring.gentle,
};

// --- Icon: Rotate on hover ---

export const hoverRotate = {
  whileHover: { rotate: 15 },
  whileTap: { rotate: -15 },
  transition: spring.bouncy,
};

// --- Toggle: Switch animation ---

export const toggleSwitch = {
  initial: false,
  animate: (isOn: boolean) => ({
    x: isOn ? 20 : 0,
  }),
  transition: spring.snappy,
};

// --- Card: Subtle tilt on hover ---

export const hoverTilt = {
  whileHover: {
    rotateX: -2,
    rotateY: 2,
    transition: spring.gentle,
  },
  whileTap: {
    rotateX: 0,
    rotateY: 0,
    scale: 0.98,
    transition: spring.snappy,
  },
};

// --- Number counter animation ---

export const counterSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

// --- Pulse attention animation ---

export const pulseAttention = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
};

// --- Shake for error states ---

export const shakeError = {
  animate: {
    x: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};
