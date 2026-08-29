import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global Edge/Server Middleware to enforce security headers and inspect API requests.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Enforce baseline security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
