import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, verifySession } from '@/lib/auth-server';

describe('Auth Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  };

  // Cleanup any existing test user
  beforeAll(async () => {
    await prisma.session.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('should hash and verify password', async () => {
    const hash = await hashPassword(testUser.password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testUser.password);
    
    const isValid = await verifyPassword(testUser.password, hash);
    expect(isValid).toBe(true);
  });

  it('should create user and manage sessions', async () => {
    // Create user
    const hash = await hashPassword(testUser.password);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash: hash,
        name: testUser.name
      }
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe(testUser.email);

    // Create first session
    const session1 = await createSession(user.id);
    expect(session1.token).toBeDefined();
    
    // Verify session works
    const check1 = await verifySession(session1.token);
    expect(check1?.user.id).toBe(user.id);
    
    // Create second session (should invalidate first)
    const session2 = await createSession(user.id);
    expect(session2.token).toBeDefined();
    
    // First session should no longer work
    const check1Again = await verifySession(session1.token);
    expect(check1Again).toBeNull();
    
    // Second session should work
    const check2 = await verifySession(session2.token);
    expect(check2?.user.id).toBe(user.id);
  });
});