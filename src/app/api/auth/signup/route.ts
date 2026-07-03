import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, logUserAction } from '@/lib/auth-server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { rateLimit } from '@/lib/rate-limit';
import { isValidOrigin } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF origin check
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const rate = await rateLimit(`signup:${ip}`, 5, 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const signupSchema = z.object({
      email: z.string().email('Invalid email').max(254).refine((email) => !email.includes('temp') && !email.endsWith('example.com'), 'Use real email'),
      // SECURITY: max 72 chars to prevent bcrypt DoS (bcrypt silently truncates beyond 72)
      password: z.string().min(8, 'Password too short').max(72, 'Password too long'),
      name: z.string().min(2, 'Name required').max(100),
      phone: z.string().max(20).optional(),
    });

    const validated = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone || null,
        createdVia: 'email',
        role: 'USER',
      },
    });

    // Create profile
    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    });

    // Log signup
    await logUserAction(user.id, 'signup', request);

    // Create session
    const session = await createSession(user.id, request);

    // Set session cookie
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
    console.error('[auth/signup]', error);
    // SECURITY: Never leak internal error details to the client
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

}
