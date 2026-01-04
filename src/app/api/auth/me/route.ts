import { verifySession, invalidateSessionByToken, SESSION_COOKIE_NAME } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await invalidateSessionByToken(token);
      cookieStore.delete(SESSION_COOKIE_NAME);
    }

    return Response.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const result = await verifySession(token);

    if (!result) {
      return Response.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return Response.json(
      {
        authenticated: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return Response.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
