/**
 * @vertigo/auth
 * Shared authentication and authorization for VertiGo SaaS
 *
 * @example
 * // In your app's auth.ts:
 * import { createAuthOptions } from '@vertigo/auth'
 * import { prisma } from './prisma'
 *
 * export const authOptions = createAuthOptions({
 *   prisma,
 *   pages: { signIn: '/login' },
 *   multiTenant: { enabled: true, includeSlug: true },
 *   locale: 'cs',
 * })
 *
 * @example
 * // Password utilities:
 * import { hashPassword, verifyPassword } from '@vertigo/auth'
 *
 * const hashed = await hashPassword('mysecretpassword')
 * const isValid = await verifyPassword('mysecretpassword', hashed)
 *
 * @example
 * // Session helpers in Server Components:
 * import { requireAuth, requireRole } from '@vertigo/auth'
 * import { authOptions } from './auth'
 *
 * const session = await requireAuth(authOptions)
 * // or
 * const session = await requireRole(authOptions, ['ADMIN', 'OWNER'])
 *
 * @example
 * // Middleware in API routes:
 * import { withAuth, withRole, withTenant } from '@vertigo/auth/middleware'
 *
 * export const GET = withAuth(async (req) => {
 *   const user = req.user // Typed as VertigoSessionUser
 *   return NextResponse.json({ user })
 * }, authOptions)
 */

// Main factory
export { createAuthOptions } from './config'

// Types
export type {
  AuthConfig,
  AuthPagesConfig,
  SchemaConfig,
  MultiTenantConfig,
  LocaleConfig,
  VertigoUser,
  VertigoToken,
  VertigoSessionUser,
  ErrorMessages,
} from './types'

// Utilities
export {
  hashPassword,
  verifyPassword,
  requireAuth,
  requireRole,
  getSession,
  isAuthenticated,
  hasRole,
  getTenantId,
  AuthenticationError,
  AuthorizationError,
} from './utils/index'

// Constants
export { DEFAULT_SESSION_MAX_AGE, BCRYPT_SALT_ROUNDS } from './constants'

// Re-export NextAuth types for convenience
export type { NextAuthOptions, Session } from 'next-auth'
export type { JWT } from 'next-auth/jwt'
