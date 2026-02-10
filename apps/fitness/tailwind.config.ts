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
        // Legacy aliases - fitness uses primary/secondary naming
        primary: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
        secondary: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
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
