import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AdminEventForm from '@/components/AdminEventForm';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

async function getAdminData() {
  return prisma.event.findMany({
    orderBy: { startTime: 'desc' }
  });
}

export const metadata = {
  title: 'Admin | Manchester Gents'
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const events = await getAdminData();

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
        <section className={styles.adminSection}>
          <span className="heading-font">Create or update an experience</span>
          <AdminEventForm />
        </section>
        <section className={styles.adminSection}>
          <span className="heading-font">Existing events</span>
          <div className={styles.adminList}>
            {events.map((event) => (
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
                <p className={styles.adminEventDescription}>{event.description}</p>
                <details className={styles.details}>
                  <summary className={styles.summary}>Edit palette</summary>
                  <AdminEventForm existingEvent={event} />
                </details>
              </article>
            ))}
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
