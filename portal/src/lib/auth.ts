import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
// Placeholder IEEE provider (not standard) -- will require custom OAuth implementation later.
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

// --- Runtime env validation & conditional provider enabling ---
const REQUIRED_BASE = ['NEXTAUTH_SECRET'];
const PROVIDER_VARS: Record<string, string[]> = {
  google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET']
};

function missing(keys: string[]) { return keys.filter(k => !process.env[k]); }

const baseMissing = missing(REQUIRED_BASE);
if (baseMissing.length) {
  console.error('[env][fatal] Missing required auth env vars:', baseMissing.join(', '));
}

interface EnabledProvider { name: string; id: string; }
const enabledProviders: EnabledProvider[] = [];

// Google
if (!missing(PROVIDER_VARS.google).length) {
  enabledProviders.push({ name: 'Google', id: 'google' });
} else {
  console.warn('[env][auth] Google provider disabled. Missing:', missing(PROVIDER_VARS.google).join(', '));
}
// LinkedIn
if (!missing(PROVIDER_VARS.linkedin).length) {
  enabledProviders.push({ name: 'LinkedIn', id: 'linkedin' });
} else {
  console.warn('[env][auth] LinkedIn provider disabled. Missing:', missing(PROVIDER_VARS.linkedin).join(', '));
}

export const authOptions: NextAuthOptions = {
  // Fail fast if required env vars missing (prevents silent provider failure)
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/signin'
  },
  providers: [
    ...(enabledProviders.find(p => p.id === 'google') ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: 'consent', access_type: 'offline', response_type: 'code' } },
      allowDangerousEmailAccountLinking: true // Enables linking to existing user with same email to avoid OAuthCreateAccount (dev convenience)
    })] : []),
    ...(enabledProviders.find(p => p.id === 'linkedin') ? [LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: { params: { scope: 'r_liteprofile r_emailaddress' } }
    })] : [])
  ],
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) { console.error('[auth][error]', code, metadata); },
    warn(code) { console.warn('[auth][warn]', code); },
    debug(code, metadata) { console.log('[auth][debug]', code, metadata); }
  },
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
        if ('email' in su) (su as unknown as { email?: string | undefined }).email = undefined;
      }
      try {
        if (t.id) {
          const existingProfile = await prisma.profile.findUnique({ where: { userId: t.id } });
            if (!existingProfile) {
              await prisma.profile.create({ data: { userId: t.id } });
              console.log('[auth][profile][auto-created]', t.id);
            }
        }
      } catch (e) {
        console.warn('[auth][profile][ensure-failed]', e);
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

// NOTE: Ensure GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET etc. are set in .env before starting dev server.
