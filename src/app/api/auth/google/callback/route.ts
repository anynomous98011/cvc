import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword } from '@/lib/auth-server';
import { getGoogleOAuthClient } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const expectedState = request.cookies.get('oauth-google-state')?.value;
    const redirectTarget = request.cookies.get('oauth-google-redirect')?.value || '/';

    if (!code || !state || !expectedState || state !== expectedState) {
      return NextResponse.redirect(new URL('/login?error=google_state_mismatch', request.url));
    }

    const origin = request.nextUrl.origin;
    let data;

    if (code === 'mock_code' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      data = {
        id: 'mock-google-id-123456',
        email: 'google-test-user@example.com',
        name: 'Google Test User',
        given_name: 'Google',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100',
      };
    } else {
      const oauthClient = getGoogleOAuthClient(origin);
      const { tokens } = await oauthClient.getToken(code);
      oauthClient.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: oauthClient,
        version: 'v2',
      });
      const res = await oauth2.userinfo.get();
      data = res.data;
    }

    if (!data.email) {
      return NextResponse.redirect(new URL('/login?error=google_email_missing', request.url));
    }

    const userEmail = data.email.toLowerCase();

    const existingByEmail = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    const user = existingByEmail
      ? await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: data.id || existingByEmail.googleId,
            isEmailVerified: true,
            createdVia: existingByEmail.createdVia || 'google',
          },
        })
      : await (async () => {
          const newUser = await prisma.user.create({
            data: {
              email: userEmail,
              password: await hashPassword(crypto.randomUUID()),
              name: data.name || data.given_name || 'Google User',
              googleId: data.id || null,
              isEmailVerified: true,
              createdVia: 'google',
              role: 'USER',
            },
          });
          await prisma.profile.create({
            data: {
              userId: newUser.id,
              avatar: data.picture || null,
            },
          });
          return newUser;
        })();

    const session = await createSession(user.id, request);
    const safeRedirect = redirectTarget.startsWith('/') ? redirectTarget : '/';
    const response = NextResponse.redirect(new URL(safeRedirect, request.url));
    response.cookies.set('session-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    response.cookies.delete('oauth-google-state');
    response.cookies.delete('oauth-google-redirect');
    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=google_callback_failed', request.url));
  }
}
