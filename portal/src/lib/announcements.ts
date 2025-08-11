import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';

export interface AnnouncementRaw {
  title: string;
  link: string;
  date?: string;
  category?: string;
}

export interface Announcement extends AnnouncementRaw {
  dateObj: Date | null;
}

interface CacheEntry {
  fetchedAt: number; // ms epoch
  items: AnnouncementRaw[];
}

// In-memory global cache survives across requests within same server runtime
const CACHE_KEY = '__ANNOUNCEMENTS_CACHE__';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (align with ISR revalidate)
const PERSIST_PATH = path.join(process.cwd(), '.next', 'cache', 'announcements-latest.json');

declare global {
  var __ANNOUNCEMENTS_CACHE__: CacheEntry | undefined;
}

export function parseAnnouncements(html: string, baseUrl: string): AnnouncementRaw[] {
  const $ = cheerio.load(html);
  const rows = $('div.announcements-list table tbody tr.clickable-row');
  const items: AnnouncementRaw[] = [];
  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 3) return;
    const date = $(tds[0]).text().trim();
    const titleAnchor = $(tds[1]).find('a').first();
    const rawTitle = titleAnchor.text().trim().replace(/\s+/g, ' ');
    const title = rawTitle.replace(/^\uF0C8\s*/, ''); // remove decorative icon
    const linkRaw = titleAnchor.attr('href') || '';
    const category = $(tds[2]).text().trim();
    const link = linkRaw.startsWith('http') ? linkRaw : new URL(linkRaw, baseUrl).toString();
    if (title) items.push({ title, link, date, category });
    if (items.length >= 100) return false; // cap
  });
  return items;
}

function attachDate(items: AnnouncementRaw[]): Announcement[] {
  return items.map(it => {
    let d: Date | null = null;
    if (it.date) {
      const m = it.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (m) {
        const [, dd, mm, yyyy] = m;
        d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
    }
    return { ...it, dateObj: d };
  });
}

export async function fetchAndCacheAnnouncements(): Promise<Announcement[]> {
  const now = Date.now();
  const existing = globalThis[CACHE_KEY];
  if (existing && (now - existing.fetchedAt) < CACHE_TTL_MS) {
    return attachDate(existing.items);
  }
  const url = 'https://www.ece.ntua.gr/gr/announcements';
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error('Bad status ' + res.status);
    const html = await res.text();
    const parsed = parseAnnouncements(html, url);
    globalThis[CACHE_KEY] = { fetchedAt: now, items: parsed };
    // persist
    try {
      await fs.mkdir(path.dirname(PERSIST_PATH), { recursive: true });
      await fs.writeFile(PERSIST_PATH, JSON.stringify({ fetchedAt: now, items: parsed }, null, 2));
    } catch {}
    return attachDate(parsed);
  } catch (err) {
    if (existing) {
      return attachDate(existing.items);
    }
    // try disk fallback
    try {
      const raw = await fs.readFile(PERSIST_PATH, 'utf-8');
      const data = JSON.parse(raw) as { items: AnnouncementRaw[] };
      return attachDate(data.items);
    } catch {}
    throw err;
  }
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
