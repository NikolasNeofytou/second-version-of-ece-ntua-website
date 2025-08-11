"use client";
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CourseFilters } from './CourseFilters';

export type CourseLike = { code: string; title: string; credits: number; semester: number; type: 'CORE' | 'ELECTIVE' };

interface Props { courses: CourseLike[]; pageSize?: number }

export function CoursesBrowser({ courses, pageSize = 10 }: Props) {
  const [filtered, setFiltered] = useState<CourseLike[]>(courses);
  const [page, setPage] = useState(1);

  const onFilter = useCallback((list: CourseLike[]) => {
    setFiltered(list);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const span = 3;
    const from = Math.max(1, clampedPage - span);
    const to = Math.min(totalPages, clampedPage + span);
    for (let i = from; i <= to; i++) pages.push(i);
    return pages;
  }, [clampedPage, totalPages]);

  return (
    <div className="space-y-4">
      <CourseFilters courses={courses} onFilter={onFilter} />
      <div className="overflow-x-auto border rounded-md border-[var(--color-border)]">
        <table className="w-full text-left text-sm border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)]/50">
              <th className="py-2 px-4">Code</th>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Sem</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">ECTS</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-text-secondary)]">No courses match current filters.</td>
              </tr>
            )}
            {pageItems.map(c => (
              <tr key={c.code} className="group relative border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)] focus-within:bg-[var(--color-surface-alt)]">
                <td className="py-2 px-4 font-mono"><span className="group-hover:text-[var(--color-accent)]">{c.code}</span></td>
                <td className="py-2 px-4 max-w-[380px]"><span className="line-clamp-2 group-hover:text-[var(--color-accent)]">{c.title}</span></td>
                <td className="py-2 px-4">{c.semester}</td>
                <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide border ${c.type === 'CORE' ? 'bg-[var(--color-accent-muted)]/30 border-[var(--color-accent-muted)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-alt)] border-[var(--color-border)]'}`}>{c.type}</span></td>
                <td className="py-2 px-4">{c.credits}</td>
                <td className="absolute inset-0"><Link aria-label={`View ${c.code}`} className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" href={`/courses/${c.code}`}></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="text-xs text-[var(--color-text-secondary)]">
          Showing {filtered.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button onClick={()=>goto(1)} disabled={clampedPage===1} className="px-2 py-1 rounded border border-[var(--color-border)] disabled:opacity-40">«</button>
          <button onClick={()=>goto(clampedPage-1)} disabled={clampedPage===1} className="px-2 py-1 rounded border border-[var(--color-border)] disabled:opacity-40">Prev</button>
          {visiblePages[0] > 1 && <span className="px-1">…</span>}
          {visiblePages.map(p => (
            <button key={p} onClick={()=>goto(p)} className={`px-2 py-1 rounded border text-xs ${p===clampedPage ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]'}`}>{p}</button>
          ))}
          {visiblePages[visiblePages.length-1] < totalPages && <span className="px-1">…</span>}
          <button onClick={()=>goto(clampedPage+1)} disabled={clampedPage===totalPages} className="px-2 py-1 rounded border border-[var(--color-border)] disabled:opacity-40">Next</button>
          <button onClick={()=>goto(totalPages)} disabled={clampedPage===totalPages} className="px-2 py-1 rounded border border-[var(--color-border)] disabled:opacity-40">»</button>
        </div>
      </div>
    </div>
  );
}
