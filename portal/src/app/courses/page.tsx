import Link from 'next/link';
// DB-backed listing (falls back to mock data if seeding not yet run)
import { listCourses } from '../../lib/courses';
import { courses as mockCourses } from '../../lib/mock-data';
import { seo } from '../../lib/seo';
export const metadata = seo('Courses', 'Course catalog overview.');

type CourseLike = { code: string; title: string; credits: number; semester: number; type: 'CORE' | 'ELECTIVE' };
export default async function CourseCatalog() {
  let dbCourses: CourseLike[] = [];
  try { dbCourses = await listCourses() as unknown as CourseLike[]; } catch { dbCourses = mockCourses as CourseLike[]; }
  const data: CourseLike[] = dbCourses.length ? dbCourses : (mockCourses as CourseLike[]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Course Catalog</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Mock curriculum subset. Filter / explore; real data and search to come.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Sem</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2">ECTS</th>
            </tr>
          </thead>
          <tbody>
            {data
              .slice()
              .sort((a,b)=> a.semester - b.semester || a.code.localeCompare(b.code))
              .map(c => (
              <tr key={c.code} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)]">
                <td className="py-2 pr-4 font-mono"><Link href={`/courses/${c.code}`} className="hover:text-[var(--color-accent)]">{c.code}</Link></td>
                <td className="py-2 pr-4 max-w-[380px]"><span className="line-clamp-2">{c.title}</span></td>
                <td className="py-2 pr-4">{c.semester}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide border ${c.type === 'CORE' ? 'bg-[var(--color-accent-muted)]/30 border-[var(--color-accent-muted)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-alt)] border-[var(--color-border)]'}`}>{c.type}</span>
                </td>
                <td className="py-2">{c.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
