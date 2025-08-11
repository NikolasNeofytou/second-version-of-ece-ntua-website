import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
// Placeholder IEEE provider (not standard) -- will require custom OAuth implementation later.
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || ''
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger }) {
      interface AugUser { id: string; username?: string | null; onboardingCompleted?: boolean }
      if (user) {
        const u = user as AugUser;
        token.id = u.id;
        if ('username' in u && typeof u.username === 'string') token.username = u.username.toLowerCase();
        else if ('username' in u) token.username = null;
        if ('onboardingCompleted' in u) token.onboardingCompleted = !!u.onboardingCompleted;
      } else if (trigger === 'update' && token.id) {
        // Force refresh of DB state
        try {
          const raw = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (raw) {
            const du = raw as unknown as AugUser;
            if ('username' in du && typeof du.username === 'string') token.username = du.username.toLowerCase();
            if ('onboardingCompleted' in du) token.onboardingCompleted = !!du.onboardingCompleted;
          }
        } catch {/* ignore */}
      } else if (token.id && token.onboardingCompleted !== true) {
        try {
          const raw = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (raw) {
            const du = raw as unknown as AugUser;
            if ('username' in du && typeof du.username === 'string') token.username = du.username.toLowerCase();
            if ('onboardingCompleted' in du) token.onboardingCompleted = !!du.onboardingCompleted;
          }
        } catch {/* ignore */}
      }
      return token;
    },
    async session({ session, token }) {
      interface AugToken { id?: string; username?: string | null; onboardingCompleted?: boolean }
      const t = token as AugToken;
      if (session.user) {
        const su = session.user as typeof session.user & { id: string; username?: string | null; onboardingCompleted?: boolean };
        if (t.id) su.id = t.id;
        if ('username' in t) su.username = t.username ?? null;
        if ('onboardingCompleted' in t) su.onboardingCompleted = !!t.onboardingCompleted;
        // Hide email
        if ('email' in su) (su as unknown as { email?: string | undefined }).email = undefined;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      // ensure profile row exists
      const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
      if (!existing) {
        await prisma.profile.create({ data: { userId: user.id } });
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
