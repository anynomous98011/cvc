import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/auth-server';

/**
 * SECURITY: Admin credentials must come ONLY from environment variables.
 * Never hardcode credentials in source code.
 */
export function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL;
  if (!email) throw new Error('ADMIN_EMAIL environment variable is required.');
  return email;
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD environment variable is required.');
  return password;
}

export async function ensureAdminAccount(): Promise<void> {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        isEmailVerified: true,
        role: 'ADMIN',
        hasFullAccess: true,
        createdVia: 'email',
      },
    });
    return;
  }

  const passwordMatches = await verifyPassword(adminPassword, existingAdmin.password);
  if (!passwordMatches || existingAdmin.role !== 'ADMIN') {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        hasFullAccess: true,
      },
    });
  }
}

export async function requireAdminUser() {
  const session = await getServerSession();
  if (!session?.user) {
    return null;
  }

  if (session.user.role !== 'ADMIN') {
    return null;
  }

  return session.user;
}
