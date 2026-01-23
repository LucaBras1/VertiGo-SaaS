import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GigBook - AI-Powered Booking for Musicians',
  description: 'Streamline your music career with AI-powered setlist generation, smart pricing, and professional stage riders.',
  keywords: ['musicians', 'booking', 'gig management', 'setlist generator', 'band management'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
