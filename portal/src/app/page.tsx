import Card from "../components/Card";

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]">
          ECE NTUA Student Portal
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Central hub for announcements, collaboration tools, study resources and the student network.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a href="/announcements" className="btn-primary">Latest Announcements</a>
          <a href="/lab-partners" className="btn-primary bg-[var(--color-accent)] border-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]">Find Lab Partners</a>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Quick Access</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Announcements" href="/announcements">
            Stay up to date with official department news & updates.
          </Card>
          <Card title="Lab Partners" href="/lab-partners">
            Match with peers for lab assignments and group projects.
          </Card>
          <Card title="Semester Calendar" href="/calendar">
            Download and subscribe to the academic schedule (ICS file).
          </Card>
          <Card title="Past Exam Papers" href="/past-papers">
            Browse and download previous exams for revision.
          </Card>
          <Card title="Student Network" href="/network">
            Coming soon: profiles, messaging, and study circles.
          </Card>
          <Card title="Theme Toggle" interactive={false}>
            Use the top‑right toggle to switch between dark and light themes.
          </Card>
        </div>
      </section>

      {/* Announcements Preview Placeholder */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Latest Announcements</h2>
          <a href="/announcements" className="text-sm text-[var(--color-accent)] hover:underline">View all</a>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Welcome to the new portal" href="/announcements" className="bg-[var(--color-surface-alt)]">
            We are launching an early version; features will roll out weekly. Share feedback to help prioritize.
          </Card>
          <Card title="Exam period schedule posted" href="/announcements">
            The updated exam timetable has been added to the calendar feed and PDF listing.
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Resources</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card title="Study Tips" interactive={false}>
            Organize weekly review sessions. Practice with past papers under timed conditions. Form small peer groups.
          </Card>
          <Card title="Contribute" href="https://github.com" className="border-dashed">
            This portal is open source. Contribute improvements, translations or new tools on GitHub.
          </Card>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden rounded-lg border border-[var(--color-border)] p-8 md:p-10 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-alt)] flex flex-col md:flex-row items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-semibold">Help shape the platform</h2>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Suggest or vote on upcoming features like timetable personalization, course planning, and peer Q&A.</p>
        </div>
        <a href="https://github.com" className="btn-primary whitespace-nowrap">Give Feedback</a>
      </section>
    </div>
  );
}
