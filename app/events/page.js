import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import prisma from '@/lib/prisma';
import styles from './page.module.css';

async function getEvents() {
  return prisma.event.findMany({
    where: { published: true },
    orderBy: { startTime: 'desc' }
  });
}

export const metadata = {
  title: 'Events | Manchester Gents'
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.eventsMain}>
        <header className={styles.eventsHero}>
          <span className="heading-font">Our socials</span>
          <h1>Relaxed evenings at The Lodge</h1>
          <p>
            Explore upcoming meetups for suited gents in Manchester. Each social is informal — just
            drinks, conversation, and the option to keep the night going afterwards.
          </p>
        </header>
        <div className={styles.eventsList}>
          {events.length === 0 ? (
            <div className={`${styles.noEvents} glass-panel`}>
              <h3>No socials announced yet</h3>
              <p>Check back soon or follow us on Instagram for the next Lodge meetup.</p>
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
