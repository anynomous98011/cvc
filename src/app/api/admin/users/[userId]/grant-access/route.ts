import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const hasFullAccess = Boolean(body.hasFullAccess);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hasFullAccess },
      select: {
        id: true,
        email: true,
        name: true,
        hasFullAccess: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Grant access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
