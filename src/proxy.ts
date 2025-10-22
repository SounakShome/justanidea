import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths to protect
const protectedPaths = ['/api'];

export function proxy(request: NextRequest) {
    const { nextUrl, headers } = request;

    // Add no-cache headers for development
    const response = NextResponse.next();
    
    // Prevent caching during development
    if (process.env.NODE_ENV === 'development') {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    // Only run on protected API routes
    if (!protectedPaths.some((path) => nextUrl.pathname.startsWith(path))) {
        return response;
    }

    const userAgent = headers.get('user-agent') || '';
    const origin = headers.get('origin') || '';
    const referer = headers.get('referer') || '';

    const isBrowser =
        userAgent.includes('Mozilla') &&
        ((origin?.startsWith('http') || origin?.startsWith('https')) || referer?.startsWith('http') || referer?.startsWith('https'));

    // if (!isBrowser) {
    //     return new NextResponse(
    //         JSON.stringify({ error: 'Access denied. Use a browser.' }),
    //         {
    //             status: 403,
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         }
    //     );
    // }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Apply to all routes except static files
};