// filepath: /Users/nikolasneofytou/Documents/GitHub/second-version-of-ece-ntua-website/portal/src/app/network/ClientNetwork.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UserProfile } from '../../lib/network';
import { filterProfiles, extractYears, extractInterests } from '../../lib/network';

interface Props {
  initialProfiles: UserProfile[];
}

export default function ClientNetwork({ initialProfiles }: Props) {
  const [q, setQ] = useState('');
  const [year, setYear] = useState<number | undefined>();
  const [interest, setInterest] = useState<string | undefined>();
  const [limit, setLimit] = useState(12);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const years = useMemo(()=> extractYears(initialProfiles), [initialProfiles]);
  const interests = useMemo(()=> extractInterests(initialProfiles), [initialProfiles]);

  const filtered = useMemo(()=> filterProfiles(initialProfiles, { q, year, interest }), [initialProfiles, q, year, interest]);
  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > visible.length;

  // Announce results count
  useEffect(() => {
    const live = document.getElementById('network-results-status');
    if (!live) return;
    const parts: string[] = [];
    if (year) parts.push(`year ${year}`);
    if (interest) parts.push(`interest ${interest}`);
    if (q) parts.push(`search "${q}"`);
    const filterText = parts.length ? ` for ${parts.join(' and ')}` : '';
    live.textContent = filtered.length === 0 ? `No profiles${filterText}.` : `${filtered.length} profile${filtered.length!==1?'s':''} found${filterText}.`;
  }, [filtered, year, interest, q]);

  // Focus management when filters change
  useEffect(() => {
    if (resultsHeadingRef.current) {
      const id = requestAnimationFrame(()=> resultsHeadingRef.current?.focus());
      return ()=> cancelAnimationFrame(id);
    }
  }, [q, year, interest]);

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-4" onSubmit={e=> e.preventDefault()} aria-describedby="network-results-status">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-1 text-xs">
            <span className="sr-only">Search</span>
            <input
              type="text"
              placeholder="Search (name, skill, interest)"
              value={q}
              onChange={e=> { setQ(e.target.value); setLimit(12); }}
              className="px-3 py-1 rounded-sm text-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            />
          </label>
          <label className="text-xs flex items-center gap-1">
            <span>Year</span>
            <select
              value={year ?? ''}
              onChange={e=> { setYear(e.target.value? Number(e.target.value): undefined); setLimit(12); }}
              className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            >
              <option value="">All</option>
              {years.map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="text-xs flex items-center gap-1">
            <span>Interest</span>
            <select
              value={interest ?? ''}
              onChange={e=> { setInterest(e.target.value || undefined); setLimit(12); }}
              className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            >
              <option value="">All</option>
              {interests.map(i=> <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
        </div>
      </form>
      <div id="network-results-status" aria-live="polite" className="text-xs text-[var(--color-text-muted)]" />

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-md p-6">No profiles match your filters.</p>
      )}

      {filtered.length > 0 && (
        <div className="space-y-4">
          <h2 ref={resultsHeadingRef} tabIndex={-1} className="sr-only">Results</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {visible.map(p => (
              <li key={p.id} className="border border-[var(--color-border)] rounded-md p-4 flex flex-col gap-2 hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-border-strong)] transition-colors">
                <article aria-labelledby={`p-${p.id}`}> {/* TODO: add avatar */}
                  <h3 id={`p-${p.id}`} className="font-semibold leading-tight mb-1 text-sm">{p.name}</h3>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)] flex gap-2">
                    <span>Year {p.year}</span>
                    {p.availability && <span className="text-[var(--color-success)]">{p.availability}</span>}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-3">{p.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.interests.map(i=> <span key={i} className="px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[10px] leading-none">{i}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.skills.map(s=> <span key={s} className="px-1 py-0.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] leading-none">{s}</span>)}
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="pt-2">
              <button
                type="button"
                onClick={()=> setLimit(l => l + 12)}
                className="btn-primary text-xs"
              >Load more</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
