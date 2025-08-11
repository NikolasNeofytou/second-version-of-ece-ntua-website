import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/profile';
import Tag from '@/components/Tag';

interface Params { username: string }

export default async function PublicProfilePage({ params }: { params: Params }) {
  const data = await getProfileByUsername(params.username.toLowerCase());
  if (!data) return notFound();
  const { user, profile } = data;
  if (profile.visibility === 'PRIVATE') return notFound();
  const interests = (profile.interestsVisibility === 'PRIVATE') ? [] : (profile.interests || []);
  const skills = (profile.skillsVisibility === 'PRIVATE') ? [] : (profile.skills || []);
  const showBio = profile.bioVisibility !== 'PRIVATE';
  const showYear = profile.yearVisibility !== 'PRIVATE';
  return (
    <div className="space-y-8 max-w-4xl" aria-labelledby="public-profile-heading">
      <div className="space-y-4">
        <h1 id="public-profile-heading" className="text-2xl font-bold">{user.username || user.name}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
          {showYear && profile.year && <span>Year {profile.year}</span>}
          <span className="capitalize">{(profile.visibility || 'PUBLIC').toLowerCase()}</span>
          <span>{interests.length} interests</span>
          <span>{skills.length} skills</span>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide">About</h2>
            {showBio ? (
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap min-h-16">{profile.bio?.trim() || 'No bio yet.'}</p>
            ) : (
              <p className="text-[10px] text-[var(--color-text-secondary)] italic">Bio is private.</p>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide">Interests</h2>
            <div className="flex flex-wrap gap-2 min-h-10">
              {interests.length ? interests.map((i: string) => <Tag key={i} tone="interest" seed={i}>{i}</Tag>) : <span className="text-[10px] text-[var(--color-text-secondary)]">No interests.</span>}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide">Skills</h2>
            <div className="flex flex-wrap gap-2 min-h-10">
              {skills.length ? skills.map((s: string) => <Tag key={s} tone="skill" seed={s}>{s}</Tag>) : <span className="text-[10px] text-[var(--color-text-secondary)]">No skills.</span>}
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
            <h2 className="text-sm font-semibold tracking-wide mb-2">Snapshot</h2>
            <ul className="text-[10px] space-y-1 text-[var(--color-text-secondary)]">
              {profile.year && <li>Year: <span className="text-[var(--color-text-primary)] font-medium">{profile.year}</span></li>}
              <li>Visibility: <span className="text-[var(--color-text-primary)] font-medium">{profile.visibility}</span></li>
              <li>Interests: <span className="text-[var(--color-text-primary)] font-medium">{interests.length}</span></li>
              <li>Skills: <span className="text-[var(--color-text-primary)] font-medium">{skills.length}</span></li>
              <li>Completeness: <span className="text-[var(--color-text-primary)] font-medium">{profile.completeness}%</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
