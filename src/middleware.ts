import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth-server';

// List of protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/creator-studio',
  '/ai-assistant',
  '/trending',
  '/viral-trends',
  '/seo-analyzer',
  '/scraped-items',
];

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/me',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API requests (handled by individual routes)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token is valid
  try {
    const result = await verifySession(token);
    if (!result) {
      // Invalid or expired token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    // Error verifying token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
