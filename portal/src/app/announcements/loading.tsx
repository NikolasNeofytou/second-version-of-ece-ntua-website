export default function LoadingAnnouncements() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading announcements">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-[var(--color-surface-alt)] rounded" />
        <div className="h-4 w-80 bg-[var(--color-surface-alt)] rounded" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="h-5 w-3/4 bg-[var(--color-surface-alt)] rounded" />
            <div className="flex gap-3">
              <div className="h-3 w-20 bg-[var(--color-surface-alt)] rounded" />
              <div className="h-3 w-16 bg-[var(--color-surface-alt)] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
