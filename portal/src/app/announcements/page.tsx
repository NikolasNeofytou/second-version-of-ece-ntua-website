import Link from "next/link";
import { cache } from "react";
import * as cheerio from "cheerio";

const fetchAnnouncements = cache(async () => {
  const url = "https://www.ece.ntua.gr/gr/announcements";
  const res = await fetch(url, { next: { revalidate: 1800 } }); // 30 min
  if (!res.ok) throw new Error("Failed to fetch announcements");
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows = $("div.announcements-list table tbody tr.clickable-row");
  const items: { title: string; link: string; date?: string; category?: string }[] = [];
  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 3) return;
    const date = $(tds[0]).text().trim();
    const titleAnchor = $(tds[1]).find('a').first();
    const rawTitle = titleAnchor.text().trim().replace(/\s+/g,' ');
    const title = rawTitle.replace(/^\uF0C8\s*/,''); // remove icon if any
    const linkRaw = titleAnchor.attr('href') || '';
    const category = $(tds[2]).text().trim();
    const link = linkRaw.startsWith('http') ? linkRaw : new URL(linkRaw, url).toString();
    if (title) items.push({ title, link, date, category });
    if (items.length >= 25) return false;
  });
  return items;
});

export default async function Announcements({ searchParams }: { searchParams?: { category?: string } }) {
  let items: Awaited<ReturnType<typeof fetchAnnouncements>> = [];
  let error: string | null = null;
  try {
    items = await fetchAnnouncements();
  } catch (e: unknown) {
    if (e instanceof Error) error = e.message; else error = "Error loading announcements";
  }

  const selectedCategory = searchParams?.category ? decodeURIComponent(searchParams.category) : undefined;

  // Parse DD/MM/YYYY to Date, filter last 28 days
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const parsed = items.map(it => {
    let d: Date | null = null;
    if (it.date) {
      const m = it.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (m) {
        const dd = m[1];
        const mm = m[2];
        const yyyy = m[3];
        d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
    }
    return { ...it, dateObj: d };
  }).filter(it => it.dateObj && it.dateObj >= fourWeeksAgo) as (typeof items[0] & { dateObj: Date })[];

  // Unique categories (from filtered set) for pills
  const categories = Array.from(new Set(parsed.map(i => i.category).filter(Boolean))) as string[];

  const categoryFiltered = selectedCategory ? parsed.filter(i => i.category === selectedCategory) : parsed;

  // Group by ISO week number (YYYY-Www)
  function isoWeekKey(d: Date) {
    const temp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  const groups: Record<string, (typeof categoryFiltered)[0][]> = {};
  for (const it of categoryFiltered) {
    const key = isoWeekKey(it.dateObj);
    (groups[key] ||= []).push(it);
  }
  const orderedKeys = Object.keys(groups).sort().reverse();

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Last 4 weeks (grouped by week). Source: official ECE NTUA site. Auto-refreshed every 30 minutes.</p>
        </div>
        {categories.length > 0 && (
          <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
            <a href="/announcements" className={`px-3 py-1 rounded-full text-xs font-medium border transition ${!selectedCategory ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary-active)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'}`}>All</a>
            {categories.map(cat => {
              const active = cat === selectedCategory;
              const href = `/announcements?category=${encodeURIComponent(cat)}`;
              return (
                <a key={cat} href={href} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${active ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary-active)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'}`}>{cat}</a>
              );
            })}
          </nav>
        )}
        {selectedCategory && (
          <p className="text-xs text-[var(--color-text-muted)]">Filtering by: <strong className="text-[var(--color-text-secondary)]">{selectedCategory}</strong></p>
        )}
      </header>
      {error && <p className="text-[var(--color-error)]">{error}</p>}
      {!error && orderedKeys.length === 0 && <p>No announcements in last 4 weeks{selectedCategory ? ' for this category' : ''}.</p>}
      <div className="space-y-12">
        {orderedKeys.map(week => {
          const weekItems = groups[week].sort((a,b) => b.dateObj.getTime() - a.dateObj.getTime());
          const [year, wk] = week.split('-W');
          return (
            <section key={week} className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-3">
                <span>Week {wk}</span>
                <span className="text-xs font-normal text-[var(--color-text-muted)]">{year}</span>
              </h2>
              <ul className="space-y-4">
                {weekItems.map((item, i) => (
                  <li key={i} className="card">
                    <h3 className="font-medium text-base mb-1">
                      <Link href={item.link} target="_blank" className="hover:text-[var(--color-accent)] underline-offset-4 hover:underline">
                        {item.title}
                      </Link>
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center text-xs text-[var(--color-text-muted)] mb-1">
                      <time className="font-mono">{item.date}</time>
                      {item.category && <span className="px-2 py-0.5 rounded-sm bg-[var(--color-primary-soft)] text-[var(--color-text-secondary)] text-[10px] uppercase tracking-wide">{item.category}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
