import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4444',
          dark: '#FF2222',
          light: '#FF6666',
        },
        secondary: {
          DEFAULT: '#FFD54F',
        },
        neutral: {
          black: '#000000',
          gray: {
            900: '#0A0A0A',
            800: '#1A1A1A',
            700: '#2A2A2A',
            600: '#404040',
            500: '#808080',
            400: '#A0A0A0',
            300: '#C0C0C0',
            200: '#E0E0E0',
            100: '#F5F5F5',
          },
          white: '#FFFFFF',
        },
        success: '#81C784',
        warning: '#FFB74D',
        error: '#EF5350',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['2rem', { lineHeight: '1.3' }],
        '4xl': ['2.5rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        base: '0 2px 8px rgba(0,0,0,0.4)',
        md: '0 4px 12px rgba(0,0,0,0.5)',
        lg: '0 8px 24px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(239,83,80,0.3)',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
export default config
