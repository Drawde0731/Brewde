import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/request-access',
  '/change-password',
  '/api/signup-request',
  '/api/admin/approve',
  '/api/admin/reject',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/debug',
]

// Pages only owners/cashiers can access (not admin)
const OWNER_PATHS = ['/pos', '/dashboard', '/products', '/orders', '/settings']
// Pages only admin can access
const ADMIN_PATHS = ['/admin']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isStatic = pathname.startsWith('/_next') || /\.\w+$/.test(pathname)
  if (isStatic) return NextResponse.next()

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  const sessionCookie = request.cookies.get('session')

  // No session → redirect to login (except public paths)
  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Has session
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value)

      // Logged-in user hits login page → send to correct home
      if (pathname === '/login' || pathname === '/request-access') {
        const home = session.role === 'admin' ? '/admin/requests' : '/pos'
        return NextResponse.redirect(new URL(home, request.url))
      }

      // Admin trying to access owner-only pages → redirect to admin home
      if (session.role === 'admin' && OWNER_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/admin/requests', request.url))
      }

      // Non-admin trying to access admin pages → redirect to pos
      if (session.role !== 'admin' && ADMIN_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/pos', request.url))
      }
    } catch {
      // Corrupt cookie → clear and send to login
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.delete('session')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
