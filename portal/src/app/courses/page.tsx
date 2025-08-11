import Link from 'next/link';
import { courses } from '../../lib/mock-data';

export default function CourseCatalog() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Course Catalog</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Lightweight mock listing. Replace with real syllabus integration later.</p>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
            <th className="py-2 pr-4">Code</th>
            <th className="py-2 pr-4">Title</th>
            <th className="py-2">Credits</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.code} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)]">
              <td className="py-2 pr-4 font-mono"><Link href={`/courses/${c.code}`} className="hover:text-[var(--color-accent)]">{c.code}</Link></td>
              <td className="py-2 pr-4">{c.title}</td>
              <td className="py-2">{c.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
