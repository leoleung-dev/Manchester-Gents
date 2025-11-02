import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FaCamera } from 'react-icons/fa';
import { FaPeopleGroup, FaPerson, FaUserTag } from 'react-icons/fa6';
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
  const consentColumns = [
    { key: 'generalPhotoConsent', Icon: FaCamera, label: 'General' },
    { key: 'groupFaceConsent', Icon: FaPeopleGroup, label: 'Group' },
    { key: 'otherFaceConsent', Icon: FaPerson, label: 'Other' },
    { key: 'taggingConsent', Icon: FaUserTag, label: 'Tagging' }
  ];

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
                <th>Member</th>
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
                const slug = member.instagramHandle || member.id;
                return (
                  <tr key={member.id}>
                    <td className={styles.avatarCell} data-label="Profile">
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
                    <td className={styles.nameCell} data-label="Member">
                      <Link href={`/admin/members/${slug}`} className={styles.nameLink}>
                        <span className={styles.name}>{displayName}</span>
                        <span className={styles.handle}>
                          @{member.instagramHandle || 'no-instagram'}
                        </span>
                        <span className={styles.subtle}>
                          {member.shareFirstName ? 'Shares first name' : 'Prefers alias'}
                        </span>
                        {member.isPlaceholder && (
                          <span className={styles.placeholderBadge}>Placeholder</span>
                        )}
                      </Link>
                    </td>
                    <td data-label="Contact">
                      <div className={styles.contactBlock}>
                        <span>{member.email}</span>
                        {member.phoneNumber && <span className={styles.subtle}>{member.phoneNumber}</span>}
                      </div>
                    </td>
                    <td data-label="Photo consent">
                      <div className={styles.consentRow}>
                        {consentColumns.map(({ key, Icon, label }) => {
                          const value = member[key];
                          return (
                            <span
                              key={key}
                              className={`${styles.consentPill} ${value ? styles.consentYes : styles.consentNo}`}
                              title={`${label}: ${value ? 'Yes' : 'No'}`}
                            >
                              <Icon aria-hidden className={styles.consentIcon} />
                              <span>{value ? 'Yes' : 'No'}</span>
                              <span className={styles.srOnly}>{`${label}: ${value ? 'Yes' : 'No'}`}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td data-label="Joined">{new Date(member.createdAt).toLocaleDateString('en-GB')}</td>
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
