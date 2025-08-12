"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

type CourseOpt = { code: string; title: string };

type Props = { courseOptions: CourseOpt[]; initialCourseCode?: string };

type Signal = {
  id: string; createdById: string; type: 'INDIVIDUAL'|'GROUP'; courseCode: string; project: string; details?: string|null; membersNeeded?: number|null; status: 'OPEN'|'CLOSED'; createdAt: string;
};

export default function PartnersClient({ courseOptions, initialCourseCode }: Props) {
  const { data: session } = useSession();
  const [type, setType] = useState<'INDIVIDUAL'|'GROUP'>('INDIVIDUAL');
  const [courseCode, setCourseCode] = useState<string>(initialCourseCode || courseOptions[0]?.code || '');
  const [project, setProject] = useState('');
  const [details, setDetails] = useState('');
  const [membersNeeded, setMembersNeeded] = useState(1);
  const [rows, setRows] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [closingId, setClosingId] = useState<string | null>(null);

  const valid = type && courseCode && project.trim().length > 2;

  async function refresh() {
    setLoading(true); setError(undefined);
    try {
      const qs = new URLSearchParams();
      qs.set('status', 'OPEN');
      if (courseCode) qs.set('courseCode', courseCode);
      const res = await fetch(`/api/partners?${qs.toString()}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed');
      setRows(data.rows);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed';
      setError(message);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    // Fetch when course changes
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseCode]);

  // Sync selected course to the URL for deep-linking
  useEffect(() => {
    const url = new URL(window.location.href);
    if (courseCode) {
      url.searchParams.set('course', courseCode);
    } else {
      url.searchParams.delete('course');
    }
    window.history.replaceState({}, '', url.toString());
  }, [courseCode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true); setError(undefined);
    try {
      const res = await fetch('/api/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, courseCode, project, details, membersNeeded: type==='GROUP'?membersNeeded:undefined }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed');
      setProject(''); setDetails(''); if (type==='GROUP') setMembersNeeded(1);
      await refresh();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  async function close(id: string) {
    setClosingId(id); setError(undefined);
    try {
      const res = await fetch(`/api/partners/${id}/close`, { method: 'POST' });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setClosingId(null);
    }
  }

  const grouped = useMemo(() => ({
    INDIVIDUAL: rows.filter(r=> r.type==='INDIVIDUAL'),
    GROUP: rows.filter(r=> r.type==='GROUP')
  }), [rows]);

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-xs">Type</label>
          <div className="inline-flex rounded-md border border-[var(--color-border)] overflow-hidden w-fit">
            <button type="button" onClick={()=>setType('INDIVIDUAL')} className={`px-3 py-1.5 text-xs ${type==='INDIVIDUAL'?'bg-[var(--color-accent)] text-white':'bg-[var(--color-surface-alt)]'}`}>Looking to join</button>
            <button type="button" onClick={()=>setType('GROUP')} className={`px-3 py-1.5 text-xs ${type==='GROUP'?'bg-[var(--color-accent)] text-white':'bg-[var(--color-surface-alt)]'}`}>Group needs member</button>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-xs">Course</label>
          <select value={courseCode} onChange={e=> setCourseCode(e.target.value)} className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]">
            <option value="">All courses</option>
            {courseOptions.map(c => <option key={c.code} value={c.code}>{c.code} · {c.title}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-xs">Project name</label>
          <input value={project} onChange={e=> setProject(e.target.value)} placeholder="e.g., Final Project – CNN for image classification" className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <label className="text-xs">Details (optional)</label>
          <textarea value={details} onChange={e=> setDetails(e.target.value)} rows={3} placeholder="Skills, availability, expectations…" className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] resize-y" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs">Members needed</label>
          <input type="number" min={1} max={5} value={membersNeeded} onChange={e=> setMembersNeeded(Number(e.target.value))} disabled={type!=='GROUP'} className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] disabled:opacity-50" />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={!valid || loading} className="btn-primary text-xs disabled:opacity-50">{loading? 'Posting…':'Post signal'}</button>
        </div>
        {error && <p className="text-[10px] text-[var(--color-error)] md:col-span-3">{error}</p>}
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="text-sm font-semibold mb-3">Individuals looking to join</h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {grouped.INDIVIDUAL.length === 0 && <li className="text-xs text-[var(--color-text-secondary)] py-4">No active signals for this course.</li>}
            {grouped.INDIVIDUAL.map(r => (
              <li key={r.id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono inline-flex items-center gap-2">
                    {r.courseCode}
                    {session?.user?.id === r.createdById && (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] border border-[var(--color-border)]">You</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    {session?.user?.id === r.createdById && (
                      <button
                        type="button"
                        onClick={() => close(r.id)}
                        disabled={closingId === r.id}
                        className="px-2 py-0.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
                        title="Close this signal"
                      >{closingId === r.id ? 'Closing…' : 'Close'}</button>
                    )}
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-medium">{r.project}</div>
                {r.details && <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{r.details}</p>}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="text-sm font-semibold mb-3">Groups needing a member</h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {grouped.GROUP.length === 0 && <li className="text-xs text-[var(--color-text-secondary)] py-4">No active signals for this course.</li>}
            {grouped.GROUP.map(r => (
              <li key={r.id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono inline-flex items-center gap-2">
                    {r.courseCode}
                    {session?.user?.id === r.createdById && (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] border border-[var(--color-border)]">You</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    {session?.user?.id === r.createdById && (
                      <button
                        type="button"
                        onClick={() => close(r.id)}
                        disabled={closingId === r.id}
                        className="px-2 py-0.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
                        title="Close this signal"
                      >{closingId === r.id ? 'Closing…' : 'Close'}</button>
                    )}
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-medium">{r.project}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Members needed: {r.membersNeeded ?? 1}</div>
                {r.details && <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{r.details}</p>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
