import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/validators';
import { getDisplayName } from '@/lib/displayName';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();
    const handle = data.instagramHandle.replace(/^@/, '').toLowerCase();

    const existingHandleUser = await prisma.user.findUnique({
      where: { instagramHandle: handle }
    });
    const existingEmailUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingHandleUser && !existingHandleUser.isPlaceholder) {
      return Response.json(
        { error: 'Instagram username already registered.' },
        { status: 409 }
      );
    }

    if (existingEmailUser && existingEmailUser.id !== existingHandleUser?.id) {
      return Response.json(
        { error: 'Email already registered.' },
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

    const baseUserData = {
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
      passwordHash,
      isPlaceholder: false
    };

    let user;
    if (existingHandleUser?.isPlaceholder) {
      user = await prisma.user.update({
        where: { id: existingHandleUser.id },
        data: baseUserData,
        select: {
          id: true,
          email: true,
          instagramHandle: true
        }
      });
    } else {
      user = await prisma.user.create({
        data: baseUserData,
        select: {
          id: true,
          email: true,
          instagramHandle: true
        }
      });
    }

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Register error', error);
    return Response.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
