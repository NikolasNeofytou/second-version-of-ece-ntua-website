"use client";
import { useEffect, useState, useMemo } from 'react';
import Tag from '@/components/Tag';

interface FormState {
  year?: number;
  bio?: string;
  interests: string;
  skills: string;
  visibility: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
}

interface ProfileEditorProps {
  editing: boolean;               // whether the form is visible (edit mode)
  onEditingChange(next: boolean): void; // callback to toggle edit mode
}

export default function ProfileEditor({ editing, onEditingChange }: ProfileEditorProps) {
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
      // Notify other components (e.g., completeness banner) to refresh
      window.dispatchEvent(new Event('profile:saved'));
      // After successful save, collapse edit mode after a short delay so user sees status
      setTimeout(() => onEditingChange(false), 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }
  const interestList = useMemo(() => state.interests.split(',').map(s=>s.trim()).filter(Boolean), [state.interests]);
  const skillList = useMemo(() => state.skills.split(',').map(s=>s.trim()).filter(Boolean), [state.skills]);
  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>;

  if (!editing) {
    return (
      <div className="space-y-6 max-w-3xl" aria-live="polite">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 text-xs">
            <div className="flex gap-4 flex-wrap">
              <div><span className="uppercase tracking-wide text-[10px] text-[var(--color-text-secondary)]">Year</span><p className="font-medium mt-0.5">{state.year ?? '—'}</p></div>
              <div><span className="uppercase tracking-wide text-[10px] text-[var(--color-text-secondary)]">Visibility</span><p className="font-medium mt-0.5">{state.visibility}</p></div>
            </div>
          </div>
          <button onClick={() => onEditingChange(true)} className="btn-primary text-xs self-start">Edit Profile</button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)] md:col-span-2 flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wide">About</h2>
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap min-h-16">{state.bio?.trim() || 'No bio provided yet.'}</p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)] flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wide">Snapshot</h2>
            <ul className="text-[10px] space-y-1 text-[var(--color-text-secondary)]">
              <li>Profile visibility: <span className="font-medium text-[var(--color-text-primary)]">{state.visibility}</span></li>
              <li>Interests: <span className="font-medium text-[var(--color-text-primary)]">{interestList.length}</span></li>
              <li>Skills: <span className="font-medium text-[var(--color-text-primary)]">{skillList.length}</span></li>
            </ul>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">Interests</h2>
            </div>
            <div className="flex flex-wrap gap-2 min-h-10">
              {interestList.length ? interestList.map(i => <Tag key={i} tone="interest">{i}</Tag>) : <span className="text-[10px] text-[var(--color-text-secondary)]">No interests yet.</span>}
            </div>
          </div>
          <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2 min-h-10">
              {skillList.length ? skillList.map(s => <Tag key={s} tone="skill">{s}</Tag>) : <span className="text-[10px] text-[var(--color-text-secondary)]">No skills yet.</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl" aria-describedby="profile-status" noValidate>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Edit Profile</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => onEditingChange(false)} disabled={saving} className="text-xs px-3 py-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-xs disabled:opacity-50">{saving? 'Saving...':'Save'}</button>
        </div>
      </div>
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
        {error && <span className="text-[10px] text-[var(--color-error)]">{error}</span>}
        {statusMsg && <span id="profile-status" className="text-[10px] text-[var(--color-success)]" aria-live="polite">{statusMsg}</span>}
      </div>
    </form>
  );
}
