import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const COMING_SOON_ENABLED = process.env.NEXT_PUBLIC_COMING_SOON !== 'false';

export async function middleware(req) {
  if (!COMING_SOON_ENABLED) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = req.nextUrl;

  const isPublicPath =
    pathname.startsWith('/coming-soon') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/session-version') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/site.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.[^/]+$/.test(pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  let currentSessionVersion = null;
  try {
    const versionUrl = req.nextUrl.clone();
    versionUrl.pathname = '/api/session-version';
    versionUrl.search = '';
    const versionRes = await fetch(versionUrl.toString(), {
      cache: 'no-store',
      headers: { 'x-mg-internal': '1' }
    });
    if (versionRes.ok) {
      const data = await versionRes.json();
      currentSessionVersion = data?.version || null;
    }
  } catch (error) {
    currentSessionVersion = null;
  }

  let token = null;
  if (process.env.NEXTAUTH_SECRET) {
    try {
      token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    } catch (error) {
      // Ignore malformed or stale auth cookies; treat as unauthenticated.
      token = null;
    }
  }

  const hasValidVersion =
    Boolean(token?.sessionVersion) &&
    Boolean(currentSessionVersion) &&
    token.sessionVersion === currentSessionVersion;
  const validToken = hasValidVersion ? token : null;

  const isAdmin = validToken?.role === 'ADMIN';
  const isAdminLoginPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAdminLoginPath && (isAdmin || searchParams.has('admin'))) {
    return NextResponse.next();
  }

  if (isAdmin) {
    return NextResponse.next();
  }

  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/coming-soon';
  redirectUrl.search = '';

  if (searchParams.has('admin')) {
    redirectUrl.searchParams.set('admin', searchParams.get('admin') || '1');
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
