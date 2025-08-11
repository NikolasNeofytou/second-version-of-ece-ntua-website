import Link from 'next/link';
import { faculty } from '../../lib/mock-data';
import { seo } from '../../lib/seo';
export const metadata = seo('Faculty', 'Faculty directory.');

export default function FacultyDirectory() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Faculty Directory</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Public, lightweight directory. Link out to public student/faculty profile once unified.</p>
      <ul className="grid gap-4 md:grid-cols-2">
        {faculty.map(f => (
          <li key={f.username} className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <h2 className="font-medium"><Link href={`/faculty/${f.username}`} className="hover:text-[var(--color-accent)]">{f.name}</Link></h2>
            <p className="text-[var(--color-text-secondary)] text-xs">{f.title} – {f.department}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
