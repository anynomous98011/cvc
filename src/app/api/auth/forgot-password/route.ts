import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rate = await rateLimit(`forgot-password:${ip}`, 3, 60 * 1000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many forgot-password attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return 200 even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Save token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/reset-password?token=${token}`;

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (smtpEmail && smtpPassword) {
      // Send email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpEmail,
          pass: smtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"Rachna Rivo" <${smtpEmail}>`,
        to: user.email,
        subject: 'Reset your password - Rachna Rivo',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${user.name || 'there'},</p>
          <p>Someone requested a password reset for your account. If this was you, click the link below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } else {
      console.log('-------------------------------------------');
      console.log('NO SMTP CREDENTIALS FOUND. LOGGING RESET LINK:');
      console.log(resetLink);
      console.log('-------------------------------------------');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
