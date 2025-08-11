import Link from 'next/link';
import { researchProjects } from '../../lib/mock-data';

export default function ResearchOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Research</h1>
      <p className="text-[var(--color-text-secondary)] max-w-3xl text-sm md:text-base">Snapshot of ongoing student & faculty research activities. Content is mocked; integrate real data sources later.</p>
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Highlighted Projects</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {researchProjects.map(p => (
            <li key={p.slug} className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <h3 className="font-medium mb-1"><Link href={`/research/projects/${p.slug}`} className="hover:text-[var(--color-accent)]">{p.title}</Link></h3>
              <p className="text-[var(--color-text-secondary)] text-xs md:text-sm">{p.blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
