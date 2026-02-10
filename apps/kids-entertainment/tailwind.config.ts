import type { Config } from 'tailwindcss'
import { getTailwindTheme } from '@vertigo/design-tokens'

const theme = getTailwindTheme()

const mutable = <T>(val: T): { -readonly [K in keyof T]: T[K] extends readonly (infer U)[] ? U[] : T[K] } =>
  JSON.parse(JSON.stringify(val))

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/admin/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...theme.colors,
        // Legacy aliases for migration period
        'partypal-pink': {
          DEFAULT: '#EC4899',
          50: '#FCE7F3', 100: '#FBD5E8', 200: '#F9AACF', 300: '#F780B6',
          400: '#F5559D', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D',
          800: '#9D174D', 900: '#831843',
        },
        'partypal-yellow': {
          DEFAULT: '#FACC15',
          50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047',
          400: '#FACC15', 500: '#EAB308', 600: '#CA8A04', 700: '#A16207',
          800: '#854D0E', 900: '#713F12',
        },
        'partypal-purple': {
          DEFAULT: '#A855F7',
          50: '#FAF5FF', 100: '#F3E8FF', 200: '#E9D5FF', 300: '#D8B4FE',
          400: '#C084FC', 500: '#A855F7', 600: '#9333EA', 700: '#7E22CE',
          800: '#6B21A8', 900: '#581C87',
        },
      },
      fontFamily: mutable(theme.fontFamily) as any,
      fontSize: theme.fontSize as any,
      spacing: theme.spacing,
      screens: theme.screens,
      borderRadius: theme.borderRadius,
      boxShadow: theme.boxShadow,
      keyframes: {
        ...(theme.keyframes as any),
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        ...theme.animation,
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
