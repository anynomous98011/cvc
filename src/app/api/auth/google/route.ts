import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getGoogleOAuthClient, GOOGLE_SCOPES } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const oauthClient = getGoogleOAuthClient();
    const state = randomBytes(16).toString('hex');
    const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/';

    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
      prompt: 'select_account',
      state,
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('oauth-google-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });
    response.cookies.set('oauth-google-redirect', redirectTarget, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });

    return response;
  } catch (error) {
    console.error('Google auth init error:', error);
    return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url));
  }
}
