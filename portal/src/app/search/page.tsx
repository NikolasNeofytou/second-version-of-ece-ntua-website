'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function GlobalSearchPage() {
  const [q, setQ] = useState('');
  const stub = [
    { type: 'Announcement', title: 'Exam period schedule posted', href: '/announcements' },
    { type: 'Course', title: 'ECE220 Data Structures', href: '/courses/ECE220' },
    { type: 'Profile', title: 'jdoe', href: '/u/jdoe' },
  ];
  const results = q ? stub.filter(s => s.title.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <div>
        <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search (mock) announcements, courses, profiles..." className="w-full px-3 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-sm" />
      </div>
      <ul className="space-y-2 text-sm">
        {results.map(r => (
          <li key={r.href} className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <span className="text-[var(--color-text-secondary)] text-[10px] uppercase tracking-wide">{r.type}</span><br />
            <Link href={r.href} className="hover:text-[var(--color-accent)] font-medium">{r.title}</Link>
          </li>
        ))}
        {q && results.length === 0 && <li className="text-[var(--color-text-secondary)] text-xs">No matches (mock dataset).</li>}
      </ul>
      <p className="text-[var(--color-text-secondary)] text-xs">(Placeholder) Replace with unified search indexing (e.g. Postgres full-text, Meilisearch, or Elastic) later.</p>
    </div>
  );
}
