import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const SESSION_COOKIE_NAME = 'cvc_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function createSessionDirect(token: string, userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt, sessionId: session.id };
}

export async function verifySession(token: string | undefined | null) {
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return null;
    if (session.expiresAt && session.expiresAt < new Date()) {
      // Session expired, delete it
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }
    return { session, user: session.user };
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

export async function invalidateSessionByToken(token: string | undefined | null) {
  if (!token) return;
  try {
    await prisma.session.deleteMany({ where: { token } });
  } catch (error) {
    console.error('Error invalidating session:', error);
  }
}
