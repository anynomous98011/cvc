import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionDirect, SESSION_COOKIE_NAME } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, name, password, confirmPassword } = await req.json();

    // Validate input
    if (!email || !name || !password || !confirmPassword) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      throw dbError;
    }

    if (existingUser) {
      return Response.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      });
    } catch (error: any) {
      console.error('User creation error:', error);
      if (error.code === 'P2002') {
        return Response.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Create profile separately
    try {
      await prisma.profile.create({
        data: {
          userId: user.id,
        },
      });
    } catch (profileError) {
      // Profile creation failed, but user was created - continue
      console.error('Profile creation error:', profileError);
    }

    // Create session with crypto token generation
    const token = crypto.randomBytes(32).toString('hex');
    const { expiresAt } = await createSessionDirect(token, user.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return Response.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return Response.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
