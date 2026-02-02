/**
 * @vertigo/auth - Session Callback
 * Factory for session callback with tenant support
 */

import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { MultiTenantConfig } from '../types'

interface SessionCallbackParams {
  session: Session
  token: JWT
}

/**
 * Create a session callback that includes tenant information
 */
export function createSessionCallback(multiTenant: MultiTenantConfig = {}) {
  const { enabled = true, includeSlug = false } = multiTenant

  return async function sessionCallback({ session, token }: SessionCallbackParams): Promise<Session> {
    if (session.user) {
      (session.user as any).id = token.id as string
      (session.user as any).role = token.role as string

      if (enabled) {
        (session.user as any).tenantId = token.tenantId as string
        (session.user as any).tenantName = token.tenantName as string
        if (includeSlug) {
          (session.user as any).tenantSlug = token.tenantSlug as string
        }
      }
    }
    return session
  }
}
