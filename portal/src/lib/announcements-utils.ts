// filepath: /Users/nikolasneofytou/Documents/GitHub/second-version-of-ece-ntua-website/portal/src/lib/announcements-utils.ts
// Node-safe (no fs/path/cheerio) shared utilities & types for announcements.

export interface AnnouncementRaw {
  title: string;
  link: string;
  date?: string;
  category?: string;
}

export interface Announcement extends AnnouncementRaw {
  dateObj: Date | null;
}

export function filterRecentWeeks(items: Announcement[], weeks = 4): Announcement[] {
  if (!weeks) return items;
  const now = new Date();
  const cutoff = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  return items.filter(i => i.dateObj && i.dateObj >= cutoff);
}

export function groupByISOWeek(items: Announcement[]) {
  function isoWeekKey(d: Date) {
    const temp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
  const groups: Record<string, Announcement[]> = {};
  for (const it of items) {
    if (!it.dateObj) continue;
    const key = isoWeekKey(it.dateObj);
    (groups[key] ||= []).push(it);
  }
  const orderedKeys = Object.keys(groups).sort().reverse();
  return { groups, orderedKeys };
}

export function extractCategories(items: Announcement[]): string[] {
  return Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
}
