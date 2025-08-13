import { seo } from '@/lib/seo';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import { fetchSubstackPosts } from '@/lib/substack';
import Image from 'next/image';

export const metadata = seo('Blog', 'Latest posts from Nikolas Neofytou on Substack.');

export default async function BlogPage() {
  const handle = process.env.NEXT_PUBLIC_SUBSTACK_HANDLE || '@nikolasneofytou';
  let posts: Awaited<ReturnType<typeof fetchSubstackPosts>> = [];
  let error: string | null = null;
  try {
    posts = await fetchSubstackPosts(handle, 12);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load posts';
  }
  const publicUrl = handle.startsWith('@') ? `https://substack.com/@${handle.replace(/^@/, '')}` : (handle.startsWith('http') ? handle : `https://${handle}.substack.com`);
  return (
    <BackgroundProvider variant="subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
            <p className="text-[var(--color-text-secondary)]">Posts from <a href={publicUrl} className="underline hover:text-[var(--color-accent)]" target="_blank" rel="noopener noreferrer">Substack</a>.</p>
          </div>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 text-[var(--color-accent)] text-sm">View on Substack</a>
        </div>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <div key={p.link} className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]/60 backdrop-blur-sm overflow-hidden hover:border-[var(--color-accent)]/40 transition-colors">
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-video bg-black/20">
                  {p.image ? (
                    <Image src={p.image} alt={p.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[var(--color-text-secondary)] text-sm">No image</div>
                  )}
                </div>
              </a>
              <div className="p-4">
                <h3 className="font-medium mb-1 group-hover:text-[var(--color-accent)]">{p.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">{p.excerpt}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-2">{new Date(p.publishedAt).toLocaleDateString()}</p>
                <div className="mt-3 flex gap-2">
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-sm underline hover:text-[var(--color-accent)]">Open on Substack</a>
                  <a href={`/blog/read?url=${encodeURIComponent(p.link)}`} className="text-sm underline hover:text-[var(--color-accent)]">Read here</a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!error && posts.length === 0 && (
          <p className="text-sm text-[var(--color-text-secondary)]">No posts found. Visit <a href={publicUrl} className="underline" target="_blank" rel="noopener noreferrer">Substack</a>.</p>
        )}
      </div>
    </BackgroundProvider>
  );
}
