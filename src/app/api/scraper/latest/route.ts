import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeSearchParam } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Sanitize source: allow only alphanumeric + hyphen, max 50 chars
    const rawSource = searchParams.get('source') || '';
    const source = /^[a-zA-Z0-9-]{1,50}$/.test(rawSource) ? rawSource : undefined;

    // Clamp page and limit to sane ranges to prevent DB scan abuse
    const page = Math.max(1, Math.min(parseInt(searchParams.get('page') || '1') || 1, 1000));
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '20') || 20, 50));

    // SECURITY: sanitize search param to prevent ReDoS via Prisma regex contains
    const search = sanitizeSearchParam(searchParams.get('q'));

    const where = {
      AND: [
        source ? { source } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {}
      ]
    };

    const [items, total] = await Promise.all([
      prisma.scrapedItem.findMany({
        where,
        orderBy: { fetchedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        // Only return safe fields — never expose internal DB IDs in bulk endpoints
        select: {
          id: true,
          url: true,
          title: true,
          content: true,
          source: true,
          fetchedAt: true,
        },
      }),
      prisma.scrapedItem.count({ where })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  } catch (err) {
    console.error('[scraper/latest]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}