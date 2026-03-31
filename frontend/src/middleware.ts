import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protocol: Full Hide Mode
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 0. ALLOW LOCAL DEVELOPMENT (Bypass restricted access for dev work)
    const isLocalhost = 
        request.nextUrl.hostname === 'localhost' || 
        request.nextUrl.hostname === '127.0.0.1';

    if (isLocalhost) {
        return NextResponse.next();
    }

    // 1. Define allowed paths (Whitelisted for Production)
    const isAllowed = 
        pathname === '/' ||                          // Homepage
        pathname === '/coming-soon' ||                // Target placeholder
        pathname === '/robots.txt' ||                 // SEO
        pathname.startsWith('/_next') ||              // Next.js internal (css/js/images)
        pathname.startsWith('/api') ||                // API routes
        pathname.includes('favicon.ico') ||           // Favicon
        pathname.includes('.png') ||                  // Dynamic assets
        pathname.includes('.jpg') ||
        pathname.includes('.svg');

    // 2. Redirect all other traffic to Coming Soon (In Production Only)
    if (!isAllowed) {
        return NextResponse.redirect(new URL('/coming-soon', request.url));
    }

    return NextResponse.next();
}

// Optimization: Apply to all routes
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
