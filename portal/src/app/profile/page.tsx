import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import EditModeProvider from './profile-edit-mode-wrapper';
import ProfileCompletenessBanner from './profile-completeness-banner';
import { prisma } from '@/lib/prisma';
import { BackgroundProvider } from '@/components/BackgroundProvider';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  let storedPlan: { selected?: string[]; trackId?: string } | null = null;
  if (session?.user?.id) {
    try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { degreePlanJson: true } as any });
      if (profile?.degreePlanJson) {
        try { storedPlan = JSON.parse(profile.degreePlanJson); } catch {}
      }
    } catch {}
  }
  return (
    <BackgroundProvider variant="subtle">
      <section className="space-y-6" aria-labelledby="profile-heading">
        <h1 id="profile-heading" className="text-2xl font-bold">My Profile</h1>
        {!session?.user && <p className="text-sm text-[var(--color-text-secondary)]">Please sign in to manage your profile.</p>}
        {session?.user && <ProfileCompletenessBanner />}
        {session?.user && <EditModeProvider />}
        {session?.user && storedPlan && (
          <div className="p-4 border rounded-md border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 space-y-2">
            <h2 className="text-lg font-semibold">Saved Degree Plan</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Snapshot of your last saved selection in the Degree Planner.</p>
            <div className="text-xs space-y-1">
              <div><span className="font-medium">Track:</span> {storedPlan.trackId || '—'}</div>
              <div><span className="font-medium">Courses ({storedPlan.selected?.length || 0}):</span></div>
              <div className="max-h-40 overflow-y-auto font-mono text-[10px] leading-snug whitespace-pre-wrap break-words">
                {(storedPlan.selected || []).join(', ')}
              </div>
            </div>
            <details className="mt-2 group">
              <summary className="cursor-pointer text-xs underline">Raw JSON</summary>
              <pre className="mt-2 text-[10px] bg-[var(--color-surface)] p-2 rounded overflow-x-auto">{JSON.stringify(storedPlan, null, 2)}</pre>
            </details>
          </div>
        )}
      </section>
    </BackgroundProvider>
  );
}
