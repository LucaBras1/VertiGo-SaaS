'use client'

/**
 * Admin Login Page
 *
 * Authentication page for the admin panel
 */

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setLoginError(result.error === 'CredentialsSignin' ? 'Nesprávný email nebo heslo' : result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setLoginError('Nastala chyba při přihlašování')
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = loginError || (error === 'CredentialsSignin' ? 'Nesprávný email nebo heslo' : error ? 'Nastala chyba při přihlašování' : null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            <Image
              src="/images/logo.gif"
              alt="Divadlo Studna"
              width={60}
              height={60}
              className="rounded-full"
              priority
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Divadlo Studna
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            Administrace webu
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {displayError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-3 bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                aria-label="Emailová adresa"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Heslo"
                aria-label="Heslo"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-blue-600 transition-colors"
                aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Přihlašování...
                </span>
              ) : (
                'Přihlásit se'
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-blue-300">
          &copy; {new Date().getFullYear()} Divadlo Studna. Všechna práva vyhrazena.
        </p>
      </div>
    </div>
  )
}
