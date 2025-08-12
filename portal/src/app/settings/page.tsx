import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { seo } from '../../lib/seo';
export const metadata = seo('Settings', 'Manage account and privacy settings.');

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin?callbackUrl=%2Fsettings');
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Consolidated controls for profile, privacy, and notification preferences will live here. For now edit your profile directly on the Profile page.</p>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Profile Password</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">Optionally set a password required to view your public profile page.</p>
        <form action="/api/profile/view-password" method="post" className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-xs">Password</label>
            <input name="password" type="password" className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" placeholder="Leave blank to clear" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs">Hint (optional)</label>
            <input name="hint" className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" placeholder="E.g., course code or topic" />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary text-xs">Save password</button>
          </div>
        </form>
      </section>
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
