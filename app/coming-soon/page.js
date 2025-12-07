import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Coming Soon | Manchester Gents',
  description: 'The new Manchester Gents site is nearly ready. Watch Instagram for the announcement.'
};

export default function ComingSoonPage({ searchParams }) {
  const showAdminAccess = searchParams?.admin !== undefined;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Manchester Gents</p>
        <h1>New site coming soon</h1>
        <p className={styles.body}>
          We&apos;re putting the finishing touches on the new Manchester Gents experience. Stay
          tuned for our Instagram announcement.
        </p>
        <div className={styles.actions}>
          <Link
            href="https://www.instagram.com"
            className={styles.cta}
            target="_blank"
            rel="noreferrer"
          >
            Follow on Instagram
          </Link>
        </div>
      </div>

      {showAdminAccess && (
        <div className={styles.adminPanel}>
          <p className={styles.adminLabel}>Admin access</p>
          <p className={styles.adminHelp}>
            Use the admin login to preview the full site and disable the coming-soon gate.
          </p>
          <Link href="/login?admin=1" className={styles.adminLink}>
            Go to admin login
          </Link>
        </div>
      )}
    </main>
  );
}
