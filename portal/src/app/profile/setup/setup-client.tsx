"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props { initialUsername: string; }

export default function SetupClient({ initialUsername }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!username || username.length < 3) { setAvailable(null); return; }
    let active = true;
    setChecking(true); setAvailable(null);
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/profile/username/availability?u=${encodeURIComponent(username)}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (active) setAvailable(Boolean(data.available));
      } catch {
        if (active) setAvailable(null);
      } finally { if (active) setChecking(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/profile/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      // Refresh session/token silently then navigate
      try { await update(); } catch {/* ignore */}
      router.replace('/profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <label className="flex flex-col gap-1 text-xs max-w-xs">
        <span>Choose a username</span>
        <input value={username} onChange={e=> setUsername(e.target.value.trim())} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" required />
        <span className="text-[10px] text-[var(--color-text-secondary)]">3-30 chars, letters, numbers, underscore.</span>
      </label>
      <div className="text-[10px] min-h-[1rem]">
        {checking && <span className="text-[var(--color-text-secondary)]">Checking...</span>}
        {!checking && available === true && <span className="text-[var(--color-success)]">Available</span>}
        {!checking && available === false && <span className="text-[var(--color-error)]">Taken</span>}
      </div>
      <button type="submit" disabled={submitting || !available} className="btn-primary text-xs disabled:opacity-50">{submitting? 'Submitting...':'Finish'}</button>
      {error && <p className="text-[10px] text-[var(--color-error)]">{error}</p>}
    </form>
  );
}
