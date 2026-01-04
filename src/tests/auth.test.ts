import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hashPassword, verifyPassword, createSession, verifySession, invalidateSessionByToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      // Hash should be different from password
      expect(hash).not.toBe(password);
      
      // Should be able to verify password
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Session Management', () => {
    let userId: string;
    let sessionToken: string;

    beforeAll(async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: await hashPassword('password123'),
          name: 'Test User'
        }
      });
      userId = user.id;
    });

    afterAll(async () => {
      // Cleanup test data
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    });

    it('should create and verify session', async () => {
      // Create session
      const session = await createSession(userId);
      sessionToken = session.token;

      // Verify session
      const verified = await verifySession(sessionToken);
      expect(verified).toBeTruthy();
      expect(verified?.user.id).toBe(userId);
    });

    it('should enforce single active session', async () => {
      // Create another session
      const newSession = await createSession(userId);
      
      // Old session should no longer be valid
      const oldVerified = await verifySession(sessionToken);
      expect(oldVerified).toBeNull();
      
      // New session should be valid
      const newVerified = await verifySession(newSession.token);
      expect(newVerified).toBeTruthy();
    });

    it('should invalidate session', async () => {
      const session = await createSession(userId);
      
      // Session should be valid initially
      const beforeInvalidate = await verifySession(session.token);
      expect(beforeInvalidate).toBeTruthy();
      
      // Invalidate session
      await invalidateSessionByToken(session.token);
      
      // Session should be invalid after
      const afterInvalidate = await verifySession(session.token);
      expect(afterInvalidate).toBeNull();
    });
  });
});

describe('Integration Tests', () => {
  it('should handle full register/login flow', async () => {
    const testUser = {
      email: 'integration@test.com',
      password: 'testPassword123',
      name: 'Integration Test'
    };

    // Register user
    const hashedPassword = await hashPassword(testUser.password);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash: hashedPassword,
        name: testUser.name
      }
    });

    expect(user.email).toBe(testUser.email);
    expect(user.name).toBe(testUser.name);
    expect(await verifyPassword(testUser.password, user.passwordHash)).toBe(true);

    // Create session
    const session = await createSession(user.id);
    expect(session.token).toBeTruthy();
    expect(session.expiresAt).toBeInstanceOf(Date);

    // Verify session
    const verifiedSession = await verifySession(session.token);
    expect(verifiedSession?.user.id).toBe(user.id);

    // Cleanup test data
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});