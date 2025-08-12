import { fetchAndCacheAnnouncements, filterRecentWeeks, extractCategories, Announcement } from "../../lib/announcements";
import Pill from "../../components/Pill";
import ClientAnnouncements from "./ClientAnnouncements";

export const revalidate = 1800;

export default async function AnnouncementsPage({ searchParams }: { searchParams?: Promise<{ category?: string; q?: string }> }) {
  const sp = (await searchParams) || {};
  const selectedCategory = sp.category ? decodeURIComponent(sp.category) : undefined;
  const query = sp.q ? decodeURIComponent(sp.q) : '';

  let all: Announcement[] = [];
  let error: string | null = null;
  try {
    all = await fetchAndCacheAnnouncements();
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Error loading announcements';
  }

  const recent = filterRecentWeeks(all, 4).sort((a,b)=> (b.dateObj?.getTime()||0)-(a.dateObj?.getTime()||0));
  const categories = extractCategories(recent);

  return (
    <section className="space-y-10" aria-labelledby="announcements-heading">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 id="announcements-heading" className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Last 4 weeks (grouped by week). Load more to reveal older weeks within the period.</p>
        </div>
        {categories.length > 0 && (
          <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
            <Pill href="/announcements" active={!selectedCategory} aria-current={!selectedCategory? 'page':undefined}>All</Pill>
            {categories.map(cat => (
              <Pill key={cat} href={`/announcements?category=${encodeURIComponent(cat)}${query?`&q=${encodeURIComponent(query)}`:''}`} active={cat===selectedCategory} aria-current={cat===selectedCategory? 'page':undefined}>{cat}</Pill>
            ))}
          </nav>
        )}
        <form role="search" className="flex flex-wrap gap-2 pt-1" action="/announcements" method="get">
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          <input type="text" name="q" placeholder="Search titles..." defaultValue={query} aria-label="Search announcements by title" className="px-3 py-1 rounded-sm text-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]" />
          <button className="btn-primary text-xs" type="submit">Search</button>
          {(query || selectedCategory) && <a href="/announcements" className="text-xs px-3 py-1 rounded-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Reset</a>}
        </form>
        <div aria-live="polite" className="text-xs text-[var(--color-text-muted)]" id="results-status" />
      </header>
      {error && <p role="alert" className="text-[var(--color-error)]">{error}</p>}
      {!error && <ClientAnnouncements all={recent} selectedCategory={selectedCategory} query={query} />}
    </section>
  );
}
