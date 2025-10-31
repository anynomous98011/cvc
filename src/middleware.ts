import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';

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

  // Get session token from cookie
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = await verifySession(cookie?.value);

  if (!session?.user) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}