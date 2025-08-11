import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin?callbackUrl=%2Fsettings');
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Consolidated controls for profile, privacy, and notification preferences will live here. For now edit your profile directly on the Profile page.</p>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Security</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">(Placeholder) Add sessions management, connected OAuth providers, passwordless options.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Privacy</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">Field-level visibility already exists in profile editor; unify policies here later.</p>
      </section>
    </div>
  );
}
