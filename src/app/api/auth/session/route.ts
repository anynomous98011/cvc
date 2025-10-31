import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie');
    let token: string | null = null;
    if (cookie) {
      const match = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1];
    }

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ user: null });

    const { user } = session;
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ user: null });
  }
}
