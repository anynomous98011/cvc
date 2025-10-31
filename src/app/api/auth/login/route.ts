import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    // Create a new session and set as active (this will effectively kick previous sessions)
    const { token } = await createSession(user.id);

    // If remember me is checked, create a long-lived token (30 days)
    let rememberMeToken = null;
    if (rememberMe) {
      rememberMeToken = crypto.getRandomValues(new Uint8Array(32)).reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
      await prisma.user.update({
        where: { id: user.id },
        data: { rememberMeToken }
      });
    }

    const cookies = [
      `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`
    ];

    if (rememberMeToken) {
      cookies.push(`remember_me=${rememberMeToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`);
    }

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { headers: { 'Set-Cookie': cookies.join(', ') } }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
