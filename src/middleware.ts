import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect student routes
  if (pathname.startsWith('/student')) {
    if (!session || session.user.type !== 'student') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || session.user.type !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // If authenticated, redirect from login to appropriate dashboard
  if (pathname === '/login' && session) {
    if (session.user.type === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url))
    }
    if (session.user.type === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
