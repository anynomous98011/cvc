import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getGoogleOAuthClient, GOOGLE_SCOPES } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const state = randomBytes(16).toString('hex');
    const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/';

    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isMissingCredentials = !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
    const useMock = isLocal && (process.env.MOCK_GOOGLE_LOGIN === 'true' || isMissingCredentials || request.nextUrl.searchParams.get('mock') === 'true');

    if (useMock) {
      const mockCallbackUrl = new URL(`/api/auth/google/callback?code=mock_code&state=${state}`, request.url);
      const response = NextResponse.redirect(mockCallbackUrl.toString());
      response.cookies.set('oauth-google-state', state, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60,
      });
      response.cookies.set('oauth-google-redirect', redirectTarget, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60,
      });
      return response;
    }

    const oauthClient = getGoogleOAuthClient(origin);
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
