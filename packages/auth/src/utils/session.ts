/**
 * @vertigo/auth - Session Utilities
 * Server-side session helpers for route handlers and server components
 */

import { getServerSession } from 'next-auth'
import type { NextAuthOptions, Session } from 'next-auth'
import type { VertigoSessionUser } from '../types'

/**
 * Error thrown when authentication is required but not present
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Error thrown when user doesn't have required role
 */
export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Get current session, throw if not authenticated
 * @param authOptions NextAuth options
 * @returns Session with user
 */
export async function requireAuth(authOptions: NextAuthOptions): Promise<Session> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new AuthenticationError()
  }

  return session
}

/**
 * Get current session and verify user has required role
 * @param authOptions NextAuth options
 * @param allowedRoles Array of allowed role names
 * @returns Session with user
 */
export async function requireRole(
  authOptions: NextAuthOptions,
  allowedRoles: string[]
): Promise<Session> {
  const session = await requireAuth(authOptions)
  const user = session.user as VertigoSessionUser

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(`Role '${user.role}' is not authorized`)
  }

  return session
}

/**
 * Get current session (returns null if not authenticated)
 * @param authOptions NextAuth options
 * @returns Session or null
 */
export async function getSession(authOptions: NextAuthOptions): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Check if user is authenticated
 * @param authOptions NextAuth options
 * @returns True if authenticated
 */
export async function isAuthenticated(authOptions: NextAuthOptions): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return !!session?.user
}

/**
 * Check if user has specific role
 * @param authOptions NextAuth options
 * @param role Role to check
 * @returns True if user has role
 */
export async function hasRole(
  authOptions: NextAuthOptions,
  role: string
): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false
  return (session.user as VertigoSessionUser).role === role
}

/**
 * Get current tenant ID from session
 * @param authOptions NextAuth options
 * @returns Tenant ID or undefined
 */
export async function getTenantId(authOptions: NextAuthOptions): Promise<string | undefined> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return undefined
  return (session.user as VertigoSessionUser).tenantId
}
