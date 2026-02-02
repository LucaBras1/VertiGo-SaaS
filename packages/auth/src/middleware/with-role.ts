/**
 * @vertigo/auth - withRole Middleware
 * Role-based access control middleware
 */

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextAuthOptions, Session } from 'next-auth'
import type { VertigoSessionUser } from '../types'

export interface AuthenticatedRequest extends NextRequest {
  session: Session
  user: VertigoSessionUser
}

type RouteHandler = (
  req: AuthenticatedRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse

/**
 * Wrap an API route handler to require specific roles
 * @param handler Route handler function
 * @param authOptions NextAuth options
 * @param allowedRoles Array of allowed role names
 * @returns Protected route handler
 */
export function withRole(
  handler: RouteHandler,
  authOptions: NextAuthOptions,
  allowedRoles: string[]
): RouteHandler {
  return async (req: AuthenticatedRequest, context?: { params: Record<string, string> }) => {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = session.user as VertigoSessionUser

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Attach session to request
    req.session = session
    req.user = user

    return handler(req, context)
  }
}

/**
 * Check if request is from an admin user
 * Convenience wrapper for common admin-only routes
 */
export function withAdmin(handler: RouteHandler, authOptions: NextAuthOptions): RouteHandler {
  return withRole(handler, authOptions, ['ADMIN', 'OWNER'])
}
