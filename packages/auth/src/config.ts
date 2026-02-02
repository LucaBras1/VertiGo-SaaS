/**
 * @vertigo/auth - Configuration Factory
 * Main entry point for creating NextAuth configuration
 */

import type { NextAuthOptions } from 'next-auth'
import type { AuthConfig } from './types'
import { createCredentialsProvider, getErrorMessages } from './providers/credentials'
import { createJwtCallback } from './callbacks/jwt'
import { createSessionCallback } from './callbacks/session'
import { DEFAULT_SESSION_MAX_AGE } from './constants'

/**
 * Create NextAuth options with VertiGo defaults
 *
 * @example
 * // Basic usage (single-tenant)
 * export const authOptions = createAuthOptions({
 *   prisma,
 *   pages: { signIn: '/admin/login' },
 *   multiTenant: { enabled: false },
 * })
 *
 * @example
 * // Multi-tenant with slug
 * export const authOptions = createAuthOptions({
 *   prisma,
 *   pages: { signIn: '/auth/signin' },
 *   multiTenant: { enabled: true, includeSlug: true },
 *   locale: 'cs',
 * })
 *
 * @example
 * // Using passwordHash field
 * export const authOptions = createAuthOptions({
 *   prisma,
 *   pages: { signIn: '/auth/login' },
 *   schema: { passwordField: 'passwordHash' },
 * })
 */
export function createAuthOptions(config: AuthConfig): NextAuthOptions {
  const {
    prisma,
    pages = {},
    schema = {},
    multiTenant = {},
    sessionMaxAge = DEFAULT_SESSION_MAX_AGE,
    locale = 'en',
  } = config

  // Resolve configuration with defaults
  const signInPage = pages.signIn || '/login'
  const errorPage = pages.error || signInPage
  const passwordField = schema.passwordField || 'password'
  const multiTenantEnabled = multiTenant.enabled !== false // true by default
  const includeSlug = multiTenant.includeSlug || false
  const messages = getErrorMessages(locale)

  // Create provider
  const credentialsProvider = createCredentialsProvider({
    prisma,
    passwordField,
    multiTenantEnabled,
    includeSlug,
    messages,
  })

  // Create callbacks
  const jwtCallback = createJwtCallback({ enabled: multiTenantEnabled, includeSlug })
  const sessionCallback = createSessionCallback({ enabled: multiTenantEnabled, includeSlug })

  return {
    providers: [credentialsProvider],
    session: {
      strategy: 'jwt',
      maxAge: sessionMaxAge,
    },
    pages: {
      signIn: signInPage,
      error: errorPage,
      ...(pages.signOut && { signOut: pages.signOut }),
    },
    callbacks: {
      jwt: jwtCallback,
      session: sessionCallback,
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
}
