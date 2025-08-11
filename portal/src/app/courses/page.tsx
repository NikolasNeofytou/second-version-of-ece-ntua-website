// DB-backed listing (falls back to mock data if seeding not yet run)
import { listCourses } from '../../lib/courses';
import { CoursesBrowser, CourseLike } from './CoursesBrowser';
import { courses as mockCourses } from '../../lib/mock-data';
import { seo } from '../../lib/seo';
export const metadata = seo('Courses', 'Course catalog overview.');

export default async function CourseCatalog() {
  let dbCourses: CourseLike[] = [];
  try { dbCourses = await listCourses() as unknown as CourseLike[]; } catch { dbCourses = mockCourses as CourseLike[]; }
  const data: CourseLike[] = dbCourses.length ? dbCourses : (mockCourses as CourseLike[]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Course Catalog</h1>
  <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Browse, filter and paginate the curriculum subset. Data will be expanded later.</p>
  <CoursesBrowser courses={data} />
    </div>
  );
}
