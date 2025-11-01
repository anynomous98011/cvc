import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: do NOT import server-only helpers (like '@/lib/auth') here because Next.js
// middleware runs in the Edge runtime which doesn't support Node modules such as
// 'crypto' or packages that rely on Node APIs. Keep middleware lightweight and
// only perform a presence check for the session cookie. Full session
// verification (DB lookup, token validation) should happen inside API routes
// or server-side handlers that run in the Node runtime.
const SESSION_COOKIE_NAME = 'cvc_session';

// Add protected routes here
const PROTECTED_ROUTES = [
  '/creator-studio',
  '/seo-analyzer',
  '/ai-assistant',
  '/scraped-items'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for non-protected routes and API routes
  if (!PROTECTED_ROUTES.some(route => path.startsWith(route)) || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get session token from cookie. Middleware is allowed to check for
  // existence of the cookie; avoid full verification here because that
  // requires DB access / Node APIs which aren't available in Edge.
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}