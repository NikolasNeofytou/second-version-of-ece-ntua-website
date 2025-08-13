import { requireAuth } from '@/lib/require-auth';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import PhotosBrowser from './photos-browser';
import { seo } from '@/lib/seo';

export const metadata = seo('Photos', 'Browse Google Photos albums and select images.');

export default async function PhotosPage() {
  await requireAuth('/photos');
  const defaultAlbumId = process.env.NEXT_PUBLIC_GOOGLE_PHOTOS_ALBUM_ID || undefined;
  const lockToAlbum = process.env.NEXT_PUBLIC_GOOGLE_PHOTOS_LOCK === '1';
  return (
    <BackgroundProvider variant="subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-6">Photos</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">Select images from your Google Photos{defaultAlbumId ? ' (restricted album)' : ' albums'}.</p>
        <PhotosBrowser defaultAlbumId={defaultAlbumId} lockToAlbum={lockToAlbum} />
      </div>
    </BackgroundProvider>
  );
}
