import { google } from 'googleapis';

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:9002';

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth environment variables');
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${appUrl}/api/auth/google/callback`
  );
}

export const GOOGLE_SCOPES = ['openid', 'email', 'profile'];
