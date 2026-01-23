import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../_shared-core/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TeamForge brand colors
        brand: {
          primary: '#0EA5E9', // Corporate Blue (Cyan 500)
          secondary: '#22C55E', // Trust Green (Green 500)
          accent: '#10B981',
          dark: '#0369A1',
          light: '#E0F2FE',
        },
        // Keep default Tailwind colors for flexibility
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
