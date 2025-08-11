import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import EditModeProvider from './profile-edit-mode-wrapper';
import ProfileCompletenessBanner from './profile-completeness-banner';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  return (
    <section className="space-y-6" aria-labelledby="profile-heading">
      <h1 id="profile-heading" className="text-2xl font-bold">My Profile</h1>
      {!session?.user && <p className="text-sm text-[var(--color-text-secondary)]">Please sign in to manage your profile.</p>}
      {session?.user && <ProfileCompletenessBanner />}
  {session?.user && <EditModeProvider />}
    </section>
  );
}
