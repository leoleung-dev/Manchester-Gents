import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eventSignupSchema } from '@/lib/validators';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const eventId = params.eventId;

  try {
    const body = (await request.json().catch(() => ({}))) || {};
    const form = eventSignupSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        termsAgreed: true
      }
    });

    if (!user || !user.termsAgreed) {
      return Response.json(
        {
          error:
            'Please review and accept the latest Manchester Gents terms from your profile before reserving a spot.'
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        signupDeadline: true,
        capacity: true,
        attendees: {
          select: { id: true, userId: true }
        }
      }
    });

    if (!event) {
      return Response.json({ error: 'Event not found.' }, { status: 404 });
    }

    if (event.signupDeadline && new Date(event.signupDeadline) < new Date()) {
      return Response.json({ error: 'Signups are closed for this event.' }, { status: 400 });
    }

    const alreadyRegistered = event.attendees.some((attendee) => attendee.userId === session.user.id);
    if (alreadyRegistered) {
      return Response.json({ error: 'You have already booked this event.' }, { status: 400 });
    }

    if (event.capacity && event.attendees.length >= event.capacity) {
      return Response.json({ error: 'The event has reached capacity.' }, { status: 400 });
    }

    const signup = await prisma.eventSignup.create({
      data: {
        eventId,
        userId: session.user.id,
        specialRequests: form.specialRequests ?? null
      }
    });

    return Response.json({ signup }, { status: 201 });
  } catch (error) {
    console.error('Event signup error:', error);
    if (error?.name === 'ZodError') {
      return Response.json({ error: error.issues?.[0]?.message || 'Invalid form submission.' }, { status: 400 });
    }
    return Response.json({ error: 'Unable to sign up for event.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const eventId = params.eventId;

  try {
    const deleted = await prisma.eventSignup.deleteMany({
      where: {
        eventId,
        userId: session.user.id
      }
    });

    if (deleted.count === 0) {
      return Response.json({ error: 'No registration found to cancel.' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Event signup cancel error:', error);
    return Response.json({ error: 'Unable to cancel your spot right now.' }, { status: 500 });
  }
}
