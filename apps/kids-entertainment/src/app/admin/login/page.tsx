/**
 * PartyPal Admin Login Page
 * Login form with PartyPal branding (Pink #F472B6)
 */

'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PartyPopper, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const callbackUrl = searchParams?.get('callbackUrl') || '/admin'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Nesprávný email nebo heslo')
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('Něco se pokazilo. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none transition-all"
          placeholder="vas@email.cz"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Heslo
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
      </Button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-partypal-pink-100 via-white to-sky-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-partypal-pink-500 to-partypal-yellow-500 rounded-2xl mb-4">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-partypal-pink-500 to-sky-500 bg-clip-text text-transparent">
            PartyPal Admin
          </h1>
          <p className="text-gray-600 mt-2">Přihlaste se do administrace</p>
        </div>

        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-xl" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-partypal-pink-600 hover:text-partypal-pink-700 font-semibold"
          >
            ← Zpět na hlavní stránku
          </a>
        </div>
      </Card>
    </div>
  )
}
