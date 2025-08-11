"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { computeProfileCompleteness } from '@/lib/profile';

interface ProfileData { year?: number | null; bio?: string | null; interests?: string[]; skills?: string[]; visibility?: string }

export default function ProfileCompletenessBanner() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        if (active) setProfile(data.profile || null);
      } catch {/* ignore */}
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  if (!session?.user) return null;
  if (loading) return null;
  const completeness = computeProfileCompleteness({
    username: session.user.username,
    year: profile?.year ?? null,
    bio: profile?.bio ?? null,
    interests: profile?.interests,
    skills: profile?.skills
  });
  if (completeness === 100) return null;

  const missing: string[] = [];
  if (!(session.user.username)) missing.push('username');
  if (!profile?.year) missing.push('year');
  if (!(profile?.bio && profile.bio.trim())) missing.push('bio');
  if (!(profile?.interests && profile.interests.length)) missing.push('interests');
  if (!(profile?.skills && profile.skills.length)) missing.push('skills');

  return (
    <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 text-xs flex flex-col gap-2" aria-live="polite">
      <div className="flex justify-between items-center">
        <span className="font-medium">Profile completeness: {completeness}%</span>
        <div className="h-2 w-40 bg-[var(--color-border)] rounded overflow-hidden">
          <div className="h-full bg-[var(--color-accent)]" style={{ width: `${completeness}%` }} />
        </div>
      </div>
      {missing.length > 0 && (
        <p className="text-[10px] text-[var(--color-text-secondary)]">Add: {missing.join(', ')}</p>
      )}
    </div>
  );
}
