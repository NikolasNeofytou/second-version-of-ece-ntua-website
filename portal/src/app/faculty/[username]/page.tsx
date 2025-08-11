import { notFound } from 'next/navigation';
import { faculty } from '../../../lib/mock-data';
import Link from 'next/link';

interface Props { params: { username: string } }

export default function FacultyProfile({ params }: Props) {
  const prof = faculty.find(f => f.username === params.username);
  if (!prof) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{prof.name}</h1>
      <p className="text-[var(--color-text-secondary)] text-sm">{prof.title} • {prof.department}</p>
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Interests</h2>
        <ul className="flex flex-wrap gap-2 text-xs">
          {prof.interests.map(i => <li key={i} className="px-2 py-1 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]">{i}</li>)}
        </ul>
      </section>
      <p className="text-[var(--color-text-secondary)] text-xs">(Placeholder) Could merge with user profile at /u/{prof.username} if account exists: <Link href={`/u/${prof.username}`} className="underline hover:text-[var(--color-accent)]">View public profile</Link></p>
    </div>
  );
}
