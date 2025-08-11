import { notFound } from 'next/navigation';
import { departments } from '../../../lib/mock-data';

interface Props { params: { slug: string } }

export default function DepartmentDetail({ params }: Props) {
  const dept = departments.find(d => d.slug === params.slug);
  if (!dept) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{dept.name}</h1>
      <p className="text-[var(--color-text-secondary)] max-w-3xl text-sm md:text-base">{dept.summary}</p>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Focus Areas</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">(Placeholder content) Research clusters, labs, and strategic initiatives will appear here.</p>
      </section>
    </div>
  );
}
