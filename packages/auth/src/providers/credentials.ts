/**
 * @vertigo/auth - Credentials Provider
 * Configurable credentials provider for NextAuth
 */

import { compare } from 'bcryptjs'

// Lazy-loaded credentials provider to handle ESM/CJS interop
// This is called at runtime when createCredentialsProvider is invoked
function getCredentialsProvider() {
  const mod = require('next-auth/providers/credentials')
  return mod.default || mod
}
import type { PrismaClient } from '@prisma/client'
import type { AuthConfig, VertigoUser, ErrorMessages } from '../types'
import { ERROR_MESSAGES } from '../constants'

interface CreateCredentialsProviderOptions {
  prisma: PrismaClient
  passwordField: 'password' | 'passwordHash'
  multiTenantEnabled: boolean
  includeSlug: boolean
  messages: ErrorMessages
}

/**
 * Create a configurable credentials provider
 */
export function createCredentialsProvider(options: CreateCredentialsProviderOptions) {
  const { prisma, passwordField, multiTenantEnabled, includeSlug, messages } = options

  // Get the credentials provider at runtime to avoid ESM/CJS issues
  const CredentialsProvider = getCredentialsProvider()

  return CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials): Promise<VertigoUser | null> {
      if (!credentials?.email || !credentials?.password) {
        throw new Error(messages.emailPasswordRequired)
      }

      // Build include clause based on multi-tenant config
      const includeClause = multiTenantEnabled ? { tenant: true } : undefined

      // Query user with optional tenant
      const user = await (prisma as any).user.findUnique({
        where: { email: credentials.email },
        include: includeClause,
      })

      if (!user) {
        throw new Error(messages.invalidCredentials)
      }

      // Get password from configured field
      const storedPassword = user[passwordField]
      if (!storedPassword) {
        throw new Error(messages.invalidCredentials)
      }

      // Verify password
      const isValid = await compare(credentials.password, storedPassword)
      if (!isValid) {
        throw new Error(messages.invalidCredentials)
      }

      // Build user object based on configuration
      const vertigoUser: VertigoUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }

      // Add tenant info if multi-tenant is enabled
      if (multiTenantEnabled && user.tenant) {
        vertigoUser.tenantId = user.tenantId
        vertigoUser.tenantName = user.tenant.name
        if (includeSlug && user.tenant.slug) {
          vertigoUser.tenantSlug = user.tenant.slug
        }
      }

      return vertigoUser
    },
  })
}

/**
 * Helper to get error messages for locale
 */
export function getErrorMessages(locale: 'en' | 'cs' = 'en'): ErrorMessages {
  return ERROR_MESSAGES[locale]
}
