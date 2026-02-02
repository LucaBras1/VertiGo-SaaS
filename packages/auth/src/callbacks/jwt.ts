/**
 * @vertigo/auth - JWT Callback
 * Factory for JWT callback with tenant support
 */

import type { JWT } from 'next-auth/jwt'
import type { MultiTenantConfig, VertigoUser } from '../types'

interface JWTCallbackParams {
  token: JWT
  user?: VertigoUser | any
}

/**
 * Create a JWT callback that includes tenant information
 */
export function createJwtCallback(multiTenant: MultiTenantConfig = {}) {
  const { enabled = true, includeSlug = false } = multiTenant

  return async function jwtCallback({ token, user }: JWTCallbackParams): Promise<JWT> {
    if (user) {
      token.id = user.id
      token.role = user.role

      if (enabled) {
        token.tenantId = user.tenantId
        token.tenantName = user.tenantName
        if (includeSlug) {
          token.tenantSlug = user.tenantSlug
        }
      }
    }
    return token
  }
}
