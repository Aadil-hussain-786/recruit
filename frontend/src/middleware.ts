import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow the home page and the coming-soon page
  if (
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/coming-soon')
  ) {
    return NextResponse.next()
  }
  
  // Allow internal Next.js files and static assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/images/') ||
    request.nextUrl.pathname.startsWith('/videos/') 
  ) {
    return NextResponse.next()
  }

  // Redirect all other requests to the Coming Soon page
  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
