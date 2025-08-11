// filepath: /Users/nikolasneofytou/Documents/GitHub/second-version-of-ece-ntua-website/portal/src/app/announcements/ClientAnnouncements.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Announcement, groupByISOWeek } from '../../lib/announcements-utils';

interface Props {
  all: Announcement[]; // already limited to recent timeframe (e.g. 4 weeks)
  selectedCategory?: string;
  query: string; // raw query string from URL (decoded)
}

const INITIAL_WEEKS = 2; // show first N week groups then progressively reveal

export default function ClientAnnouncements({ all, selectedCategory, query }: Props) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [weeksVisible, setWeeksVisible] = useState(INITIAL_WEEKS);
  const prevLenRef = useRef<number>(0);

  const filtered = useMemo(() => {
    let items = all;
    if (selectedCategory) {
      items = items.filter(a => a.category === selectedCategory);
    }
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(a => a.title.toLowerCase().includes(q));
    }
    return items;
  }, [all, selectedCategory, query]);

  const { groups, orderedKeys } = useMemo(() => groupByISOWeek(filtered), [filtered]);
  const visibleKeys = orderedKeys.slice(0, weeksVisible);
  const hasMore = weeksVisible < orderedKeys.length;

  // Update aria-live region with counts
  useEffect(() => {
    const live = document.getElementById('results-status');
    if (!live) return;
    const count = filtered.length;
    const filters: string[] = [];
    if (selectedCategory) filters.push(`category “${selectedCategory}”`);
    if (query) filters.push(`search “${query}”`);
    const filterText = filters.length ? ` for ${filters.join(' and ')}` : '';
    live.textContent = count === 0
      ? `No announcements${filterText}.`
      : `${count} announcement${count!==1? 's':''} shown${filterText}.`;
  }, [filtered, selectedCategory, query]);

  // Focus management: when filters active (category or query) set focus to results heading once.
  useEffect(() => {
    if ((selectedCategory || query) && headingRef.current) {
      // slight delay to ensure paint
      const id = requestAnimationFrame(() => headingRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [selectedCategory, query]);

  // After loading more weeks, move focus to the first newly revealed week heading.
  const newlyRevealedRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (prevLenRef.current && weeksVisible > prevLenRef.current && newlyRevealedRef.current) {
      newlyRevealedRef.current.focus();
    }
    prevLenRef.current = weeksVisible;
  }, [weeksVisible]);

  if (filtered.length === 0) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-md p-6">
        <p className="font-medium mb-1">No results</p>
        <p className="text-xs">Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 ref={headingRef} tabIndex={-1} className="sr-only">Results</h2>
      <ul className="space-y-10" role="list">
        {visibleKeys.map((weekKey, index) => {
          const items = groups[weekKey];
          // Build human label from ISO key
            const [year, w] = weekKey.split('-W');
            const weekLabel = `Week ${Number(w)} – ${year}`;
          return (
            <li key={weekKey} className="space-y-3" aria-labelledby={`wk-${weekKey}`}>
              <h3
                id={`wk-${weekKey}`}
                ref={index === INITIAL_WEEKS ? newlyRevealedRef : null}
                tabIndex={-1}
                className="text-lg font-semibold tracking-tight"
              >{weekLabel}</h3>
              <ul className="space-y-4" role="list">
                {items.map(a => (
                  <li key={a.link} className="border border-[var(--color-border)] rounded-md p-4 hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-border-strong)] transition-colors">
                    <article className="space-y-1" aria-labelledby={`a-${hashId(a.link)}`}> 
                      <h4 id={`a-${hashId(a.link)}`} className="font-medium leading-snug">
                        <a href={a.link} target="_blank" rel="noopener noreferrer" className="underline decoration-transparent hover:decoration-[var(--color-primary)] focus:outline-none focus-visible:underline">
                          {a.title}
                        </a>
                      </h4>
                      <div className="text-xs flex flex-wrap gap-x-2 gap-y-1 text-[var(--color-text-secondary)]">
                        {a.dateObj && <time dateTime={a.dateObj.toISOString().slice(0,10)}>{formatDate(a.dateObj)}</time>}
                        {a.category && <span className="px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">{a.category}</span>}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <div>
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => setWeeksVisible(v => Math.min(v + 2, orderedKeys.length))}
            aria-describedby="results-status"
          >Load more weeks</button>
        </div>
      )}
    </div>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function hashId(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
