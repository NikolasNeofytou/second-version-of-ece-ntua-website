import { notFound } from 'next/navigation';
import { courses } from '../../../lib/mock-data';

interface Props { params: { code: string } }

export default function CourseDetail({ params }: Props) {
  const course = courses.find(c => c.code === params.code);
  if (!course) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{course.code}: {course.title}</h1>
      <p className="text-[var(--color-text-secondary)] text-sm">Credits: {course.credits}</p>
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Overview</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">(Placeholder) Provide syllabus summary, learning outcomes, prerequisites, assessment breakdown.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Next Steps</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">Integrate ICS schedule, enrollment stats, recommended past papers.</p>
      </section>
    </div>
  );
}
