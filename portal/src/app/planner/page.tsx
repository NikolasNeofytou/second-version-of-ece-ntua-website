import { listCourses } from '../../lib/courses';
import { seo } from '../../lib/seo';
import { DegreePlanner } from './DegreePlanner';

export const metadata = seo('Integrated Master Planner', 'Plan your path through the integrated master with rule validation & exports.');

export default async function PlannerPage() {
  const courses = await listCourses();
  const plannerCourses = courses.map(c => ({
    code: c.code,
    title: c.title,
    credits: c.credits,
    semester: c.semester,
    type: c.type,
    prerequisites: c.prerequisites || []
  }));
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Integrated Master Degree Planner</h1>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-3xl">Interactive tool to build a coherent study plan aligned with program regulations. Adjust the rule configuration file to reflect official requirements, select courses, validate prerequisites & credit thresholds, then export your plan for offline reference.</p>
      </header>
      <DegreePlanner courses={plannerCourses} />
    </main>
  );
}
