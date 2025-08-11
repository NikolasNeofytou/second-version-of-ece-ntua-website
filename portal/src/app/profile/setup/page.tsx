import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SetupClient from './setup-client';

export default async function ProfileSetupPage() {
  const session = await getServerSession(authOptions);
  return (
    <section className="space-y-6 max-w-xl" aria-labelledby="setup-heading">
      <h1 id="setup-heading" className="text-2xl font-bold">Complete Your Profile</h1>
      {!session?.user && <p className="text-sm text-[var(--color-text-secondary)]">Sign in first.</p>}
      {session?.user && <SetupClient initialUsername={session.user.username || ''} />}
    </section>
  );
}
