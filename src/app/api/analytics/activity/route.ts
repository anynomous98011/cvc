import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/session';
import { getDeviceFingerprint } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const pagePath = typeof body.pagePath === 'string' ? body.pagePath.trim() : '';
    const durationMs = Number(body.durationMs ?? 0);

    if (!pagePath || Number.isNaN(durationMs) || durationMs < 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const boundedDurationMs = Math.min(Math.floor(durationMs), 30 * 60 * 1000);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.pageActivity.create({
      data: {
        userId: session.user.id,
        pagePath,
        durationMs: boundedDurationMs,
        ip,
        deviceFingerprint: getDeviceFingerprint(request),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Activity logging error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
