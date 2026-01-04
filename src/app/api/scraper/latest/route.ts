import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('q');

    const where = {
      AND: [
        source ? { source } : {},
        search ? {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } }
          ]
        } : {}
      ]
    };

    const [items, total] = await Promise.all([
      prisma.scrapedItem.findMany({
        where,
        orderBy: { fetchedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
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
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}