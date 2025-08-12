"use client";
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CourseFilters } from './CourseFilters';

// Example flows for integrated master (replace with real data as needed)
const flows = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'Courses and electives focused on AI, machine learning, and data science.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'circuits',
    name: 'Circuits & Systems',
    description: 'Integrated circuits, analog/digital systems, and hardware design.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'networks',
    name: 'Networks & Security',
    description: 'Networking, cybersecurity, and distributed systems.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'robotics',
    name: 'Robotics & Automation',
    description: 'Robotics, control systems, and automation engineering.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  },
];

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

  // Flows grid
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Integrated Master Flows</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flows.map(flow => (
          <div key={flow.id} className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg transition-transform duration-300 hover:-translate-y-1">
            <Image src={flow.image} alt={flow.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 via-[var(--color-bg)]/40 to-transparent" />
            <div className="relative z-10 p-6 flex flex-col h-52 justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] drop-shadow-sm">{flow.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-3">{flow.description}</p>
              </div>
              <Link href={`/flows/${flow.id}`} className="mt-4 inline-block px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white text-xs font-semibold shadow hover:bg-[var(--color-accent-alt)] transition">View Flow</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Courses table */}
      <div className="mt-10 space-y-4">
        <CourseFilters courses={courses} onFilter={onFilter} />
        <div className="overflow-x-auto border rounded-2xl border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <table className="w-full text-left text-sm border-collapse min-w-[720px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)]/70 backdrop-blur">
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Sem</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">ECTS</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[var(--color-text-secondary)]">No courses match current filters.</td>
                </tr>
              )}
              {pageItems.map(c => (
                <tr key={c.code} className="group relative border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)]/60 focus-within:bg-[var(--color-surface-alt)]/60 transition cursor-pointer" title={c.title} onClick={()=>window.location.href=`/courses/${c.code}`}>
                  <td className="py-2 px-4">
                    <Image src={`https://source.unsplash.com/64x64/?${encodeURIComponent(c.title)}`} alt="preview" width={48} height={48} className="rounded-md object-cover border border-[var(--color-border)] shadow-sm" />
                  </td>
                  <td className="py-2 px-4 font-mono"><span className="group-hover:text-[var(--color-accent)]">{c.code}</span></td>
                  <td className="py-2 px-4 max-w-[420px]">
                    <span className="line-clamp-2 group-hover:text-[var(--color-accent)]" title={c.title}>{c.title}</span>
                  </td>
                  <td className="py-2 px-4">{c.semester}</td>
                  <td className="py-2 px-4">
                    {c.type === 'CORE' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide border bg-[var(--color-accent-muted)]/30 border-[var(--color-accent-muted)] text-[var(--color-accent)]">
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" /><path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Core
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide border bg-[var(--color-surface-alt)] border-[var(--color-border)]">
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" /></svg>
                        Elective
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">{c.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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
    </div>
  );
}
