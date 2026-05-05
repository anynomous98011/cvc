import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth-server';
import { z } from 'zod';
import { ensureAdminAccount } from '@/lib/admin';
import { Prisma } from '@prisma/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email').refine((email) => !email.includes('temp') && !email.endsWith('example.com'), 'Use real email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    await ensureAdminAccount();
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user || !await verifyPassword(validated.password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 403 }
      );
    }

    const session = await createSession(user.id, request);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasFullAccess: user.hasFullAccess,
      },
    });

    response.cookies.set('session-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection issue. Please check server configuration.' },
        { status: 503 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2031') {
      return NextResponse.json(
        { error: 'MongoDB replica set required. Use Atlas URI or enable replica set locally.' },
        { status: 503 }
      );
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError && `${error.message}`.includes('authentication failed')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Please verify MongoDB username/password in DATABASE_URL.' },
        { status: 503 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
