/**
 * Next.js Middleware
 *
 * Protects admin routes and API endpoints
 * Redirects unauthenticated users to login
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next()

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    )

    // Check if user is authenticated for admin routes
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/admin')
    const isLoginPage = req.nextUrl.pathname === '/admin/login'

    // Allow login page
    if (isLoginPage) {
      return response
    }

    // Protect admin routes
    if ((isAdminRoute || isApiAdminRoute) && !token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === '/admin/login'
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/admin')

        // Always allow login page
        if (isLoginPage) return true

        // Require auth for admin routes
        if (isAdminRoute || isApiAdminRoute) {
          return !!token
        }

        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Match admin routes
    '/admin/:path*',
    // Match admin API routes
    '/api/admin/:path*',
  ],
}
