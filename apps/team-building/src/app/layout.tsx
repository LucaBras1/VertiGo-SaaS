import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'TeamForge - Build Stronger Teams with AI',
  description: 'AI-powered team building management system for corporate team building companies. Match activities to objectives, calibrate difficulty, and generate HR-ready reports.',
  keywords: 'team building, corporate training, AI team building, team dynamics, HR reports',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!bg-white !text-neutral-900 !shadow-lg !border !border-neutral-200 dark:!bg-neutral-800 dark:!text-neutral-100 dark:!border-neutral-700',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
