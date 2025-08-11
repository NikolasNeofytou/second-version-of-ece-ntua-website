'use client';
import { useEffect } from 'react';

export default function AnnouncementsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Announcements error:', error);
  }, [error]);
  return (
    <div className="space-y-4" role="alert">
      <h1 className="text-xl font-semibold text-[var(--color-error)]">Failed to load announcements</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">{error.message}</p>
      <button onClick={() => reset()} className="btn-primary text-sm">Retry</button>
    </div>
  );
}
