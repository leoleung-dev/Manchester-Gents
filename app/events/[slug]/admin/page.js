import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AdminEventForm from '@/components/AdminEventForm';
import AdminAddToEventForm from '@/components/AdminAddToEventForm';
import EventAttendeeManager from '@/components/EventAttendeeManager';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getEventWithRelations(slug) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              instagramHandle: true,
              firstName: true,
              lastName: true,
              preferredName: true,
              shareFirstName: true,
              isPlaceholder: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });
}

async function getSelectableUsers() {
  return prisma.user.findMany({
    orderBy: [{ isPlaceholder: 'asc' }, { instagramHandle: 'asc' }],
    select: {
      id: true,
      instagramHandle: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      shareFirstName: true,
      isPlaceholder: true
    }
  });
}

export default async function EventAdminPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [event, users] = await Promise.all([
    getEventWithRelations(params.slug),
    getSelectableUsers()
  ]);

  if (!event) {
    notFound();
  }

  const attendees = event.attendees.map((attendee) => ({
    id: attendee.id,
    userId: attendee.user.id,
    user: attendee.user
  }));

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <Link href={`/events/${event.slug}`} className={styles.backLink}>
              ← Back to event
            </Link>
            <h1>Manage “{event.title}”</h1>
          </div>
          <p>Adjust event details and control the guest list from this control room.</p>
        </header>
        <section className={styles.sectionGrid}>
          <div className={styles.card}>
            <h2>Event details</h2>
            <p className={styles.cardIntro}>Update schedule, copy, and palette for this experience.</p>
            <AdminEventForm existingEvent={event} />
          </div>
          <div className={styles.card}>
            <h2>Guest list</h2>
            <p className={styles.cardIntro}>
              Add members or placeholders to this event, or remove attendees as needed.
            </p>
            <AdminAddToEventForm events={[event]} users={users} />
            <EventAttendeeManager eventId={event.id} attendees={attendees} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
