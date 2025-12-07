import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import InvalidateSessionsButton from '@/components/InvalidateSessionsButton';
import ComingSoonGateCard from '@/components/ComingSoonGateCard';
import { getComingSoonConfig } from '@/lib/comingSoonConfig';
import styles from './page.module.css';

async function getAdminData() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: 'asc' }
  });
  const comingSoonConfig = await getComingSoonConfig();
  return { events, comingSoonConfig };
}

export const metadata = {
  title: 'Admin | Manchester Gents'
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const { events, comingSoonConfig } = await getAdminData();

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.adminMain}>
        <header className={styles.adminHeader}>
          <h1>Admin control room</h1>
          <p>Manage the calendar and jump into event workspaces for attendee updates.</p>
          <a href="/admin/members" className={styles.membersLink}>
            View member directory →
          </a>
          <a href="/admin/create-event" className={styles.createLink}>
            Create a new event
          </a>
        </header>
        <section className={styles.securitySection}>
          <div className={`${styles.securityCard} glass-panel`}>
            <div className={styles.securityCopy}>
              <span className={styles.securityEyebrow}>Sessions</span>
              <h2>Sign everyone out</h2>
              <p>
                Force every member and admin to log back in. Use if a device is lost or credentials
                are at risk.
              </p>
            </div>
            <InvalidateSessionsButton
              buttonClassName={styles.dangerButton}
              statusClassName={styles.statusText}
              successClassName={styles.statusSuccess}
              errorClassName={styles.statusError}
            />
          </div>
          <ComingSoonGateCard
            initialConfig={{
              enabled: comingSoonConfig?.enabled ?? true,
              disableAt: comingSoonConfig?.disableAt
                ? comingSoonConfig.disableAt.toISOString()
                : null
            }}
          />
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
                  <p className={styles.adminEventMeta}>
                    {schedule}
                    {event.location ? ` · ${event.location}` : ''}
                  </p>
                  <p className={styles.adminEventDescription}>
                    {event.description || 'No description provided yet.'}
                  </p>
                  <div className={styles.adminEventActions}>
                    <a
                      href={`/events/${event.slug}/admin`}
                      className={styles.manageBtn}
                    >
                      Manage event →
                    </a>
                  </div>
                </article>
              );
            })}
            {events.length === 0 && (
              <div className={`${styles.adminEmpty} glass-panel`}>
                <h3>No events created yet</h3>
                <p>Use “Create a new event” above to kick things off.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
