import { cookies } from 'next/headers';
import type { Session as DbSession } from '@prisma/client';
import { verifySession } from '@/lib/auth-server';

export type AuthSession = DbSession & {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: 'USER' | 'ADMIN';
    hasFullAccess: boolean;
  };
};

export async function getServerSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;
    if (!token) return null;
    const session = await verifySession(token);
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}
