import type { Config } from 'tailwindcss'
import { getTailwindTheme } from '@vertigo/design-tokens'

const tokens = getTailwindTheme()

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Master Brand ---
        brand: tokens.colors.brand,
        accent: tokens.colors.accent,

        // --- Semantic Neutrals (blue-tinted) ---
        neutral: tokens.colors.neutral,

        // --- Status Colors ---
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        info: tokens.colors.info,

        // --- Vertical Accent Colors ---
        'v-musicians': tokens.colors['v-musicians'],
        'v-photography': tokens.colors['v-photography'],
        'v-fitness': tokens.colors['v-fitness'],
        'v-events': tokens.colors['v-events'],
        'v-performing-arts': tokens.colors['v-performing-arts'],
        'v-team-building': tokens.colors['v-team-building'],
        'v-kids': tokens.colors['v-kids'],

        // --- Legacy aliases (backwards compatibility) ---
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },

      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,

      spacing: tokens.spacing,

      borderRadius: {
        ...tokens.borderRadius,
        // Legacy alias
        DEFAULT: tokens.borderRadius.md,
      },

      boxShadow: tokens.boxShadow,

      screens: tokens.screens,

      keyframes: tokens.keyframes,
      animation: tokens.animation,

      // Backdrop blur for glass effects
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // Transition timing functions
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'ease-in-expo': 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1.0)',
      },
    },
  },
  plugins: [],
}
export default config
