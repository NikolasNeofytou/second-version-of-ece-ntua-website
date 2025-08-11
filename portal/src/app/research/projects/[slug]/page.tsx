import { notFound } from 'next/navigation';
import { researchProjects } from '../../../../lib/mock-data';
import { seo } from '../../../../lib/seo';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const proj = researchProjects.find(p => p.slug === params.slug);
  if (!proj) return {};
  return seo(proj.title, proj.blurb);
}

export default function ProjectDetail({ params }: Props) {
  const proj = researchProjects.find(p => p.slug === params.slug);
  if (!proj) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{proj.title}</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-3xl">{proj.blurb}</p>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Research Area</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">{proj.area}</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Next Steps</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">(Placeholder) Integrate publications list, contributor profiles, timeline, and dataset links.</p>
      </section>
    </div>
  );
}
