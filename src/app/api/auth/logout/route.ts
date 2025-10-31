import { NextRequest, NextResponse } from 'next/server';
import { invalidateSessionByToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie');
    let token: string | null = null;
    if (cookie) {
      const match = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1];
    }
    await invalidateSessionByToken(token);

    // clear cookie
    const clear = `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
    return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': clear } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
