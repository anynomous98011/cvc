import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files in the public directory to bypass authentication checks
  const isStaticFile = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|txt|xml)$/i) || pathname === '/image.png';
  if (isStaticFile) {
    return NextResponse.next();
  }

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/trending') ||
    pathname.startsWith('/viral-trends');
  const isPublicApi = pathname.startsWith('/api/auth/');
  if (isPublicPage || isPublicApi) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/analytics/')) {
    return NextResponse.next();
  }

  // Check session cookie
  const token = request.cookies.get('session-token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
