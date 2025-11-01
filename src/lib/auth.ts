import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'cvc_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // set user's activeSessionId to this session; invalidate previous session implicitly
  await prisma.user.update({ where: { id: userId }, data: { activeSessionId: session.id } });

  return { token, expiresAt, sessionId: session.id };
}

export async function verifySession(token: string | undefined | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < new Date()) return null;
  // enforce single active session: the user's activeSessionId must match this session id
  if (!session.user) return null;
  if (session.user.activeSessionId !== session.id) return null;
  return { session, user: session.user };
}

export async function invalidateSessionByToken(token: string | undefined | null) {
  if (!token) return;
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return;
  await prisma.user.updateMany({ where: { id: session.userId, activeSessionId: session.id }, data: { activeSessionId: null } });
  await prisma.session.deleteMany({ where: { id: session.id } });
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS };
