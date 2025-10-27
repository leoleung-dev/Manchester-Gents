import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/validators';
import { getDisplayName } from '@/lib/displayName';

export async function POST(request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();
    const handle = data.instagramHandle.replace(/^@/, '').toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { instagramHandle: handle }]
      }
    });

    if (existing) {
      return Response.json(
        { error: 'Email or Instagram username already registered.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const consentTimestamp = new Date();

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const preferredName = data.preferredName ?? null;
    const displayName = getDisplayName({
      firstName: data.firstName,
      lastName: data.lastName,
      preferredName,
      shareFirstName: data.shareFirstName,
      instagramHandle: handle,
      name: data.preferredName
    });

    const user = await prisma.user.create({
      data: {
        email,
        instagramHandle: handle,
        firstName: data.firstName,
        lastName: data.lastName,
        preferredName,
        name: displayName,
        fullName,
        shareFirstName: data.shareFirstName,
        phoneNumber: data.phoneNumber ?? null,
        profilePhotoUrl: data.profilePhotoUrl ?? null,
        profilePhotoOriginalUrl: data.profilePhotoOriginalUrl ?? null,
        generalPhotoConsent: data.generalPhotoConsent,
        groupFaceConsent: data.groupFaceConsent,
        otherFaceConsent: data.otherFaceConsent,
        taggingConsent: data.taggingConsent,
        termsConsentCulture: data.termsConsentCulture,
        termsSafeSpace: data.termsSafeSpace,
        termsNoHate: data.termsNoHate,
        termsPrivacy: data.termsPrivacy,
        termsGuidelines: data.termsGuidelines,
        termsAgreed: true,
        termsSignedAt: consentTimestamp,
        consentUpdatedAt: consentTimestamp,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        instagramHandle: true
      }
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Register error', error);
    return Response.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
