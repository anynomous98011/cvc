import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import type { NextRequest } from 'next/server';
import UAParser from 'user-agents';

function safeUserAgentFingerprint(uaStr: string): string {
  try {
    const ua = new UAParser(uaStr);
    const value = ua.toString().trim();
    return value ? value.replace(/ /g, '_') : 'unknown_device';
  } catch {
    return 'unknown_device';
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user (invalidates existing sessions)
 */
export async function createSession(userId: string, req?: NextRequest) {
  const deviceFingerprint = req ? getDeviceFingerprint(req) : 'unknown';

  // Update user device info
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentDeviceId: generateDeviceId(),
      lastDeviceFingerprint: deviceFingerprint,
    },
  });

  // Invalidate existing sessions for this user
  await prisma.session.deleteMany({
    where: { userId }
  });

  // Log login
  await logUserAction(userId, 'login', req);

  // Create new session
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
    include: {
      user: true,
    },
  });

  return session;
}

/**
 * Verify a session token and return user data if valid
 */
export async function verifySession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

/**
 * Invalidate a session
 */
export async function invalidateSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

/**
 * Generate device ID
 */
export function generateDeviceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Get device fingerprint from request
 */
export function getDeviceFingerprint(req: NextRequest): string {
  const uaStr = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  return `${safeUserAgentFingerprint(uaStr)}-${ip.replace(/:/g, '_')}`;
}

/**
 * Log user action to UserLog
 */
export async function logUserAction(userId: string, action: string, req?: NextRequest): Promise<void> {
  if (!req) return;

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const uaStr = req.headers.get('user-agent') || '';
  const deviceFingerprint = safeUserAgentFingerprint(uaStr);

  await prisma.userLog.create({
    data: {
      userId,
      action,
      ip,
      deviceFingerprint,
    },
  });
}

/**
 * Clean up expired sessions (can be run as a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
