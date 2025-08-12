"use client";
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CourseIcon from './CourseIcon';
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
          <div key={flow.id} className="flow-card group">
            <div className="bg-image">
              <Image src={flow.image} alt={flow.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
            <div className="blob blob1" />
            <div className="blob blob2" />
            <div className="overlay" />
            <div className="content">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] drop-shadow-sm">{flow.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-3">{flow.description}</p>
              </div>
              <Link href={`/flows/${flow.id}`} className="mt-4 inline-block px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white text-xs font-semibold shadow hover:bg-[var(--color-accent-alt)] transition">View Flow</Link>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .flow-card{
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          box-shadow: 0 10px 24px rgba(0,0,0,0.08);
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .flow-card:hover{ transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.10); }
        .bg-image{ position:absolute; inset:0; }
        .bg-image :global(img){ width:100%; height:100%; object-fit:cover; transform: scale(1.08); filter: saturate(.9) contrast(.9) brightness(.95); }
        .overlay{ position:absolute; inset:0; background: linear-gradient(to top, var(--color-bg) 70%, transparent); opacity: .75; }
        .content{ position:relative; z-index:2; padding: 1.25rem 1.5rem; height: 13rem; display:flex; flex-direction:column; justify-content:space-between; }
        .blob{ position:absolute; width:140%; height:140%; left:-20%; top:-20%; filter: blur(40px); pointer-events:none; z-index:1; }
        .blob1{ background: radial-gradient(35% 35% at 30% 30%, var(--color-accent) 0%, transparent 60%); opacity:.14; animation: float1 16s ease-in-out infinite alternate; }
        .blob2{ background: radial-gradient(35% 35% at 70% 70%, var(--color-accent) 0%, transparent 60%); opacity:.10; animation: float2 18s ease-in-out infinite alternate; }
        @keyframes float1 { from { transform: translate(-2%, -1%) scale(1.0) rotate(0deg); } to { transform: translate(2%, 3%) scale(1.05) rotate(8deg); } }
        @keyframes float2 { from { transform: translate(3%, 2%) scale(1.0) rotate(0deg); } to { transform: translate(-3%, -4%) scale(1.07) rotate(-6deg); } }
      `}</style>

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
                    <CourseIcon code={c.code} title={c.title} type={c.type} />
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
