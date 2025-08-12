import { requireAuth } from '@/lib/require-auth';
import PartnersClient from './partners-client';
import { listCourses } from '@/lib/courses';

export const revalidate = 0;

export default async function LabPartners({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAuth('/lab-partners');
  const sp = await searchParams;
  const courses = await listCourses();
  const courseOptions = courses.map(c => ({ code: c.code, title: c.title })).sort((a,b)=> a.code.localeCompare(b.code));
  const initialCourse = typeof sp.course === 'string' ? sp.course : undefined;
  return (
    <section className="space-y-6" aria-labelledby="lp-heading">
      <div className="space-y-2">
        <h1 id="lp-heading" className="text-2xl font-bold">Find a Lab Partner</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Post a signal to join a group or invite someone to your group for a specific course project.</p>
      </div>
      <PartnersClient courseOptions={courseOptions} initialCourseCode={initialCourse} />
    </section>
  );
}
