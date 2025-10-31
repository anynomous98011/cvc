import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

// Token expiration: 1 hour
const RESET_TOKEN_TTL = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ message: 'If an account exists, a reset link will be sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    // TODO: Send email with reset link
    // For demo, we'll just return the token
    return NextResponse.json({ resetToken });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}