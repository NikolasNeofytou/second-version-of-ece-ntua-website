import ClientNetwork from './ClientNetwork';
import { sampleProfiles } from '../../lib/network';

export const dynamic = 'force-static';

export default async function Network() {
  // In future: fetch authenticated user + real data.
  const profiles = sampleProfiles; // static for now
  return (
    <section className="space-y-8" aria-labelledby="network-heading">
      <header className="space-y-3">
        <h1 id="network-heading" className="text-2xl font-bold tracking-tight">Student Network</h1>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-prose">
          Discover peers by interests, skills, and year. This early preview uses sample data only; authentication and profile editing coming soon.
        </p>
      </header>
      <ClientNetwork initialProfiles={profiles} />
    </section>
  );
}
