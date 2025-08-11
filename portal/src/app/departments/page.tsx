import Link from 'next/link';
import { departments } from '../../lib/mock-data';
import { seo } from '../../lib/seo';
export const metadata = seo('Departments', 'Academic departments overview.');

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Departments</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Explore academic focus areas. Each department entry links to a detail placeholder.</p>
      <ul className="grid gap-4 md:grid-cols-2">
        {departments.map(d => (
          <li key={d.slug} className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <h2 className="font-medium mb-1"><Link href={`/departments/${d.slug}`} className="hover:text-[var(--color-accent)]">{d.name}</Link></h2>
            <p className="text-[var(--color-text-secondary)] text-xs md:text-sm">{d.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
