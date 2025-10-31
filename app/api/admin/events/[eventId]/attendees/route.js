import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normaliseHandle(handle) {
  return handle?.trim().replace(/^@/, '').toLowerCase() || '';
}

export async function POST(request, { params }) {
  const session = await requireAuth('ADMIN');
  if (!session.user) {
    return session;
  }

  try {
    const body = await request.json();
    const rawIds = Array.isArray(body?.userIds) ? body.userIds : [];
    const normalisedIds = rawIds.map((value) => String(value)).filter(Boolean);
    const handle = normaliseHandle(body?.instagramHandle || '');

    if (!normalisedIds.length && !handle) {
      return Response.json({ error: 'Select at least one member to add.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { id: true, title: true }
    });
    if (!event) {
      return Response.json({ error: 'Event not found.' }, { status: 404 });
    }

    let users = [];
    if (normalisedIds.length) {
      users = await prisma.user.findMany({
        where: { id: { in: normalisedIds } },
        select: { id: true, instagramHandle: true }
      });
      if (users.length !== normalisedIds.length) {
        return Response.json({ error: 'One or more selected members no longer exist.' }, { status: 404 });
      }
    } else if (handle) {
      const user = await prisma.user.findUnique({
        where: { instagramHandle: handle },
        select: { id: true, instagramHandle: true }
      });
      if (!user) {
        return Response.json({ error: `No member or placeholder found for @${handle}.` }, { status: 404 });
      }
      users = [user];
    }

    const userIds = users.map((user) => user.id);
    const existing = await prisma.eventSignup.findMany({
      where: {
        eventId: event.id,
        userId: { in: userIds }
      },
      select: { userId: true }
    });
    const existingIds = new Set(existing.map((signup) => signup.userId));

    const toCreate = users.filter((user) => !existingIds.has(user.id));
    if (toCreate.length) {
      await prisma.eventSignup.createMany({
        data: toCreate.map((user) => ({ eventId: event.id, userId: user.id })),
        skipDuplicates: true
      });
    }

    const skipped = users.filter((user) => existingIds.has(user.id));

    return Response.json(
      {
        event,
        created: toCreate,
        skipped
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin add attendee error:', error);
    return Response.json({ error: 'Unable to add attendee to event.' }, { status: 500 });
  }
}
