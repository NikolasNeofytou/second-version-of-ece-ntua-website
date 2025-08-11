"use client";
import { useState, useMemo } from 'react';

export interface CourseFilterState {
  q: string;
  semester: string;
  type: string;
}

interface Props {
  courses: { code: string; title: string; credits: number; semester: number; type: 'CORE'|'ELECTIVE' }[];
  onFilter: (filtered: Props['courses']) => void;
}

export function CourseFilters({ courses, onFilter }: Props) {
  const [q,setQ] = useState('');
  const [semester,setSemester] = useState('');
  const [type,setType] = useState('');

  const filtered = useMemo(()=> {
    return courses.filter(c => {
      if (q) {
        const needle = q.toLowerCase();
        if (!c.code.toLowerCase().includes(needle) && !c.title.toLowerCase().includes(needle)) return false;
      }
      if (semester && String(c.semester) !== semester) return false;
      if (type && c.type !== type) return false;
      return true;
    });
  }, [q, semester, type, courses]);

  // push results upward
  useMemo(()=> { onFilter(filtered); }, [filtered, onFilter]);

  const semesters = Array.from(new Set(courses.map(c=>c.semester))).sort((a,b)=>a-b);

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">Search</label>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="code or title" className="px-2 py-1 rounded border bg-[var(--color-surface-alt)] border-[var(--color-border)] text-sm" />
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">Semester</label>
        <select value={semester} onChange={e=>setSemester(e.target.value)} className="px-2 py-1 rounded border bg-[var(--color-surface-alt)] border-[var(--color-border)] text-sm">
          <option value="">All</option>
          {semesters.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">Type</label>
        <select value={type} onChange={e=>setType(e.target.value)} className="px-2 py-1 rounded border bg-[var(--color-surface-alt)] border-[var(--color-border)] text-sm">
          <option value="">All</option>
          <option value="CORE">CORE</option>
          <option value="ELECTIVE">ELECTIVE</option>
        </select>
      </div>
      {(q || semester || type) && (
        <button onClick={()=>{setQ('');setSemester('');setType('');}} className="text-xs text-[var(--color-accent)] hover:underline">Reset</button>
      )}
      <div className="ml-auto text-xs text-[var(--color-text-secondary)]">{filtered.length} / {courses.length} shown</div>
    </div>
  );
}
