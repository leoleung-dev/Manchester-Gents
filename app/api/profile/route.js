import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { profileUpdateSchema } from '@/lib/validators';

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = profileUpdateSchema.parse(body);
    const consentTimestamp = new Date();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name?.trim() || null,
        fullName: data.fullName.trim(),
        shareFirstName: data.shareFirstName,
        phoneNumber: data.phoneNumber ?? null,
        termsConsentCulture: data.termsConsentCulture,
        termsSafeSpace: data.termsSafeSpace,
        termsNoHate: data.termsNoHate,
        termsPrivacy: data.termsPrivacy,
        termsGuidelines: data.termsGuidelines,
        termsAgreed: true,
        termsSignedAt: consentTimestamp,
        consentUpdatedAt: consentTimestamp,
        generalPhotoConsent: data.generalPhotoConsent,
        groupFaceConsent: data.groupFaceConsent,
        otherFaceConsent: data.otherFaceConsent,
        taggingConsent: data.taggingConsent
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error?.name === 'ZodError') {
      return Response.json(
        { error: error.issues?.[0]?.message || 'Invalid profile update.' },
        { status: 400 }
      );
    }
    console.error('Profile update error:', error);
    return Response.json({ error: 'Unable to update profile.' }, { status: 500 });
  }
}
