/**
 * @vertigo/auth - withTenant Middleware
 * Tenant-aware middleware for multi-tenant routes
 */

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextAuthOptions, Session } from 'next-auth'
import type { VertigoSessionUser } from '../types'

export interface TenantRequest extends NextRequest {
  session: Session
  user: VertigoSessionUser
  tenantId: string
}

type RouteHandler = (
  req: TenantRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse

/**
 * Wrap an API route handler to require tenant context
 * Ensures user has a valid tenantId in their session
 * @param handler Route handler function
 * @param authOptions NextAuth options
 * @returns Protected route handler
 */
export function withTenant(handler: RouteHandler, authOptions: NextAuthOptions): RouteHandler {
  return async (req: TenantRequest, context?: { params: Record<string, string> }) => {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = session.user as VertigoSessionUser

    if (!user.tenantId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Tenant context required' },
        { status: 403 }
      )
    }

    // Attach session and tenant to request
    req.session = session
    req.user = user
    req.tenantId = user.tenantId

    return handler(req, context)
  }
}
