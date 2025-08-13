"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Album { id: string; title: string }
interface MediaItem { id: string; baseUrl: string; mimeType: string; filename?: string }

export default function PhotosBrowser({ defaultAlbumId, lockToAlbum = false }: { defaultAlbumId?: string; lockToAlbum?: boolean }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      if (lockToAlbum && defaultAlbumId) {
        await loadAlbum(defaultAlbumId);
        return;
      }
      try {
        const res = await fetch('/api/photos/albums');
        const data = await res.json();
        if (res.ok) setAlbums(data.albums ?? []);
        else setError((data as { error?: string }).error || 'Failed to load albums');
        if (defaultAlbumId) {
          // Preload default album items
          await loadAlbum(defaultAlbumId);
        }
      } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load albums'); }
    })();
  }, [defaultAlbumId, lockToAlbum]);

  async function loadAlbum(id: string) {
    setSelectedAlbum(id);
    setSelected({});
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos?albumId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (res.ok) setMediaItems(data.mediaItems ?? []);
      else setError((data as { error?: string }).error || 'Failed to load photos');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load photos'); }
    finally { setLoading(false); }
  }

  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function copySelected() {
    const urls = mediaItems.filter(m => selected[m.id]).map(m => `${m.baseUrl}=d`);
    if (!urls.length) return;
    await navigator.clipboard.writeText(urls.join('\n'));
    // simple feedback
    setError(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {!lockToAlbum && (
      <div className="lg:col-span-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]/60 backdrop-blur-sm p-4">
          <h2 className="font-medium mb-3">Albums</h2>
          <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
            {albums.map(a => (
              <button key={a.id} onClick={() => loadAlbum(a.id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedAlbum === a.id ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'hover:bg-white/5'}`}>
                {a.title || 'Untitled album'}
              </button>
            ))}
            {!albums.length && <p className="text-sm text-[var(--color-text-secondary)]">No albums found. Ensure your Google account has albums.</p>}
          </div>
        </div>
      </div>
      )}
      <div className={lockToAlbum ? 'lg:col-span-12' : 'lg:col-span-8'}>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]/60 backdrop-blur-sm p-4">
          <h2 className="font-medium mb-3">Photos {selectedAlbum ? '' : '(select an album)'}</h2>
          {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
          {loading && <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>}
          {mediaItems.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[var(--color-text-secondary)]">Selected {Object.values(selected).filter(Boolean).length} / {mediaItems.length}</p>
              <div className="flex gap-2">
                <button onClick={() => setSelected({})} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm">Clear</button>
                <button onClick={copySelected} className="px-3 py-1.5 rounded-md bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 text-[var(--color-accent)] text-sm">Copy URLs</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {mediaItems.map(mi => {
              const isSelected = !!selected[mi.id];
              return (
                <button key={mi.id} type="button" onClick={() => toggleSelect(mi.id)} className={`relative aspect-square rounded-lg overflow-hidden bg-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${isSelected ? 'ring-2 ring-[var(--color-accent)]' : ''}`}>
                  <Image src={`${mi.baseUrl}=w400-h400`} alt={mi.filename || 'Photo'} fill className="object-cover" />
                  {isSelected && <div className="absolute inset-0 bg-[var(--color-accent)]/20" />}
                </button>
              );
            })}
          </div>
          {!loading && selectedAlbum && !mediaItems.length && <p className="text-sm text-[var(--color-text-secondary)]">No photos in this album.</p>}
        </div>
      </div>
    </div>
  );
}
