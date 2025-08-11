import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser { id: string; username?: string | null; onboardingCompleted?: boolean }
  interface Session {
    user?: DefaultSession['user'] & { id: string; username?: string | null; onboardingCompleted?: boolean };
  }
}
