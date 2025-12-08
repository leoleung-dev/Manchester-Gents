import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDisplayName } from '@/lib/displayName';
import { sendEventSignupCompletedNotification } from '@/lib/discordWebhook';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const signupId = params.id;
  if (!signupId) {
    return NextResponse.json({ error: 'Signup id is required.' }, { status: 400 });
  }

  try {
    const updated = await prisma.eventSignup.update({
      where: { id: signupId },
      data: { groupChatAdded: true },
      select: {
        id: true,
        actionRequiredMessageId: true,
        event: {
          select: {
            slug: true,
            title: true,
            groupChatLink: true
          }
        },
        user: {
          select: {
            id: true,
            instagramHandle: true,
            firstName: true,
            lastName: true,
            preferredName: true,
            shareFirstName: true,
            name: true
          }
        }
      }
    });

    const memberName = getDisplayName(updated.user);

    await sendEventSignupCompletedNotification({
      id: updated.id,
      groupChatUrl: updated.event?.groupChatLink || '',
      event: {
        name: updated.event?.title,
        slug: updated.event?.slug
      },
      member: {
        id: updated.user?.id,
        name: memberName,
        slug: updated.user?.instagramHandle || updated.user?.id,
        instagram: updated.user?.instagramHandle || null
      }
    });

    const actionWebhook =
      process.env.DISCORD_EVENT_ACTION_WEBHOOK_URL ||
      process.env.DISCORD_EVENT_WEBHOOK_URL;
    if (actionWebhook && updated.actionRequiredMessageId) {
      const webhookBase = actionWebhook.split('?')[0];
      const deleteUrl = `${webhookBase}/messages/${updated.actionRequiredMessageId}`;
      try {
        const deleteResponse = await fetch(deleteUrl, { method: 'DELETE' });
        if (!deleteResponse.ok) {
          console.error('Failed to delete action-required message', deleteResponse.status);
        }
      } catch (deleteError) {
        console.error('Error deleting action-required message', deleteError);
      }
    }

    const redirectUrl = new URL(`/admin/events/signups/${signupId}?done=1`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Group chat confirmation error:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Signup not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Unable to update signup.' }, { status: 500 });
  }
}
