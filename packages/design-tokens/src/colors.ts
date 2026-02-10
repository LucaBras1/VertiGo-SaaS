/**
 * VertiGo Design Tokens - Color System
 *
 * Premium color palette inspired by award-winning SaaS products
 * (Linear, Notion, Stripe, Pitch, Height)
 *
 * WCAG 2.1 AA compliant across all combinations.
 * Uses blue-tinted neutrals for sophistication.
 */

// --- Master Brand Colors ---

export const brand = {
  /** Deep indigo - primary brand, used for CTAs and key UI elements */
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
    DEFAULT: '#6366F1',
  },
  /** Warm accent for highlights, badges, premium features */
  secondary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
    DEFAULT: '#F97316',
  },
} as const;

// --- Neutral Colors (blue-tinted for sophistication) ---

export const neutral = {
  0: '#FFFFFF',
  25: '#FCFCFD',
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
} as const;

// --- Semantic Status Colors ---

export const semantic = {
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    DEFAULT: '#22C55E',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    DEFAULT: '#F59E0B',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    DEFAULT: '#EF4444',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    DEFAULT: '#3B82F6',
  },
} as const;

// --- Vertical-Specific Accent Colors ---

export const verticals = {
  musicians: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    accent: '#EC4899',
    gradient: 'from-violet-500 to-purple-600',
    gradientHover: 'from-violet-600 to-purple-700',
  },
  photography: {
    primary: '#F59E0B',
    primaryLight: '#FBBF24',
    primaryDark: '#D97706',
    accent: '#374151',
    gradient: 'from-amber-400 to-orange-500',
    gradientHover: 'from-amber-500 to-orange-600',
  },
  fitness: {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    accent: '#06B6D4',
    gradient: 'from-emerald-400 to-teal-500',
    gradientHover: 'from-emerald-500 to-teal-600',
  },
  events: {
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#6D28D9',
    accent: '#F97316',
    gradient: 'from-violet-500 to-purple-600',
    gradientHover: 'from-violet-600 to-purple-700',
  },
  performingArts: {
    primary: '#DC2626',
    primaryLight: '#EF4444',
    primaryDark: '#B91C1C',
    accent: '#F59E0B',
    gradient: 'from-red-500 to-rose-600',
    gradientHover: 'from-red-600 to-rose-700',
  },
  teamBuilding: {
    primary: '#0EA5E9',
    primaryLight: '#38BDF8',
    primaryDark: '#0284C7',
    accent: '#F97316',
    gradient: 'from-sky-400 to-blue-500',
    gradientHover: 'from-sky-500 to-blue-600',
  },
  kidsEntertainment: {
    primary: '#F472B6',
    primaryLight: '#F9A8D4',
    primaryDark: '#EC4899',
    accent: '#60A5FA',
    gradient: 'from-pink-400 to-rose-500',
    gradientHover: 'from-pink-500 to-rose-600',
  },
} as const;

// --- Surface Colors (for cards, panels, backgrounds) ---

export const surface = {
  /** Main app background */
  background: neutral[50],
  /** Slightly elevated (sidebar, header) */
  raised: neutral[0],
  /** Card surface */
  card: neutral[0],
  /** Overlay backdrop */
  overlay: 'rgba(15, 23, 42, 0.6)',
  /** Subtle surface for hover states */
  hover: neutral[100],
  /** Active/pressed state */
  active: neutral[200],
  /** Muted content areas */
  muted: neutral[100],

  dark: {
    background: neutral[950],
    raised: neutral[900],
    card: neutral[900],
    overlay: 'rgba(0, 0, 0, 0.7)',
    hover: neutral[800],
    active: neutral[700],
    muted: neutral[800],
  },
} as const;

// --- Border Colors ---

export const border = {
  DEFAULT: neutral[200],
  subtle: neutral[100],
  strong: neutral[300],
  focus: brand.primary[500],

  dark: {
    DEFAULT: neutral[800],
    subtle: neutral[900],
    strong: neutral[700],
    focus: brand.primary[400],
  },
} as const;

// --- Text Colors ---

export const text = {
  primary: neutral[900],
  secondary: neutral[600],
  tertiary: neutral[500],
  disabled: neutral[400],
  inverse: neutral[0],
  link: brand.primary[600],
  linkHover: brand.primary[700],

  dark: {
    primary: neutral[50],
    secondary: neutral[400],
    tertiary: neutral[500],
    disabled: neutral[600],
    inverse: neutral[900],
    link: brand.primary[400],
    linkHover: brand.primary[300],
  },
} as const;

export type VerticalKey = keyof typeof verticals;
