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
        'brand-primary': '#7C3AED',
        'brand-secondary': '#F97316',
        // Keep legacy primary/accent for existing pages
        primary: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        accent: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
          800: '#9a3412', 900: '#7c2d12', 950: '#431407',
        },
      },
      fontFamily: {
        ...mutable(theme.fontFamily) as any,
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      fontSize: theme.fontSize as any,
      spacing: theme.spacing,
      screens: theme.screens,
      borderRadius: theme.borderRadius,
      boxShadow: theme.boxShadow,
      keyframes: theme.keyframes as any,
      animation: theme.animation,
    },
  },
  plugins: [],
}

export default config
