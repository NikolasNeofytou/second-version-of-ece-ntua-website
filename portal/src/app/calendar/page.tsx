import fs from 'node:fs';
import path from 'node:path';
import { seo } from '../../lib/seo';
import { parseICS, CalendarEvent, distinctCategories } from '../../lib/calendar';
import { ClientCalendar } from './ClientCalendar';
export const metadata = seo('Academic Calendar', 'Key academic dates (interactive multi‑month view).');

export default async function CalendarPage() {
  const icsPath = path.join(process.cwd(), 'public', 'calendar.ics');
  let events: CalendarEvent[] = [];
  try {
    const raw = fs.readFileSync(icsPath, 'utf8');
    events = parseICS(raw);
  } catch {}
  const categories = distinctCategories(events);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Academic Calendar</h1>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-prose">Lightweight server-side parse of the ICS file. Download the <a href="/calendar.ics" className="underline hover:text-[var(--color-accent)]" download>calendar.ics</a> to subscribe. A richer multi-month interactive view can follow later.</p>
      </header>
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Interactive View</h2>
        <ClientCalendar events={events} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Upcoming Events</h2>
        {events.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">No events found in ICS.</p>}
        <ul className="space-y-2">
          {events.slice(0,15).map(ev => {
            const date = `${ev.start.slice(0,4)}-${ev.start.slice(4,6)}-${ev.start.slice(6,8)}`;
            return (
              <li key={ev.uid} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-[var(--color-text-secondary)] w-28">{date}</span>
                <span className="flex-1">{ev.summary}</span>
                <span className="px-2 py-0.5 rounded text-[10px] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">{ev.category}</span>
              </li>
            );
          })}
        </ul>
        {categories.length > 0 && (
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">Categories: {categories.join(', ')}</p>
        )}
      </section>
    </div>
  );
}
