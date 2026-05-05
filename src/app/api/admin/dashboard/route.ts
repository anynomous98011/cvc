import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalUsers,
      activeUsers7d,
      totalActivities,
      topPagesRaw,
      recentLogs,
      users,
      recentScrapedItems,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pageActivity.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.pageActivity.count(),
      prisma.pageActivity.groupBy({
        by: ['pagePath'],
        _sum: { durationMs: true },
        _count: { _all: true },
        orderBy: { _sum: { durationMs: 'desc' } },
        take: 8,
      }),
      prisma.userLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          hasFullAccess: true,
          createdAt: true,
          _count: { select: { pageActivities: true, userLogs: true } },
        },
      }),
      prisma.scrapedItem.findMany({
        orderBy: { fetchedAt: 'desc' },
        take: 20,
      }),
    ]);

    const topPages = topPagesRaw.map((entry) => ({
      pagePath: entry.pagePath,
      visits: entry._count._all,
      totalMinutes: Number(((entry._sum.durationMs || 0) / 60000).toFixed(2)),
    }));

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers7d: activeUsers7d.length,
        totalActivities,
      },
      topPages,
      recentLogs,
      users,
      recentScrapedItems,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
