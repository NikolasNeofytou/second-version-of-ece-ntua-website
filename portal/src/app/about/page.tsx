import { seo } from '../../lib/seo';
export const metadata = seo('About', 'About the ECE NTUA student portal.');

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">About the Portal</h1>
      <p className="text-[var(--color-text-secondary)] max-w-3xl text-sm md:text-base">This portal consolidates academic tools, collaboration features, and departmental information into one modern interface. It is an evolving, student‑centric platform – contributions and feedback are welcome.</p>
      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <h2 className="font-medium mb-1">Mission</h2>
          <p className="text-[var(--color-text-secondary)]">Improve access to resources, reduce friction in collaboration, and highlight academic activity.</p>
        </div>
        <div className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <h2 className="font-medium mb-1">Principles</h2>
          <p className="text-[var(--color-text-secondary)]">Privacy by default, incremental openness, accessible UI, and extensibility.</p>
        </div>
        <div className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <h2 className="font-medium mb-1">Status</h2>
          <p className="text-[var(--color-text-secondary)]">Early alpha – core profile & announcements functional; more modules coming.</p>
        </div>
      </div>
    </div>
  );
}
