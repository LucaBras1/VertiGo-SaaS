/**
 * @vertigo/ui Animation Library
 *
 * Framer Motion animation presets for consistent, award-winning motion design.
 * All animations respect prefers-reduced-motion.
 */

// Transition variants (page, modal, stagger, etc.)
export {
  fadeIn,
  fadeInProps,
  slideUp,
  slideUpProps,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleInProps,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  staggerItemScale,
  pageTransition,
  modalOverlay,
  modalContent,
  sheetBottom,
  sheetRight,
  tooltip,
  collapse,
  reducedMotion,
} from './transitions';

// Micro-interactions (hover, press, focus)
export {
  hoverScale,
  hoverScaleLg,
  hoverLift,
  hoverLiftLg,
  pressScale,
  pressScaleLg,
  focusRing,
  hoverGlow,
  hoverGlowAi,
  hoverRotate,
  toggleSwitch,
  hoverTilt,
  counterSpring,
  pulseAttention,
  shakeError,
} from './interactions';

// Loading animations
export {
  shimmerEffect,
  pulseLoading,
  loadingDot,
  spinnerRotation,
  progressBar,
  skeletonWidths,
} from './loading';
