/**
 * @vertigo/auth - withAuth Middleware
 * Route protection middleware for Next.js API routes
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
 * Wrap an API route handler to require authentication
 * @param handler Route handler function
 * @param authOptions NextAuth options
 * @returns Protected route handler
 */
export function withAuth(handler: RouteHandler, authOptions: NextAuthOptions): RouteHandler {
  return async (req: AuthenticatedRequest, context?: { params: Record<string, string> }) => {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Attach session to request
    req.session = session
    req.user = session.user as VertigoSessionUser

    return handler(req, context)
  }
}
