import { notFound } from 'next/navigation';
import { courses as mockCourses, Course as MockCourse } from '../../../lib/mock-data';
import { getCourseByCode } from '../../../lib/courses';
import { seo } from '../../../lib/seo';

interface Props { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props) {
  const p = await params;
  let course = mockCourses.find(c => c.code === p.code) as MockCourse | undefined;
  try { const db = await getCourseByCode(p.code); if (db) {
    course = { ...db, prerequisites: db.prerequisites, instructors: db.instructors, outcomes: db.outcomes } as unknown as MockCourse;
  }} catch {}
  if (!course) return {};
  return seo(
    `${course.code} ${course.title}`,
    `Semester ${course.semester} · ${course.credits} ECTS · ${course.type}`,
    { type: 'generic', titleOverride: `${course.code} ${course.title}`, subtitle: `${course.credits} ECTS · Sem ${course.semester}` }
  );
}

export default async function CourseDetail({ params }: Props) {
  const p = await params;
  let course = mockCourses.find(c => c.code === p.code) as MockCourse | undefined;
  try { const db = await getCourseByCode(p.code); if (db) { const mapped: MockCourse = {
      code: db.code,
      title: db.title,
      credits: db.credits,
      semester: db.semester,
      type: db.type as 'CORE' | 'ELECTIVE',
      prerequisites: db.prerequisites as string[],
      instructors: db.instructors as string[],
      description: db.description,
      outcomes: db.outcomes as string[]
    }; course = mapped; } } catch {}
  if (!course) return notFound();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{course.code}: {course.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <span className="font-mono">Sem {course.semester}</span>
          <span>{course.credits} ECTS</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide border ${course.type === 'CORE' ? 'bg-[var(--color-accent-muted)]/30 border-[var(--color-accent-muted)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-alt)] border-[var(--color-border)]'}`}>{course.type}</span>
        </div>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Description</h2>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-prose">{course.description}</p>
      </section>
      {course.prerequisites.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Prerequisites</h2>
          <ul className="list-disc pl-5 text-sm text-[var(--color-text-secondary)] space-y-1">
            {course.prerequisites.map(p => <li key={p}><a href={`/courses/${p}`} className="hover:text-[var(--color-accent)] font-mono">{p}</a></li>)}
          </ul>
        </section>
      )}
      {course.outcomes.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Learning Outcomes</h2>
          <ul className="list-disc pl-5 text-sm text-[var(--color-text-secondary)] space-y-1 max-w-prose">
            {course.outcomes.map(o => <li key={o}>{o}</li>)}
          </ul>
        </section>
      )}
      {course.instructors.length > 0 && (
        <section className="space-y-1">
          <h2 className="text-xl font-medium">Instructors</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{course.instructors.join(', ')}</p>
        </section>
      )}
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Planned Enhancements</h2>
        <ul className="list-disc pl-5 text-sm text-[var(--color-text-secondary)] space-y-1">
          <li>Weekly schedule integration (ICS)</li>
          <li>Assessment breakdown & weighting</li>
          <li>Recommended past exam papers</li>
          <li>Related research projects & labs</li>
          <li>Enrollment & capacity stats</li>
        </ul>
      </section>
    </div>
  );
}
