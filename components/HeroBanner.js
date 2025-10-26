'use client';

import Link from 'next/link';
import CountdownTimer from './CountdownTimer';
import EventThemeSection from './EventThemeSection';

export default function HeroBanner({ event }) {
  if (!event) {
    return (
      <div className="hero-empty glass-panel">
        <div className="hero-empty-content">
          <h1>Manchester Gents</h1>
          <p>
            A relaxed social for suited gents at The Lodge. No agenda — just sharp tailoring, good
            drinks, and easy conversation with like-minded company.
          </p>
          <Link href="/register" className="primary-cta">
            Become a member
          </Link>
        </div>
        <style jsx>{`
          .hero-empty {
            padding: 3.5rem 2.5rem;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(255, 212, 96, 0.15), rgba(13, 22, 35, 0.9));
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .hero-empty-content {
            max-width: 540px;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .primary-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            padding: 0.9rem 2rem;
            border-radius: 999px;
            font-size: 0.9rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            font-weight: 700;
            background: linear-gradient(120deg, var(--color-gold), var(--color-amber));
            color: #0f1727;
            box-shadow: 0 20px 32px rgba(255, 212, 96, 0.25);
          }
        `}</style>
      </div>
    );
  }

  return (
    <EventThemeSection
      palette={{
        primaryColor: event.primaryColor,
        accentColor: event.accentColor,
        backgroundColor: event.backgroundColor,
        textColor: event.textColor
      }}
    >
      <div className="hero-grid">
        <div className="hero-info">
          <span className="hero-tag heading-font">Next Event</span>
          <h1>{event.title}</h1>
          {event.subtitle && <p className="hero-subtitle">{event.subtitle}</p>}
          {event.description && <p className="hero-description">{event.description}</p>}
          <Link href={`/events/${event.slug}`} className="hero-link">
            Explore the experience →
          </Link>
        </div>
        <div className="hero-countdown">
          <CountdownTimer startTime={event.startTime} />
        </div>
      </div>
      <style jsx>{`
        .hero-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 2.5rem;
        }
        .hero-info {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .hero-tag {
          font-size: 0.8rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--event-accent);
        }
        .hero-subtitle {
          margin: 0;
          font-weight: 600;
          opacity: 0.85;
        }
        .hero-description {
          margin: 0;
          opacity: 0.75;
          line-height: 1.6;
        }
        .hero-link {
          margin-top: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.8rem;
          color: var(--event-accent);
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </EventThemeSection>
  );
}
