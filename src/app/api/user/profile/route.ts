import { prisma } from '@/lib/prisma';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const result = await verifySession(token);

    if (!result) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
    });

    // Fetch profile data using raw database query or separate call
    const profile = await (prisma as any).profile.findUnique({
      where: { userId: result.user.id },
    });

    return Response.json(
      {
        ...user,
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const result = await verifySession(token);

    if (!result) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, bio, location, website, phone } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        name: name ?? result.user.name,
      },
    });

    // Update or create profile
    const updatedProfile = await (prisma as any).profile.upsert({
      where: { userId: result.user.id },
      create: {
        userId: result.user.id,
        bio,
        location,
        website,
        phone,
      },
      update: {
        bio,
        location,
        website,
        phone,
      },
    });

    return Response.json(
      {
        ...updatedUser,
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
