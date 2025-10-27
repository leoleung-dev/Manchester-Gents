import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import EventThemeSection from '@/components/EventThemeSection';
import EventSignupButton from '@/components/EventSignupButton';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getDisplayName } from '@/lib/displayName';
import styles from './page.module.css';

async function getEvent(slug) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      attendees: {
        include: {
          user: {
            select: {
              instagramHandle: true,
              firstName: true,
              lastName: true,
              preferredName: true,
              shareFirstName: true
            }
          }
        }
      }
    }
  });
}

export async function generateMetadata({ params }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true }
  });
  if (!event) {
    return { title: 'Event not found | Manchester Gents' };
  }
  return {
    title: `${event.title} | Manchester Gents`,
    description: event.description
  };
}

export default async function EventDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const event = await getEvent(params.slug);

  if (!event || !event.published) {
    notFound();
  }

  const existingSignup = session
    ? event.attendees.find((signup) => signup.userId === session.user.id)
    : null;

  const schedule = event.startTime
    ? format(new Date(event.startTime), 'EEEE, MMMM d') +
      ' · ' +
      format(new Date(event.startTime), 'h:mmaaa')
    : 'Date to be confirmed';

  const palette = {
    primaryColor: event.primaryColor,
    accentColor: event.accentColor,
    backgroundColor: event.backgroundColor,
    textColor: event.textColor
  };

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.eventMain}>
        <EventThemeSection palette={palette}>
          <div className={styles.eventGrid}>
            <div className={styles.eventInfo}>
              <span className={`heading-font ${styles.eventTag}`}>Manchester Gents Presents</span>
              <h1>{event.title}</h1>
              {event.subtitle && <p className={styles.eventSubtitle}>{event.subtitle}</p>}
              <p className={styles.eventSchedule}>{schedule}</p>
              {event.location && <p className={styles.eventLocation}>{event.location}</p>}
              {event.description && <p className={styles.eventBody}>{event.description}</p>}
              <EventSignupButton
                eventId={event.id}
                deadline={event.signupDeadline}
                existingSignup={existingSignup}
              />
            </div>
            <aside className={`${styles.eventSidebar} glass-panel`}>
              <div className={styles.sidebarSection}>
                <span className="heading-font">Palette preview</span>
                <div className={styles.paletteGrid}>
                  {['primaryColor', 'secondaryColor', 'accentColor'].map((key) => (
                    <div
                      key={key}
                      className={styles.paletteSwatch}
                      style={{ background: event[key] || 'var(--color-slate)' }}
                    >
                      <span>{event[key] || 'Default'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.sidebarSection}>
                <span className="heading-font">Guest list</span>
                <ul className={styles.guestList}>
                  {event.attendees.slice(0, 10).map((signup) => {
                    const displayName = getDisplayName({
                      ...signup.user,
                      instagramHandle: signup.user.instagramHandle
                    });
                    return (
                      <li key={signup.id}>
                        {displayName || `@${signup.user.instagramHandle}`}
                        {displayName && ` · @${signup.user.instagramHandle}`}
                      </li>
                    );
                  })}
                  {event.attendees.length === 0 && <li>Be the first to join.</li>}
                </ul>
              </div>
            </aside>
          </div>
        </EventThemeSection>
      </main>
      <Footer />
    </div>
  );
}
