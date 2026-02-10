import type { Config } from 'tailwindcss'
import { getTailwindTheme } from '@vertigo/design-tokens'

const theme = getTailwindTheme()

// Deep-mutable cast to satisfy Tailwind's mutable type requirements
const mutable = <T>(val: T): { -readonly [K in keyof T]: T[K] extends readonly (infer U)[] ? U[] : T[K] } =>
  JSON.parse(JSON.stringify(val))

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../_shared-core/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/admin/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...theme.colors,
        // Legacy alias for migration period
        'brand-primary': '#0EA5E9',
        'brand-secondary': '#22C55E',
      },
      fontFamily: mutable(theme.fontFamily) as any,
      fontSize: theme.fontSize as any,
      spacing: theme.spacing,
      screens: theme.screens,
      borderRadius: theme.borderRadius,
      boxShadow: theme.boxShadow,
      keyframes: theme.keyframes as any,
      animation: theme.animation,
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
