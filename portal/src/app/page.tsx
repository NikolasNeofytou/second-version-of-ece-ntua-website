export default function Home() {
  return (
    <section className="text-center space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">ECE NTUA Student Portal</h1>
        <p className="text-[var(--color-text-secondary)]">Everything you need for a successful semester.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
        <a href="/announcements" className="card group">
          <h2 className="font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Announcements</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Stay up to date with official news.</p>
        </a>
        <a href="/lab-partners" className="card group">
          <h2 className="font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Lab Partners</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Find classmates to collaborate with.</p>
        </a>
        <a href="/calendar" className="card group">
          <h2 className="font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Calendar</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Add the semester schedule to your calendar.</p>
        </a>
        <a href="/past-papers" className="card group">
          <h2 className="font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Past Papers</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Review previous exam papers.</p>
        </a>
        <a href="/network" className="card group">
          <h2 className="font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">Student Network</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Connect via IEEE or Google sign‑in (coming soon).</p>
        </a>
      </div>
    </section>
  );
}
