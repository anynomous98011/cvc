import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/session';
import { getDeviceFingerprint } from '@/lib/auth-server';
import { sanitizePagePath, isValidOrigin } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF origin check on state-mutating endpoint
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // SECURITY: Validate and sanitize pagePath (NoSQL injection + path traversal protection)
    const pagePath = sanitizePagePath(body.pagePath);
    if (!pagePath) {
      return NextResponse.json({ error: 'Invalid pagePath' }, { status: 400 });
    }

    // SECURITY: Strictly validate durationMs — must be a finite positive integer
    const rawDuration = Number(body.durationMs ?? 0);
    if (!Number.isFinite(rawDuration) || rawDuration < 0) {
      return NextResponse.json({ error: 'Invalid durationMs' }, { status: 400 });
    }
    const boundedDurationMs = Math.min(Math.floor(rawDuration), 30 * 60 * 1000);

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

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
    console.error('[analytics/activity]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
