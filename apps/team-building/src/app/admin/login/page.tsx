/**
 * Admin Login Page
 * Server component wrapper for dynamic rendering
 */

import { Suspense } from 'react'
import LoginForm from './LoginForm'

// Force dynamic rendering - useSearchParams requires dynamic
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Načítám...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
