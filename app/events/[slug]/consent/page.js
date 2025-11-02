import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getDisplayName } from '@/lib/displayName';
import ConsentList from './ConsentListClient';
import ConsentTable from './ConsentTableClient';
import consentItems from './consentItems';
import styles from './page.module.css';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildConsentRow(signup) {
  const user = signup.user;
  const values = [
    user.generalPhotoConsent,
    user.groupFaceConsent,
    user.otherFaceConsent,
    user.taggingConsent,
  ];
  const bits = values.map((value) => (value === false ? 1 : 0));
  const score = parseInt(bits.join(""), 2);
  const hasUnset = values.some(
    (value) => value === null || typeof value === "undefined"
  );
  const displayName = getDisplayName({
    firstName: user.firstName,
    lastName: user.lastName,
    preferredName: user.preferredName,
    shareFirstName: user.shareFirstName,
    instagramHandle: user.instagramHandle,
    name: user.name || null,
    fullName: user.fullName || null,
  });
  const label = displayName || `@${user.instagramHandle}`;
  const initialsSource = label.replace(/[^A-Za-z0-9]/g, "");
  const initials = (
    initialsSource.slice(0, 2) ||
    label.slice(0, 1) ||
    "MG"
  ).toUpperCase();
  return {
    id: signup.id,
    displayName: label,
    handle: user.instagramHandle,
    generalPhotoConsent: user.generalPhotoConsent,
    groupFaceConsent: user.groupFaceConsent,
    otherFaceConsent: user.otherFaceConsent,
    taggingConsent: user.taggingConsent,
    photoUrl: user.profilePhotoUrl || null,
    originalPhotoUrl:
      user.profilePhotoOriginalUrl || user.profilePhotoUrl || null,
    initials,
    score,
    hasUnset,
  };
}

export async function generateMetadata({ params }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });
  if (!event) {
    return { title: "Event not found | Manchester Gents" };
  }
  return {
    title: `${event.title} · Photo consent | Manchester Gents`,
  };
}

export default async function EventConsentPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      attendees: {
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              instagramHandle: true,
              firstName: true,
              lastName: true,
              preferredName: true,
              shareFirstName: true,
              name: true,
              fullName: true,
              profilePhotoUrl: true,
              profilePhotoOriginalUrl: true,
              generalPhotoConsent: true,
              groupFaceConsent: true,
              otherFaceConsent: true,
              taggingConsent: true,
            },
          },
        },
      },
    },
  });

  if (!event || !event.published) {
    notFound();
  }

  const isAdmin = session.user.role === "ADMIN";
  const isAttendee = event.attendees.some(
    (signup) => signup.userId === session.user.id
  );
  if (!isAdmin && !isAttendee) {
    redirect(`/events/${event.slug}`);
  }

  const rows = event.attendees
    .map((signup) => buildConsentRow(signup))
    .sort((a, b) => {
      if (a.hasUnset && !b.hasUnset) {
        return 1;
      }
      if (!a.hasUnset && b.hasUnset) {
        return -1;
      }
      if (b.score === a.score) {
        return a.displayName.localeCompare(b.displayName);
      }
      return b.score - a.score;
    })
    .map(({ score, hasUnset, ...rest }) => rest);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            <Link href={`/events/${event.slug}`}>Back to event</Link>
            <span>•</span>
            <span>Photo consent</span>
          </div>
          <h1>Photo consent overview</h1>
          <p className={styles.summary}>
            Review how fellow attendees prefer to appear in photography and tagging. Blanks indicate
            placeholder records where consent preferences are still to be confirmed.
          </p>
        </header>
        <section className={styles.tableCard}>
          <div className={styles.legendGrid}>
            {consentItems.map(({ key, label, Icon }) => (
              <div key={key} className={styles.legendItem}>
                <span className={styles.legendIcon} aria-hidden>
                  <Icon />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          {rows.length > 0 ? (
            <>
              <div className={`${styles.tableWrap} ${styles.desktopTableWrap}`}>
                <ConsentTable rows={rows} showPhotos={isAdmin} />
              </div>
              <div className={`${styles.tableWrap} ${styles.mobileCards}`}>
                <ConsentList rows={rows} showPhotos={isAdmin} />
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>
              No attendees have been added to this guest list yet. Once members RSVP, their consent
              preferences will appear here.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
