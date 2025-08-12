"use client";
import { useEffect, useState } from 'react';

interface FormState {
  year?: number;
  bio?: string;
  interests: string;
  skills: string;
  visibility: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
}

export default function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>({ interests: '', skills: '', visibility: 'PUBLIC' });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (active && data.profile) {
          setState({
            year: data.profile.year ?? undefined,
            bio: data.profile.bio ?? '',
            interests: (data.profile.interests || []).join(', '),
            skills: (data.profile.skills || []).join(', '),
            visibility: data.profile.visibility || 'PUBLIC'
          });
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setStatusMsg('');
    try {
      const payload = {
        year: state.year ? Number(state.year) : undefined,
        bio: state.bio?.trim() || undefined,
        interests: state.interests.split(',').map(s=>s.trim()).filter(Boolean),
        skills: state.skills.split(',').map(s=>s.trim()).filter(Boolean),
        visibility: state.visibility
      };
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setStatusMsg('Saved');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>;

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl" aria-describedby="profile-status" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span>Year</span>
            <input type="number" min={1} max={10} value={state.year ?? ''} onChange={e=> setState(s=> ({...s, year: e.target.value? Number(e.target.value): undefined}))} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Visibility</span>
          <select value={state.visibility} onChange={e=> setState(s=> ({...s, visibility: e.target.value as 'PUBLIC' | 'STUDENTS' | 'PRIVATE'}))} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]">
            <option value="PUBLIC">Public</option>
            <option value="STUDENTS">Students</option>
            <option value="PRIVATE">Private</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs">
        <span>Bio</span>
        <textarea value={state.bio} onChange={e=> setState(s=> ({...s, bio: e.target.value}))} rows={4} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] resize-y" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Interests (comma separated)</span>
        <input value={state.interests} onChange={e=> setState(s=> ({...s, interests: e.target.value}))} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Skills (comma separated)</span>
        <input value={state.skills} onChange={e=> setState(s=> ({...s, skills: e.target.value}))} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary text-xs disabled:opacity-50">{saving? 'Saving...':'Save'}</button>
        {error && <span className="text-[10px] text-[var(--color-error)]">{error}</span>}
        {statusMsg && <span id="profile-status" className="text-[10px] text-[var(--color-success)]" aria-live="polite">{statusMsg}</span>}
      </div>
    </form>
  );
}
