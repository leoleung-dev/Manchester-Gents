'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' }
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Manchester Gents home">
          <Image
            src="/images/Horizontal Logo.svg"
            alt="Manchester Gents"
            width={190}
            height={52}
            priority
            className="brand-image"
          />
        </Link>
        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx('nav-link', pathname === link.href && 'nav-link-active')}
            >
              {link.label}
            </Link>
          ))}
          {userRole === 'ADMIN' && (
            <Link
              href="/admin"
              className={clsx('nav-link', pathname.startsWith('/admin') && 'nav-link-active')}
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="nav-actions">
          {status === 'loading' ? null : session ? (
            <>
              <Link href="/dashboard" className="nav-secondary">
                Dashboard
              </Link>
              <Link href="/profile" className="nav-cta">
                Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="nav-secondary"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-secondary">
                Log in
              </Link>
              <Link href="/register" className="nav-cta">
                Join the Club
              </Link>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 1.25rem 0;
          backdrop-filter: blur(12px);
          background: rgba(11, 19, 33, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nav-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .brand-image {
          height: 48px;
          width: auto;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .nav-link {
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.78;
        }
        .nav-link-active {
          color: var(--color-gold);
          opacity: 1;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-cta {
          padding: 0.55rem 1.4rem;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0c1523;
          background: linear-gradient(135deg, var(--color-gold), var(--color-amber));
          box-shadow: 0 12px 22px rgba(255, 212, 96, 0.32);
        }
        .nav-secondary {
          padding: 0.55rem 1.4rem;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-gold);
          background: rgba(30, 46, 70, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        @media (max-width: 768px) {
          .nav-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .nav-actions {
            align-self: stretch;
            justify-content: space-between;
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
}
