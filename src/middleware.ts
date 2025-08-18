import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths to protect
const protectedPaths = ['/api'];

export function middleware(request: NextRequest) {
    const { nextUrl, headers } = request;

    // Only run on protected API routes
    if (!protectedPaths.some((path) => nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const userAgent = headers.get('user-agent') || '';
    const origin = headers.get('origin') || '';
    const referer = headers.get('referer') || '';

    const isBrowser =
        userAgent.includes('Mozilla') &&
        ((origin?.startsWith('http') || origin?.startsWith('https')) || referer?.startsWith('http') || referer?.startsWith('https'));

    if (!isBrowser) {
        return new NextResponse(
            JSON.stringify({ error: 'Access denied. Use a browser.' }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'], // Applies only to API routes
};