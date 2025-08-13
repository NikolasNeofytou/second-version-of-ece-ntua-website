import { BackgroundProvider } from '@/components/BackgroundProvider';
import { seo } from '@/lib/seo';
import { load } from 'cheerio';

export const metadata = seo('Read Post', 'Read this Substack post inside the site.');

function isAllowedSubstackUrl(u: string) {
  try {
    const url = new URL(u);
    return url.hostname.includes('substack.com');
  } catch { return false; }
}

function sanitizeHtml(html: string): string {
  const $ = load(html);
  // remove scripts, styles, iframes, forms
  $('script, style, noscript, iframe, form').remove();
  // remove event handlers and javascript: URLs
    $('[onload], [onclick], [onerror], [onmouseover], [onfocus], [oninput], [onchange]').each((_, el) => {
      const attribs = (el as unknown as { attribs?: Record<string, string> }).attribs || {};
    Object.keys(attribs).forEach((name) => {
      if (name.toLowerCase().startsWith('on')) $(el).removeAttr(name);
    });
  });
  $('[href], [src]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const src = $el.attr('src');
    if (href && href.trim().toLowerCase().startsWith('javascript:')) $el.removeAttr('href');
    if (src && src.trim().toLowerCase().startsWith('javascript:')) $el.removeAttr('src');
  });
  return $.html();
}

export default async function ReadPage(props: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await props.searchParams;
  if (!url || !isAllowedSubstackUrl(url)) {
    return (
      <BackgroundProvider variant="subtle">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-semibold mb-4">Invalid URL</h1>
          <p className="text-[var(--color-text-secondary)]">Provide a valid Substack post URL.</p>
        </div>
      </BackgroundProvider>
    );
  }
  let title = 'Post';
  let contentHtml = '';
  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = load(html);
    title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || title;
    const main = $('article').first().html() || $('main').first().html() || $('#main').first().html() || ($('.post').first().html() as string | undefined) || '';
    contentHtml = sanitizeHtml(main || html);
  } catch (e) {
    contentHtml = `<p class="text-[var(--color-text-secondary)]">Failed to load content. You can <a href="${url}" target="_blank" rel="noopener noreferrer" class="underline">open on Substack</a>.</p>`;
  }
  return (
    <BackgroundProvider variant="subtle">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 text-[var(--color-accent)] text-sm">Open on Substack</a>
        </div>
        <div className="prose prose-invert max-w-none rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]/60 backdrop-blur-sm p-5" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </BackgroundProvider>
  );
}
