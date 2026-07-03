import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-server';
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
    const rate = await rateLimit(`reset-password:${ip}`, 3, 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // SECURITY: Enforce strict token format — must be exactly 64 hex chars.
    // This prevents replay of malformed tokens and probing DB with arbitrary strings.
    if (!/^[a-f0-9]{64}$/.test(String(token))) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // SECURITY: Password length bounds (min 8, max 72 to avoid bcrypt DoS)
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: 'Password must be 8–72 characters' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Update user password (securely without plainPassword storage)
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the token so it can't be used again
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Optionally delete all sessions for this user so they are logged out everywhere
    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
