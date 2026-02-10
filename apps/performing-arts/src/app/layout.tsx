import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@vertigo/admin'
import { SessionProvider } from '@/components/providers/SessionProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'StageManager - Theater Production Management',
  description: 'AI-powered management platform for theater productions and performing arts',
  keywords: 'theater, performing arts, stage management, production management, rehearsals, tech rider',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StageManager',
  },
  formatDetection: {
    telephone: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#DC2626', // Stage Red
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
          <SessionProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: '!bg-white !text-neutral-900 !shadow-lg !border !border-neutral-200 dark:!bg-neutral-800 dark:!text-neutral-100 dark:!border-neutral-700',
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
