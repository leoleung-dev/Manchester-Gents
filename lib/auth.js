import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from './prisma';
import { verifyPassword } from './password';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Instagram username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Missing credentials.');
        }
        const identifier = credentials.identifier.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { instagramHandle: identifier.replace(/^@/, '') }
            ]
          }
        });
        if (!user) {
          throw new Error('Account not found.');
        }
        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Incorrect password.');
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.instagramHandle,
          role: user.role,
          instagramHandle: user.instagramHandle
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.instagramHandle = user.instagramHandle;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.instagramHandle = token.instagramHandle;
        session.user.id = token.id || token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};

export async function requireAuth(role) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (role && session.user.role !== role) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return session;
}
