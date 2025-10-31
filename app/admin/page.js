import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AdminEventForm from '@/components/AdminEventForm';
import AdminAddToEventForm from '@/components/AdminAddToEventForm';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import styles from './page.module.css';

async function getAdminData() {
  const [events, users] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startTime: 'asc' }
    }),
    prisma.user.findMany({
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
    })
  ]);
  return { events, users };
}

export const metadata = {
  title: 'Admin | Manchester Gents'
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const { events, users } = await getAdminData();

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.adminMain}>
        <header className={styles.adminHeader}>
          <h1>Admin control room</h1>
          <p>Manage the calendar, color palettes, and guest list access.</p>
          <a href="/admin/members" className={styles.membersLink}>
            View member directory →
          </a>
        </header>
        <section className={styles.adminGrid}>
          <div className={styles.formCard}>
            <span className="heading-font">Create or update an experience</span>
            <AdminEventForm />
          </div>
          <div className={styles.formCard}>
            <AdminAddToEventForm events={events} users={users} />
          </div>
        </section>
        <section className={styles.adminSection}>
          <span className="heading-font">Existing events</span>
          <div className={styles.adminList}>
            {events.map((event) => {
              const startTime = event.startTime ? new Date(event.startTime) : null;
              const schedule = startTime
                ? format(startTime, 'd MMM yyyy • h:mmaaa')
                : 'Schedule TBA';
              return (
              <article key={event.id} className={`${styles.adminEvent} glass-panel`}>
                <div className={styles.adminEventTop}>
                  <div>
                    <h3>{event.title}</h3>
                    <p className={styles.adminEventSlug}>/{event.slug}</p>
                  </div>
                  <span className={styles.adminEventStatus}>
                    {event.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className={styles.adminEventMeta}>{schedule}{event.location ? ` · ${event.location}` : ''}</p>
                <p className={styles.adminEventDescription}>
                  {event.description || 'No description provided yet.'}
                </p>
                <details className={styles.details}>
                  <summary className={styles.summary}>Edit palette</summary>
                  <AdminEventForm existingEvent={event} />
                </details>
              </article>
            );})}
            {events.length === 0 && (
              <div className={`${styles.adminEmpty} glass-panel`}>
                <h3>No events created yet</h3>
                <p>Use the form above to create the first Manchester Gents experience.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
