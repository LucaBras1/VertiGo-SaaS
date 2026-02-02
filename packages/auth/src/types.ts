/**
 * @vertigo/auth - Type definitions
 * Shared authentication types for all VertiGo verticals
 */

import type { PrismaClient } from '@prisma/client'

/**
 * User schema configuration
 * Allows different verticals to use different field names
 */
export interface SchemaConfig {
  /** Field name for password in User model (default: 'password') */
  passwordField?: 'password' | 'passwordHash'
}

/**
 * Multi-tenant configuration
 */
export interface MultiTenantConfig {
  /** Enable multi-tenant mode (default: true) */
  enabled?: boolean
  /** Include tenant slug in session (default: false) */
  includeSlug?: boolean
}

/**
 * Auth pages configuration
 */
export interface AuthPagesConfig {
  /** Sign in page path (default: '/login') */
  signIn?: string
  /** Error page path (default: same as signIn) */
  error?: string
  /** Sign out redirect path */
  signOut?: string
}

/**
 * Localization configuration
 */
export interface LocaleConfig {
  /** Locale for error messages (default: 'en') */
  locale?: 'en' | 'cs'
}

/**
 * Error messages per locale
 */
export interface ErrorMessages {
  emailPasswordRequired: string
  invalidCredentials: string
}

/**
 * Main auth configuration
 */
export interface AuthConfig {
  /** Prisma client instance */
  prisma: PrismaClient
  /** Auth pages configuration */
  pages?: AuthPagesConfig
  /** User schema configuration */
  schema?: SchemaConfig
  /** Multi-tenant configuration */
  multiTenant?: MultiTenantConfig
  /** Session max age in seconds (default: 30 days) */
  sessionMaxAge?: number
  /** Locale for error messages */
  locale?: 'en' | 'cs'
  /** Use Prisma adapter (default: false for credentials-only) */
  usePrismaAdapter?: boolean
}

/**
 * Extended user type returned from authorize
 */
export interface VertigoUser {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string
  tenantName?: string
  tenantSlug?: string
}

/**
 * Extended JWT token type
 */
export interface VertigoToken {
  id?: string
  role?: string
  tenantId?: string
  tenantName?: string
  tenantSlug?: string
}

/**
 * Extended session user type
 */
export interface VertigoSessionUser {
  id: string
  email: string
  name?: string | null
  role: string
  tenantId?: string
  tenantName?: string
  tenantSlug?: string
}

// Re-export for convenience
export type { NextAuthOptions, Session } from 'next-auth'
export type { JWT } from 'next-auth/jwt'
