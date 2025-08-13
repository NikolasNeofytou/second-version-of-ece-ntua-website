import { load, type CheerioAPI } from 'cheerio';

export interface SubstackPost {
  title: string;
  link: string;
  publishedAt: string;
  excerpt: string;
  image?: string | null;
}

function toFeedUrl(handleOrUrl: string): string {
  // Accept full URL or @handle
  if (handleOrUrl.startsWith('http')) return handleOrUrl.replace(/\/$/, '') + (handleOrUrl.endsWith('/feed') ? '' : '/feed');
  if (handleOrUrl.startsWith('@')) return `https://substack.com/feeds/${handleOrUrl}/rss`;
  // handle without @ assumed subdomain
  return `https://${handleOrUrl}.substack.com/feed`;
}

export async function fetchSubstackPosts(handleOrUrl: string, limit = 12): Promise<SubstackPost[]> {
  const url = toFeedUrl(handleOrUrl);
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Failed to fetch Substack feed: ${res.status}`);
  const xml = await res.text();
  const $: CheerioAPI = load(xml, { xmlMode: true });
  const items = $('rss > channel > item').slice(0, limit);
  const posts: SubstackPost[] = [];
  items.each((i: number) => {
    const item = items.eq(i);
    const title = item.find('title').first().text().trim();
    const link = item.find('link').first().text().trim();
    const publishedAt = item.find('pubDate').first().text().trim();
    const desc = item.find('description').first().text().trim();
    const content = item.find('content\\:encoded').first().text();
    let image: string | null = null;
    if (content) {
      const $h = load(content);
      const imgSrc = $h('img').first().attr('src');
      if (imgSrc) image = imgSrc;
    }
    // Fallback: parse image from description if present
    if (!image && desc) {
      const $d = load(desc);
      const imgSrc = $d('img').first().attr('src');
      if (imgSrc) image = imgSrc;
    }
    const excerpt = desc.replace(/<[^>]+>/g, '').slice(0, 220).trim();
    posts.push({ title, link, publishedAt, excerpt, image });
  });
  return posts;
}
