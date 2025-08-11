/* Simple scraper to pull latest announcements from the public ECE NTUA announcements page.
   NOTE: For production, prefer an official RSS/JSON feed if available, add caching, rate limiting, and
   respect robots.txt / site policies. */
const fetch = global.fetch || ((...args) => import('node-fetch').then(m => m.default(...args)));
const cheerio = require('cheerio');

async function run() {
  const url = 'https://www.ece.ntua.gr/gr/announcements';
  const res = await fetch(url, { headers: { 'User-Agent': 'ECE-Portal/1.0 (+student project)' } });
  if (!res.ok) throw new Error('Failed to fetch page: ' + res.status);
  const html = await res.text();
  const $ = cheerio.load(html);
  const items = [];
  // This selector may need adjustment depending on actual DOM structure.
  $('article, .announcement, .clearfix').each((_, el) => {
    const title = $(el).find('h3, h2, a.title').first().text().trim();
    if (!title) return;
    const link = $(el).find('a').first().attr('href') || '';
    const date = $(el).find('time').attr('datetime') || $(el).find('.date').text().trim();
    const summary = $(el).find('p').first().text().trim();
    if (items.length < 15) {
      items.push({ title, link: link.startsWith('http') ? link : (new URL(link, url)).toString(), date, summary });
    }
  });
  console.log(JSON.stringify({ source: url, fetchedAt: new Date().toISOString(), count: items.length, items }, null, 2));
}
run().catch(e => { console.error(e); process.exit(1); });
