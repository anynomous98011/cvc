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

    const oauthClient = getGoogleOAuthClient();
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauthClient,
      version: 'v2',
    });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return NextResponse.redirect(new URL('/login?error=google_email_missing', request.url));
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
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
      : await prisma.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: await hashPassword(crypto.randomUUID()),
            name: data.name || data.given_name || 'Google User',
            googleId: data.id || null,
            isEmailVerified: true,
            createdVia: 'google',
            role: 'USER',
          },
        });

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
