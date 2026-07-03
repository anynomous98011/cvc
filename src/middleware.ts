import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Static files: always bypass auth ──────────────────────────────────────
  if (/\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|txt|xml|woff2?|ttf|otf)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // ── Public pages: no session required ─────────────────────────────────────
  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/trending') ||
    pathname.startsWith('/viral-trends');

  if (isPublicPage) return NextResponse.next();

  // ── Public API routes: no session required ─────────────────────────────────
  // SECURITY: Only explicitly allowlisted auth endpoints are public.
  // All other /api/* routes require a session.
  const isPublicApi =
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/signup' ||
    pathname === '/api/auth/logout' ||
    pathname === '/api/auth/me' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password' ||
    pathname.startsWith('/api/auth/google');

  if (isPublicApi) return NextResponse.next();

  // ── All remaining routes require a valid session cookie ────────────────────
  const token = request.cookies.get('session-token')?.value;
  if (!token) {
    // API requests: return 401 JSON instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page requests: redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and image optimization
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
