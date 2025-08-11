"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { computeProfileCompleteness } from '@/lib/profile';

interface ProfileData { year?: number | null; bio?: string | null; interests?: string[]; skills?: string[]; visibility?: string; avatarUrl?: string | null; bannerUrl?: string | null }

export default function ProfileCompletenessBanner() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      setProfile(data.profile || null);
    } catch {/* ignore */}
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  // Listen for custom event dispatched after profile save to refresh completeness
  useEffect(() => {
    function handler() { load(); }
    window.addEventListener('profile:saved', handler);
    return () => window.removeEventListener('profile:saved', handler);
  }, []);

  if (!session?.user) return null;
  if (loading) return null;
  const completeness = computeProfileCompleteness({
    username: session.user.username,
    year: profile?.year ?? null,
    bio: profile?.bio ?? null,
    interests: profile?.interests,
    skills: profile?.skills,
    avatarUrl: profile?.avatarUrl ?? null,
    bannerUrl: profile?.bannerUrl ?? null
  });
  if (completeness === 100) return null;

  const missing: string[] = [];
  if (!(session.user.username)) missing.push('username');
  if (!profile?.year) missing.push('year');
  if (!(profile?.bio && profile.bio.trim())) missing.push('bio');
  if (!(profile?.interests && profile.interests.length)) missing.push('interests');
  if (!(profile?.skills && profile.skills.length)) missing.push('skills');
  if (!(profile?.avatarUrl)) missing.push('avatar');
  if (!(profile?.bannerUrl)) missing.push('banner');

  function openEdit() {
    window.dispatchEvent(new Event('profile:request-edit'));
  }

  return (
    <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 text-xs flex flex-col gap-2" aria-live="polite">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Profile completeness: {completeness}%</span>
          <div className="h-2 w-40 bg-[var(--color-border)] rounded overflow-hidden">
            <div className="h-full bg-[var(--color-accent)]" style={{ width: `${completeness}%` }} />
          </div>
        </div>
        <button onClick={openEdit} className="text-[10px] px-2 py-1 rounded-sm border border-[var(--color-border)] hover:bg-[var(--color-surface)]">Edit now</button>
      </div>
      {missing.length > 0 && (
        <p className="text-[10px] text-[var(--color-text-secondary)]">Add: {missing.join(', ')}</p>
      )}
    </div>
  );
}
