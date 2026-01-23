/**
 * Middleware for protecting admin routes
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // If user is authenticated, continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow authenticated users with admin role
        return !!token && token.role === 'admin'
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
)

// Protect all /admin routes except /admin/login
export const config = {
  matcher: [
    '/admin/((?!login).*)',
  ],
}
