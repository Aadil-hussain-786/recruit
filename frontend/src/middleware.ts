import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protocol: Full Hide Mode
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define allowed paths (Whitelisted)
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

    // 2. Redirect all other traffic to Coming Soon
    if (!isAllowed) {
        return NextResponse.redirect(new URL('/coming-soon', request.url));
    }

    return NextResponse.next();
}

// Optimization: Apply to all routes
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
