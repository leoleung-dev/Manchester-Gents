import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { getDisplayName } from '@/lib/displayName';
import AdminPlaceholderForm from '@/components/AdminPlaceholderForm';
import styles from './members.module.css';

async function getMembers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      instagramHandle: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      shareFirstName: true,
      email: true,
      phoneNumber: true,
      profilePhotoUrl: true,
      profilePhotoOriginalUrl: true,
      generalPhotoConsent: true,
      groupFaceConsent: true,
      otherFaceConsent: true,
      taggingConsent: true,
      createdAt: true,
      isPlaceholder: true
    }
  });
}

export const metadata = {
  title: 'Members | Manchester Gents Admin'
};

export default async function AdminMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const members = await getMembers();

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Member directory</h1>
          <p>Review all registered gents, their consent preferences, and private reference photos.</p>
        </header>
        <section className={styles.placeholderSection}>
          <AdminPlaceholderForm />
        </section>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Instagram</th>
                <th>Contact</th>
                <th>Photo consent</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const displayName = getDisplayName({
                  firstName: member.firstName,
                  lastName: member.lastName,
                  preferredName: member.preferredName,
                  shareFirstName: member.shareFirstName,
                  instagramHandle: member.instagramHandle
                });
                return (
                  <tr key={member.id}>
                    <td className={styles.avatarCell}>
                      {member.profilePhotoUrl ? (
                        <Image
                          src={member.profilePhotoUrl}
                          alt={`Reference for ${displayName}`}
                          width={56}
                          height={56}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>{displayName.charAt(0) || '?'}</div>
                      )}
                    </td>
                    <td>
                      <div className={styles.nameBlock}>
                        <span className={styles.name}>{displayName}</span>
                        <div className={styles.metaRow}>
                          <span className={styles.subtle}>
                            {member.shareFirstName ? 'Sharing first name' : 'Prefers alias'}
                          </span>
                          {member.isPlaceholder && (
                            <span className={styles.placeholderBadge}>Placeholder</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.handleBlock}>
                        <span>@{member.instagramHandle}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactBlock}>
                        <span>{member.email}</span>
                        {member.phoneNumber && <span className={styles.subtle}>{member.phoneNumber}</span>}
                      </div>
                    </td>
                    <td>
                      <ul className={styles.consentList}>
                        <li>General photos: {member.generalPhotoConsent ? 'Yes' : 'No'}</li>
                        <li>Group face: {member.groupFaceConsent ? 'Yes' : 'No'}</li>
                        <li>Other face: {member.otherFaceConsent ? 'Yes' : 'No'}</li>
                        <li>Tagging: {member.taggingConsent ? 'Yes' : 'No'}</li>
                      </ul>
                    </td>
                    <td>{new Date(member.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
