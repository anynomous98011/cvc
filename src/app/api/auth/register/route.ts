import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createSession, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });

    const { token, expiresAt } = await createSession(user.id);

    const cookie = `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201, headers: { 'Set-Cookie': cookie } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
