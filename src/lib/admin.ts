import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/auth-server';

const DEFAULT_ADMIN_EMAIL = 'beinganynomous@gmail.com';
const DEFAULT_ADMIN_PASSWORD = '9801121599@ritik';

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
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
