import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow authenticated users to access dashboard
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/packages/:path*', '/api/shoots/:path*', '/api/galleries/:path*', '/api/clients/:path*', '/api/invoices/:path*', '/api/shot-lists/:path*'],
}
