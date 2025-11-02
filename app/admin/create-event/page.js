import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AdminEventForm from '@/components/AdminEventForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export const metadata = {
  title: 'Create Event | Manchester Gents'
};

export default async function AdminCreateEventPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Create a new experience</h1>
          <p>Set the schedule, copy, and palette for a fresh Manchester Gents gathering.</p>
        </header>
        <section className={styles.formSection}>
          <AdminEventForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
