import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';
import { isValidOrigin } from '@/lib/security';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // SECURITY: CSRF origin check
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // SECURITY: Validate userId is a valid 24-char MongoDB ObjectId hex string
    // This prevents NoSQL injection via path parameter
    if (!/^[a-f0-9]{24}$/.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

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
    console.error('[admin/grant-access]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
