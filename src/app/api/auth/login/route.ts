import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionDirect, SESSION_COOKIE_NAME } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with better error handling
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      throw dbError;
    }

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    } catch (passwordError) {
      console.error('Password verification error:', passwordError);
      throw passwordError;
    }

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session with crypto token generation
    const token = crypto.randomBytes(32).toString('hex');
    try {
      await createSessionDirect(token, user.id);
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      throw sessionError;
    }

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
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return Response.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
