import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PartyPal - Magical Kids Party Entertainment',
  description: 'Book amazing kids party entertainment. Magical moments, zero stress.',
  keywords: ['kids party', 'birthday party', 'children entertainment', 'party planner'],
  openGraph: {
    title: 'PartyPal - Magical Kids Party Entertainment',
    description: 'Magical moments, zero stress',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-gradient-to-br from-partypal-pink-50 via-white to-partypal-yellow-50 min-h-screen`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
