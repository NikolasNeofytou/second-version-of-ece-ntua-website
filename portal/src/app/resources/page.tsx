import { seo } from '../../lib/seo';
import { requireAuth } from '../../lib/require-auth';
export const metadata = seo('Resources', 'Central academic resources.');

export default async function ResourcesPage() {
  await requireAuth('/resources');
  const resources = [
    { label: 'Academic Calendar (ICS)', href: '/calendar' },
    { label: 'Past Papers Archive', href: '/past-papers' },
    { label: 'Announcements Feed', href: '/announcements' },
    { label: 'Study Groups (planned)', href: '#' },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Central listing of helpful links. This will expand with search & filtering.</p>
      <ul className="space-y-2 text-sm">
        {resources.map(r => (
          <li key={r.label} className="flex items-center gap-2"><a href={r.href} className="underline hover:text-[var(--color-accent)]">{r.label}</a></li>
        ))}
      </ul>
    </div>
  );
}
