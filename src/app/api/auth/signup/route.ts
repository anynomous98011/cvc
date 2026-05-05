import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, logUserAction } from '@/lib/auth-server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const signupSchema = z.object({
      email: z.string().email('Invalid email').refine((email) => !email.includes('temp') && !email.endsWith('example.com'), 'Use real email'),
      password: z.string().min(8, 'Password too short'),
      name: z.string().min(2, 'Name required'),
      phone: z.string().optional(),
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

}
